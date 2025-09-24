"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const database_1 = require("../utils/database");
functions_1.app.http('testConnection', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Testing MongoDB connection');
        try {
            const db = await (0, database_1.connectToDatabase)();
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
        }
        catch (error) {
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
//# sourceMappingURL=testConnection.js.map