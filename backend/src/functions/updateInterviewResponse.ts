import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { connectToDatabase } from '../utils/database';

export async function updateInterviewResponse(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Updating interview response');

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    };
  }

  try {
    const db = await connectToDatabase();
    const body = await request.json() as any;

    // Validate required fields
    if (!body.sessionId || !body.response) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required fields: sessionId, response' })
      };
    }

    const response = {
      ...body.response,
      timestamp: new Date()
    };

    const result = await db.collection('interview_sessions').updateOne(
      { id: body.sessionId },
      { 
        $push: { responses: response },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Interview session not found' })
      };
    }

    context.log(`Response added to session: ${body.sessionId}`);
    
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Response added successfully'
      })
    };

  } catch (error) {
    context.error('Error updating interview response:', error);
    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}

app.http('updateInterviewResponse', {
  methods: ['PUT', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: updateInterviewResponse
});