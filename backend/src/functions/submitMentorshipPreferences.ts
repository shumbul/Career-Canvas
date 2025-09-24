import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { connectToDatabase } from '../utils/database';
import { authenticateToken } from '../utils/auth';

app.http('submitMentorshipPreferences', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        context.log('Mentorship preferences request received');

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

            // Get request body
            const body = await request.json() as any;
            context.log('Request body:', body);

            // Use authenticated user ID instead of body userId
            body.userId = user.id;

            // Validate required fields
            context.log('Validating required fields...');
            context.log('mentorshipType:', body.mentorshipType);
            context.log('userId:', body.userId);
            
            if (!body.mentorshipType) {
                context.log('Validation failed: mentorshipType is missing');
                return {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        success: false,
                        error: `Validation failed: mentorshipType is required but was ${JSON.stringify(body.mentorshipType)}`,
                        message: `Validation failed: mentorshipType is required but was ${JSON.stringify(body.mentorshipType)}`,
                        receivedData: body
                    })
                };
            }

            // Connect to database
            context.log('Connecting to database...');
            const db = await connectToDatabase();
            context.log('Database connected successfully');
            const preferencesCollection = db.collection('mentorship_preferences');
            context.log('Collection obtained');

            // Create preferences document
            const preferencesDoc = {
                userId: body.userId,
                mentorshipType: body.mentorshipType,
                // Store all fields from the frontend directly, plus nested preferences
                interests: body.interests || [],
                preferredDepartments: body.preferredDepartments || [],
                availabilityType: body.availabilityType || 'flexible',
                sessionFrequency: body.sessionFrequency || 'bi-weekly',
                communicationStyle: body.communicationStyle || 'mixed',
                goals: body.goals || '',
                experience: body.experience || '',
                preferences: {
                    industries: body.preferences?.industries || [],
                    skills: body.preferences?.skills || [],
                    careerLevels: body.preferences?.careerLevels || [],
                    meetingFrequency: body.preferences?.meetingFrequency || 'monthly',
                    communicationStyle: body.preferences?.communicationStyle || 'casual',
                    goals: body.preferences?.goals || [],
                    timeCommitment: body.preferences?.timeCommitment || '1-2-hours',
                    remotePreference: body.preferences?.remotePreference || 'hybrid'
                },
                availability: {
                    timezone: body.availability?.timezone || 'UTC',
                    preferredTimes: body.availability?.preferredTimes || [],
                    startDate: body.availability?.startDate ? new Date(body.availability.startDate) : new Date(),
                    endDate: body.availability?.endDate ? new Date(body.availability.endDate) : null
                },
                bio: body.bio || '',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Upsert preferences (update if exists, insert if not)
            context.log('Attempting to save preferences for user:', body.userId);
            context.log('Preferences document:', JSON.stringify(preferencesDoc, null, 2));
            
            const result = await preferencesCollection.replaceOne(
                { userId: body.userId },
                preferencesDoc,
                { upsert: true }
            );
            
            context.log('Database operation completed successfully');

            context.log('Preferences saved with result:', result);

            // Return success response
            return {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    preferenceId: result.upsertedId ? result.upsertedId.toString() : 'updated',
                    message: 'Preferences saved successfully'
                })
            };

        } catch (error: any) {
            context.log('Error saving preferences:', error);
            
            // Provide detailed error message
            const errorMessage = error instanceof Error ? error.message : 'Failed to save preferences';
            
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: errorMessage,
                    message: errorMessage,
                    details: error instanceof Error ? error.stack : 'Unknown error type'
                })
            };
        }
    }
});