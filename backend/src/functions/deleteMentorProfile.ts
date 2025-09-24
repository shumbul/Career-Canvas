import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticateToken, UserPayload } from '../utils/auth';
import { connectToDatabase } from '../utils/database';
import { ObjectId } from 'mongodb';

export async function deleteMentorProfile(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('deleteMentorProfile function processed a request');

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return { status: 200, headers };
  }

  if (request.method !== 'DELETE') {
    return {
      status: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed. Only DELETE requests are supported.' })
    };
  }

  try {
    // Get mentor ID from route parameter
    const mentorId = request.params.mentorId;
    
    if (!mentorId) {
      return {
        status: 400,
        headers,
        body: JSON.stringify({ message: 'Mentor ID is required' })
      };
    }

    // Authenticate user
    const user = authenticateToken(request);
    
    if (!user) {
      return {
        status: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid or expired token' })
      };
    }
    
    // Connect to MongoDB
    const db = await connectToDatabase();
    const collection = db.collection('mentors');
    
    // Convert string ID to ObjectId for MongoDB
    let mongoId: ObjectId;
    try {
      mongoId = new ObjectId(mentorId);
    } catch (error) {
      return {
        status: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid mentor ID format' })
      };
    }
    
    // Verify the mentor profile belongs to the authenticated user
    const existingProfile = await collection.findOne({ _id: mongoId });
    if (!existingProfile) {
      return {
        status: 404,
        headers,
        body: JSON.stringify({ message: 'Mentor profile not found' })
      };
    }
    
    if (existingProfile.email !== user.email) {
      return {
        status: 403,
        headers,
        body: JSON.stringify({ message: 'You can only delete your own mentor profile' })
      };
    }
    
    // Delete the mentor profile
    const deleteResult = await collection.deleteOne({ _id: mongoId });
    
    if (deleteResult.deletedCount === 0) {
      return {
        status: 404,
        headers,
        body: JSON.stringify({ message: 'Mentor profile not found' })
      };
    }
    
    // Success response
    return {
      status: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Mentor profile deleted successfully',
        deletedCount: deleteResult.deletedCount
      })
    };
    
  } catch (error) {
    context.log('Error deleting mentor profile:', error);
    return {
      status: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
}

app.http('deleteMentorProfile', {
    methods: ['DELETE', 'OPTIONS'],
    route: 'deleteMentorProfile/{mentorId}',
    authLevel: 'anonymous',
    handler: deleteMentorProfile,
});