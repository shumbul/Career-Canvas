import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticateToken } from '../utils/auth';

export async function validateToken(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Validating token`);

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (request.method === 'OPTIONS') {
        return { status: 200, headers: corsHeaders };
    }

    try {
        const user = authenticateToken(request);
        
        if (!user) {
            return {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid or expired token'
                })
            };
        }

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            },
            body: JSON.stringify({
                success: true,
                user
            })
        };

    } catch (error) {
        context.log('Error validating token:', error);
        
        return {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            },
            body: JSON.stringify({
                success: false,
                error: 'Token validation failed'
            })
        };
    }
}

app.http('validateToken', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: validateToken
});