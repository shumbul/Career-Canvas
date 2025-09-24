import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { connectToDatabase } from '../utils/database';

export async function getMentors(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    // Set CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
        return { status: 200, headers };
    }

    try {
        const db = await connectToDatabase();
        const mentorsCollection = db.collection('mentors');

        // Parse query parameters for filtering
        const url = new URL(request.url);
        const searchParams = url.searchParams;

        const departments = searchParams.get('departments')?.split(',').filter(d => d.length > 0) || [];
        const skills = searchParams.get('skills')?.split(',').filter(s => s.length > 0) || [];
        const availability = searchParams.get('availability')?.split(',').filter(a => a.length > 0) || [];
        const minExperience = parseInt(searchParams.get('minExperience') || '0');
        const maxExperience = parseInt(searchParams.get('maxExperience') || '50');
        const minRating = parseFloat(searchParams.get('minRating') || '0');
        const maxRating = parseFloat(searchParams.get('maxRating') || '5');
        const search = searchParams.get('search') || '';
        const sortBy = searchParams.get('sortBy') || 'rating';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const userEmail = searchParams.get('userEmail');

        // Build MongoDB query
        const query: any = {};

        // User email filter (for getting specific user's profile)
        if (userEmail) {
            query.email = userEmail;
        }

        // Department filter
        if (departments.length > 0) {
            query.department = { $in: departments };
        }

        // Skills filter
        if (skills.length > 0) {
            query.skills = { $in: skills };
        }

        // Availability filter
        if (availability.length > 0) {
            query.availability = { $in: availability };
        }

        // Experience range filter
        query.experience = { $gte: minExperience, $lte: maxExperience };

        // Rating range filter
        query.rating = { $gte: minRating, $lte: maxRating };

        // Search filter (text search across multiple fields)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } },
                { bio: { $regex: search, $options: 'i' } },
                { skills: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query
        const mentors = await mentorsCollection
            .find(query)
            .sort(sort)
            .limit(100) // Limit results for performance
            .toArray();

        // Add lastActive timestamp (simulate real-time activity)
        const enrichedMentors = mentors.map(mentor => ({
            ...mentor,
            lastActive: mentor.lastActive || new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }));

        return {
            status: 200,
            headers,
            body: JSON.stringify({
                mentors: enrichedMentors,
                total: mentors.length,
                filters: {
                    departments: departments,
                    skills: skills,
                    availability: availability,
                    experience: { min: minExperience, max: maxExperience },
                    rating: { min: minRating, max: maxRating },
                    search: search,
                    sortBy: sortBy,
                    sortOrder: sortOrder
                }
            })
        };

    } catch (error) {
        context.error('Error fetching mentors:', error);
        
        return {
            status: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to fetch mentors',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
}

app.http('getMentors', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    route: 'mentors',
    handler: getMentors
});