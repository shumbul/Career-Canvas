import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { connectToDatabase } from '../utils/database';
import { generateToken, UserPayload } from '../utils/auth';

export async function authMicrosoft(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Processing Microsoft OAuth request`);

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (request.method === 'OPTIONS') {
        return { status: 200, headers: corsHeaders };
    }

    try {
        const requestBody = await request.text();
        const { code, redirect_uri } = JSON.parse(requestBody);

        // Exchange code for Microsoft token
        const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.MICROSOFT_CLIENT_ID || '',
                client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
                code,
                grant_type: 'authorization_code',
                redirect_uri,
                scope: 'openid profile email'
            })
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenData.access_token) {
            throw new Error('Failed to get access token from Microsoft');
        }

        // Get user profile from Microsoft Graph
        const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });

        const profile = await profileResponse.json();
        
        if (!profile.mail && !profile.userPrincipalName) {
            throw new Error('Failed to get user profile from Microsoft');
        }

        const email = profile.mail || profile.userPrincipalName;

        // Store user in database
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');
        
        let user = await usersCollection.findOne({ email });
        
        if (!user) {
            const newUser = {
                email,
                name: profile.displayName,
                picture: null, // Microsoft Graph photo would require additional API call
                provider: 'microsoft',
                microsoftId: profile.id,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await usersCollection.insertOne(newUser);
            user = { ...newUser, _id: result.insertedId };
        } else {
            // Update existing user
            await usersCollection.updateOne(
                { _id: user._id },
                { 
                    $set: { 
                        name: profile.displayName,
                        updatedAt: new Date()
                    }
                }
            );
        }

        // Generate JWT token
        const userPayload: UserPayload = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            provider: 'microsoft',
            picture: user.picture
        };

        const jwtToken = generateToken(userPayload);

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            },
            body: JSON.stringify({
                success: true,
                token: jwtToken,
                user: userPayload
            })
        };

    } catch (error) {
        context.log('Error in Microsoft OAuth:', error);
        
        return {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            },
            body: JSON.stringify({
                success: false,
                error: 'Authentication failed'
            })
        };
    }
}

app.http('authMicrosoft', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: authMicrosoft
});