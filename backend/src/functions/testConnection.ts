import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { connectToDatabase } from '../utils/database';

app.http('testConnection', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        context.log('Testing MongoDB connection');

        try {
            const db = await connectToDatabase();
            
            // Test connection by listing collections
            const collections = await db.listCollections().toArray();
            
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Connected to MongoDB successfully',
                    database: process.env.MONGODB_DATABASE_NAME,
                    collectionsCount: collections.length,
                    collections: collections.map(c => c.name)
                })
            };

        } catch (error: any) {
            context.log('MongoDB connection test failed:', error);
            
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: {
                        code: 'CONNECTION_ERROR',
                        message: error.message
                    }
                })
            };
        }
    }
});