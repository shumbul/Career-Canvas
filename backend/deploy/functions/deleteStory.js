"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const database_1 = require("../utils/database");
const mongodb_1 = require("mongodb");
functions_1.app.http('deleteStory', {
    methods: ['DELETE', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Delete story request received');
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            };
        }
        try {
            // Get story ID from query parameters
            const storyId = request.query.get('id');
            const userId = request.query.get('userId'); // For authorization check
            if (!storyId) {
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
                            message: 'Story ID is required'
                        }
                    })
                };
            }
            // Validate ObjectId format
            if (!mongodb_1.ObjectId.isValid(storyId)) {
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
                            message: 'Invalid story ID format'
                        }
                    })
                };
            }
            // Connect to database
            const db = await (0, database_1.connectToDatabase)();
            const storiesCollection = db.collection('stories');
            // Build query - only allow users to delete their own stories
            const deleteQuery = { _id: new mongodb_1.ObjectId(storyId) };
            if (userId) {
                deleteQuery.userId = userId;
            }
            // Delete the story
            const result = await storiesCollection.deleteOne(deleteQuery);
            if (result.deletedCount === 0) {
                return {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        success: false,
                        error: {
                            code: 'NOT_FOUND',
                            message: 'Story not found or you do not have permission to delete it'
                        }
                    })
                };
            }
            context.log('Story deleted successfully:', storyId);
            // Return success response
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Story deleted successfully'
                })
            };
        }
        catch (error) {
            context.log('Error deleting story:', error);
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
                        message: 'Failed to delete story'
                    }
                })
            };
        }
    }
});
//# sourceMappingURL=deleteStory.js.map