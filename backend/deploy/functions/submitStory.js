"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const database_1 = require("../utils/database");
functions_1.app.http('submitStory', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Story submission request received');
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
            // Get request body
            const body = await request.json();
            context.log('Request body:', body);
            // Validate required fields
            if (!body.title || !body.content || !body.category) {
                return {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        success: false,
                        error: {
                            code: 'VALIDATION_ERROR',
                            message: 'Title, content, and category are required'
                        }
                    })
                };
            }
            // Connect to database
            const db = await (0, database_1.connectToDatabase)();
            const storiesCollection = db.collection('stories');
            // Create story document
            const storyDoc = {
                userId: body.userId || 'anonymous',
                title: body.title,
                content: body.content,
                category: body.category,
                tags: body.tags || [],
                isPublic: body.isPublic !== false,
                mediaUrls: body.mediaUrls || [],
                careerLevel: body.careerLevel || 'mid',
                industry: body.industry || 'technology',
                likes: 0,
                views: 0,
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            // Insert story into database
            const result = await storiesCollection.insertOne(storyDoc);
            context.log('Story inserted with ID:', result.insertedId);
            // Return success response
            return {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    storyId: result.insertedId.toString(),
                    message: 'Story submitted successfully'
                })
            };
        }
        catch (error) {
            context.log('Error submitting story:', error);
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Failed to submit story'
                    }
                })
            };
        }
    }
});
//# sourceMappingURL=submitStory.js.map