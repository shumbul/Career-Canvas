import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { connectToDatabase } from '../utils/database';
import { generateToken, UserPayload } from '../utils/auth';

export async function authGoogle(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Processing Google OAuth request`);

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
        context.log('Request body:', requestBody);
        
        const { code, redirect_uri } = JSON.parse(requestBody);
        context.log('OAuth params:', { code: code?.substring(0, 20) + '...', redirect_uri });

        // Exchange code for Google token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID || '',
                client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
                code,
                grant_type: 'authorization_code',
                redirect_uri
            })
        });

        const tokenData = await tokenResponse.json();
        context.log('Google token response status:', tokenResponse.status);
        context.log('Google token data:', tokenData);
        
        if (!tokenData.access_token) {
            context.log('Token exchange failed:', tokenData);
            throw new Error(`Failed to get access token from Google: ${JSON.stringify(tokenData)}`);
        }

        // Get user profile from Google
        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });

        const profile = await profileResponse.json();
        
        if (!profile.email) {
            throw new Error('Failed to get user profile from Google');
        }

        // Store user in database
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');
        
        let user = await usersCollection.findOne({ email: profile.email });
        
        if (!user) {
            const newUser = {
                email: profile.email,
                name: profile.name,
                picture: profile.picture,
                provider: 'google',
                googleId: profile.id,
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
                        name: profile.name,
                        picture: profile.picture,
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
            provider: 'google',
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
        context.log('Error in Google OAuth:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        context.log('Error message:', errorMessage);
        
        return {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            },
            body: JSON.stringify({
                success: false,
                error: `Authentication failed: ${errorMessage}`,
                details: error instanceof Error ? error.stack : 'No stack trace'
            })
        };
    }
}

app.http('authGoogle', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: authGoogle
});