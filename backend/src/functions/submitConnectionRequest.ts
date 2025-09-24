import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { connectToDatabase } from '../utils/database';

export async function submitConnectionRequest(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Processing connection request`);

    // Set CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
        return {
            status: 200,
            headers: corsHeaders
        };
    }

    try {
        const requestBody = await request.text();
        const connectionData = JSON.parse(requestBody);

        const db = await connectToDatabase();
        const collection = db.collection('connection_requests');

        // Create connection request document
        const connectionRequest = {
            userId: connectionData.userId,
            mentorId: connectionData.mentorId,
            message: connectionData.message || 'Connection request',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await collection.insertOne(connectionRequest);

        return {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            },
            body: JSON.stringify({
                success: true,
                connectionId: result.insertedId,
                message: 'Connection request submitted successfully'
            })
        };

    } catch (error) {
        context.log('Error submitting connection request:', error);
        
        return {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            },
            body: JSON.stringify({
                success: false,
                error: 'Failed to submit connection request'
            })
        };
    }
}

app.http('submitConnectionRequest', {
    methods: ['GET', 'POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: submitConnectionRequest
});