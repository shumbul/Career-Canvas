import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticateToken, UserPayload } from '../utils/auth';
import { connectToDatabase } from '../utils/database';

export async function updateMentorProfile(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('updateMentorProfile function processed a request');

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
        const updateData = await request.json() as any;
        context.log('Request body:', updateData);

        // Validate required fields
        if (!updateData.title || !updateData.department || !updateData.bio || 
            !updateData.skills || updateData.skills.length === 0) {
            return {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Missing required fields: title, department, bio, and skills are required'
                })
            };
        }

        // Connect to database
        const db = await connectToDatabase();
        const mentorsCollection = db.collection('mentors');

        // Check if user's mentor profile exists
        const existingMentor = await mentorsCollection.findOne({ email: user.email });
        if (!existingMentor) {
            return {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Mentor profile not found'
                })
            };
        }

        // Prepare update data - preserve some fields from existing profile
        const updatedMentorData = {
            title: updateData.title,
            department: updateData.department,
            skills: updateData.skills,
            bio: updateData.bio,
            experience: updateData.experience || existingMentor.experience || 0,
            availability: updateData.availability || existingMentor.availability || 'available',
            interests: updateData.interests || existingMentor.interests || [],
            lastActive: new Date().toISOString(),
            // Preserve existing data
            rating: existingMentor.rating,
            menteeCount: existingMentor.menteeCount,
            mentorshipHistory: existingMentor.mentorshipHistory,
            // Update updatedAt timestamp
            updatedAt: new Date().toISOString()
        };

        // Update the mentor profile
        const result = await mentorsCollection.updateOne(
            { email: user.email },
            { $set: updatedMentorData }
        );

        if (result.modifiedCount === 0) {
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

        // Get the updated mentor profile
        const updatedMentor = await mentorsCollection.findOne({ email: user.email });

        context.log('Mentor profile updated successfully for user:', user.email);

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                message: 'Mentor profile updated successfully',
                mentorId: updatedMentor?._id.toString(),
                profile: updatedMentor
            })
        };

    } catch (error) {
        context.error('Error in updateMentorProfile function:', error);
        
        return {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: 'Internal server error occurred while updating mentor profile'
            })
        };
    }
}

// Register the function
app.http('updateMentorProfile', {
    methods: ['PUT', 'OPTIONS'],
    authLevel: 'anonymous',
    route: 'updateMentorProfile',
    handler: updateMentorProfile
});