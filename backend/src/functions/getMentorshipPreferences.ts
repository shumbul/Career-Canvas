import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { connectToDatabase } from '../utils/database';
import { authenticateToken } from '../utils/auth';

app.http('getMentorshipPreferences', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        context.log('Get mentorship preferences request received');

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            };
        }

        try {
            // Authenticate user
            context.log('Attempting to authenticate user...');
            const user = authenticateToken(request);
            context.log('Authentication result:', user ? 'Success' : 'Failed');
            
            if (!user) {
                context.log('Authentication failed - no valid token');
                return {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        success: false,
                        error: 'Authentication required'
                    })
                };
            }

            // Connect to database
            context.log('Connecting to database...');
            const db = await connectToDatabase();
            context.log('Database connected successfully');
            const preferencesCollection = db.collection('mentorship_preferences');
            context.log('Collection obtained');

            // Find user preferences
            context.log('Fetching preferences for user:', user.id);
            const userPreferences = await preferencesCollection.findOne({ userId: user.id });
            context.log('Preferences found:', !!userPreferences);

            if (!userPreferences) {
                context.log('No preferences found for user');
                return {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        success: false,
                        message: 'No preferences found for user',
                        preferences: null
                    })
                };
            }

            // Return preferences
            context.log('Returning user preferences');
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    preferences: userPreferences
                })
            };

        } catch (error) {
            context.error('Error fetching preferences:', error);
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Internal server error while fetching preferences',
                    details: error instanceof Error ? error.message : String(error)
                })
            };
        }
    }
});