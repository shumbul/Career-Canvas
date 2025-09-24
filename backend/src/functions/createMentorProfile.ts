import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticateToken, UserPayload } from '../utils/auth';
import { connectToDatabase } from '../utils/database';

export async function createMentorProfile(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('createMentorProfile function processed a request');

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
        return { status: 200, headers };
    }

    try {
        // Authenticate user
        const user = authenticateToken(request);
        if (!user) {
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
        const mentorData = await request.json() as any;
        context.log('Request body:', mentorData);

        // Validate required fields
        if (!mentorData.name || !mentorData.email || !mentorData.title || 
            !mentorData.department || !mentorData.bio || !mentorData.skills || 
            mentorData.skills.length === 0) {
            return {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Missing required fields: name, email, title, department, bio, and skills are required'
                })
            };
        }

        // Connect to database
        const db = await connectToDatabase();
        const mentorsCollection = db.collection('mentors');

        // Check if user is already a mentor
        const existingMentor = await mentorsCollection.findOne({ email: user.email });
        
        // Check if this is an update request
        const isUpdateRequest = request.method === 'PUT' || request.url.includes('update=true');
        context.log('Request method:', request.method, 'URL:', request.url, 'Is update request:', isUpdateRequest);
        context.log('Existing mentor found:', !!existingMentor);
        
        if (existingMentor && !isUpdateRequest) {
            return {
                status: 409,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'You are already registered as a mentor'
                })
            };
        }

        if (isUpdateRequest && !existingMentor) {
            return {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Cannot update: mentor profile not found'
                })
            };
        }

        if (existingMentor && isUpdateRequest) {
            // Update existing mentor profile
            context.log('Updating existing mentor profile for user:', user.email);
            context.log('Update request data:', JSON.stringify(mentorData, null, 2));
            
            const updateData = {
                title: mentorData.title,
                department: mentorData.department,
                skills: mentorData.skills || existingMentor.skills || [],
                bio: mentorData.bio,
                experience: mentorData.experience || existingMentor.experience || 0,
                availability: mentorData.availability || existingMentor.availability || 'available',
                interests: mentorData.interests || existingMentor.interests || [],
                lastActive: new Date().toISOString(),
                updatedAt: new Date(),
                // Preserve existing rating and menteeCount
                rating: existingMentor.rating,
                menteeCount: existingMentor.menteeCount,
                mentorshipHistory: existingMentor.mentorshipHistory
            };

            const updateResult = await mentorsCollection.updateOne(
                { email: user.email },
                { $set: updateData }
            );

            if (updateResult.modifiedCount === 0) {
                context.log('No documents modified during update for user:', user.email);
                return {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        success: false,
                        error: 'No changes were made to the profile'
                    })
                };
            }

            context.log('Mentor profile updated for user:', user.email);

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Mentor profile updated successfully',
                    mentorId: existingMentor._id.toString()
                })
            };
        } else {
            // Create new mentor profile
            const mentorProfile = {
                userId: user.id,
                name: mentorData.name,
                email: mentorData.email,
                title: mentorData.title,
                department: mentorData.department,
                skills: mentorData.skills || [],
                bio: mentorData.bio,
                experience: mentorData.experience || 0,
                availability: mentorData.availability || 'available',
                rating: mentorData.rating || 5.0,
                menteeCount: mentorData.menteeCount || 0,
                interests: mentorData.interests || [],
                lastActive: new Date().toISOString(),
                mentorshipHistory: mentorData.mentorshipHistory || {
                    totalMentees: 0,
                    completedSessions: 0,
                    averageRating: 5.0,
                    specializations: mentorData.interests || []
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Insert mentor profile into database
            const result = await mentorsCollection.insertOne(mentorProfile);
            
            context.log('Mentor profile created with ID:', result.insertedId);

            return {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Mentor profile created successfully',
                    mentorId: result.insertedId,
                    data: {
                        id: result.insertedId,
                        ...mentorProfile
                    }
                })
            };
        }

    } catch (error) {
        context.log('Error creating mentor profile:', error);
        
        return {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
}

app.http('createMentorProfile', {
    methods: ['POST', 'PUT', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: createMentorProfile,
    route: 'createMentorProfile'
});