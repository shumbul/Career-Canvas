import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { connectToDatabase } from '../utils/database';

app.http('getStories', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        context.log('Get stories request received');

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            };
        }

        try {
            // Connect to database
            const db = await connectToDatabase();
            const storiesCollection = db.collection('stories');

            // Get query parameters
            const url = new URL(request.url);
            const limit = parseInt(url.searchParams.get('limit') || '20');
            const offset = parseInt(url.searchParams.get('offset') || '0');
            const category = url.searchParams.get('category');

            // Build query
            let query: any = { isPublic: true };
            if (category && category !== 'all') {
                query.category = category;
            }

            // Fetch stories from MongoDB
            const stories = await storiesCollection
                .find(query)
                .sort({ createdAt: -1 }) // Most recent first
                .skip(offset)
                .limit(limit)
                .toArray();

            // Get total count for pagination
            const totalCount = await storiesCollection.countDocuments(query);

            // Transform stories for frontend
            const transformedStories = stories.map(story => ({
                id: story._id.toString(),
                title: story.title,
                content: story.content,
                tags: story.tags || [],
                author: story.userId, // You can enhance this to get actual user names
                createdAt: story.createdAt,
                media: story.mediaUrls?.[0] || undefined,
                likes: story.likes || 0,
                category: story.category,
                views: story.views || 0
            }));

            context.log(`Retrieved ${transformedStories.length} stories from database`);

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    stories: transformedStories,
                    pagination: {
                        total: totalCount,
                        limit,
                        offset,
                        hasMore: offset + limit < totalCount
                    }
                })
            };

        } catch (error: any) {
            context.log('Error fetching stories:', error);
            
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: {
                        code: 'FETCH_ERROR',
                        message: 'Failed to fetch stories'
                    }
                })
            };
        }
    }
});