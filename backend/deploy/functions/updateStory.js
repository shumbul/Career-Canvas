"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const database_1 = require("../utils/database");
const mongodb_1 = require("mongodb");
functions_1.app.http('updateStory', {
    methods: ['PUT', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Update story request received');
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
            // Get story ID from query parameters
            const storyId = request.query.get('id');
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
            // Get request body
            const body = await request.json();
            context.log('Update request body:', body);
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
            // Build update document
            const updateDoc = {
                $set: {
                    title: body.title,
                    content: body.content,
                    category: body.category,
                    tags: body.tags || [],
                    isPublic: body.isPublic !== false,
                    mediaUrls: body.mediaUrls || [],
                    careerLevel: body.careerLevel || 'mid',
                    industry: body.industry || 'technology',
                    updatedAt: new Date()
                }
            };
            // Build query - only allow users to update their own stories
            const updateQuery = { _id: new mongodb_1.ObjectId(storyId) };
            if (body.userId) {
                updateQuery.userId = body.userId;
            }
            // Update the story
            const result = await storiesCollection.updateOne(updateQuery, updateDoc);
            if (result.matchedCount === 0) {
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
                            message: 'Story not found or you do not have permission to update it'
                        }
                    })
                };
            }
            context.log('Story updated successfully:', storyId);
            // Get the updated story to return
            const updatedStory = await storiesCollection.findOne({ _id: new mongodb_1.ObjectId(storyId) });
            // Return success response
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    story: {
                        id: updatedStory._id.toString(),
                        title: updatedStory.title,
                        content: updatedStory.content,
                        category: updatedStory.category,
                        tags: updatedStory.tags,
                        author: updatedStory.userId,
                        createdAt: updatedStory.createdAt,
                        updatedAt: updatedStory.updatedAt,
                        likes: updatedStory.likes,
                        views: updatedStory.views
                    },
                    message: 'Story updated successfully'
                })
            };
        }
        catch (error) {
            context.log('Error updating story:', error);
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
                        message: 'Failed to update story'
                    }
                })
            };
        }
    }
});
//# sourceMappingURL=updateStory.js.map