import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { connectToDatabase } from '../utils/database';

export async function seedMentors(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    // Set CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
        return { status: 200, headers };
    }

    try {
        const db = await connectToDatabase();
        const mentorsCollection = db.collection('mentors');

        // Sample mentor data with rich profiles
        const sampleMentors = [
            {
                name: 'Sarah Johnson',
                email: 'sarah.johnson@company.com',
                title: 'Senior Software Engineer',
                department: 'Engineering',
                skills: ['React', 'TypeScript', 'Leadership', 'System Design', 'Node.js', 'Azure'],
                bio: 'Passionate about helping junior developers grow their careers. 8+ years in full-stack development with expertise in modern web technologies and cloud architecture.',
                experience: 8,
                availability: 'available',
                rating: 4.9,
                menteeCount: 15,
                interests: ['career-growth', 'technical-skills', 'leadership'],
                lastActive: new Date().toISOString(),
                mentorshipHistory: {
                    totalMentees: 25,
                    completedSessions: 150,
                    averageRating: 4.8,
                    specializations: ['Frontend Development', 'Career Transition', 'Technical Leadership']
                }
            },
            {
                name: 'Michael Chen',
                email: 'michael.chen@company.com',
                title: 'Principal Product Manager',
                department: 'Product',
                skills: ['Product Strategy', 'Data Analysis', 'Agile', 'User Research', 'SQL', 'Python'],
                bio: 'Former engineer turned PM with 10+ years experience. Love helping people transition between technical and business roles.',
                experience: 10,
                availability: 'limited',
                rating: 4.7,
                menteeCount: 12,
                interests: ['career-transition', 'product-management', 'strategy'],
                lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                mentorshipHistory: {
                    totalMentees: 18,
                    completedSessions: 95,
                    averageRating: 4.6,
                    specializations: ['Product Management', 'Technical to Business Transition', 'Analytics']
                }
            },
            {
                name: 'Jessica Rodriguez',
                email: 'jessica.rodriguez@company.com',
                title: 'Marketing Director',
                department: 'Marketing',
                skills: ['Digital Marketing', 'Brand Strategy', 'Team Management', 'Analytics', 'Social Media', 'Content Strategy'],
                bio: 'Helping marketing professionals advance their careers and build strong personal brands. Expert in digital transformation and growth marketing.',
                experience: 12,
                availability: 'available',
                rating: 4.8,
                menteeCount: 20,
                interests: ['marketing', 'brand-building', 'career-advancement'],
                lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                mentorshipHistory: {
                    totalMentees: 35,
                    completedSessions: 200,
                    averageRating: 4.7,
                    specializations: ['Digital Marketing', 'Brand Development', 'Leadership']
                }
            },
            {
                name: 'David Park',
                email: 'david.park@company.com',
                title: 'Principal Engineer',
                department: 'Engineering',
                skills: ['Cloud Architecture', 'Microservices', 'DevOps', 'Mentoring', 'Kubernetes', 'AWS'],
                bio: 'Cloud architecture expert with a passion for building scalable systems and growing engineering talent. 15+ years in distributed systems.',
                experience: 15,
                availability: 'busy',
                rating: 4.9,
                menteeCount: 30,
                interests: ['technical-architecture', 'engineering-leadership', 'cloud-technologies'],
                lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                mentorshipHistory: {
                    totalMentees: 45,
                    completedSessions: 300,
                    averageRating: 4.9,
                    specializations: ['System Architecture', 'Cloud Engineering', 'Technical Leadership']
                }
            },
            {
                name: 'Amanda Foster',
                email: 'amanda.foster@company.com',
                title: 'UX Design Lead',
                department: 'Design',
                skills: ['User Experience', 'Design Systems', 'Research', 'Prototyping', 'Figma', 'Design Thinking'],
                bio: 'Design leader focused on creating user-centered experiences and mentoring emerging designers. Expert in design systems and user research.',
                experience: 9,
                availability: 'available',
                rating: 4.6,
                menteeCount: 14,
                interests: ['design', 'user-experience', 'creative-careers'],
                lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                mentorshipHistory: {
                    totalMentees: 22,
                    completedSessions: 130,
                    averageRating: 4.5,
                    specializations: ['UX Design', 'Design Systems', 'User Research']
                }
            },
            {
                name: 'Robert Kim',
                email: 'robert.kim@company.com',
                title: 'Senior Data Scientist',
                department: 'Analytics',
                skills: ['Machine Learning', 'Python', 'Statistics', 'Data Visualization', 'SQL', 'TensorFlow'],
                bio: 'ML engineer passionate about democratizing data science and helping others break into the field. PhD in Computer Science.',
                experience: 7,
                availability: 'limited',
                rating: 4.8,
                menteeCount: 8,
                interests: ['data-science', 'machine-learning', 'career-transition'],
                lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                mentorshipHistory: {
                    totalMentees: 15,
                    completedSessions: 85,
                    averageRating: 4.7,
                    specializations: ['Data Science', 'Machine Learning', 'Analytics']
                }
            },
            {
                name: 'Lisa Thompson',
                email: 'lisa.thompson@company.com',
                title: 'VP of Engineering',
                department: 'Engineering',
                skills: ['Executive Leadership', 'Team Building', 'Strategic Planning', 'Agile', 'Hiring', 'Culture'],
                bio: 'Engineering executive with 20+ years experience building high-performing teams. Former startup founder and current VP at Fortune 500.',
                experience: 20,
                availability: 'limited',
                rating: 4.9,
                menteeCount: 25,
                interests: ['executive-coaching', 'leadership', 'team-building'],
                lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                mentorshipHistory: {
                    totalMentees: 50,
                    completedSessions: 250,
                    averageRating: 4.8,
                    specializations: ['Executive Leadership', 'Team Management', 'Strategic Planning']
                }
            },
            {
                name: 'Carlos Martinez',
                email: 'carlos.martinez@company.com',
                title: 'Sales Director',
                department: 'Sales',
                skills: ['Sales Strategy', 'Client Relations', 'Negotiation', 'CRM', 'Team Leadership', 'Business Development'],
                bio: 'Sales leader with expertise in enterprise software sales and team development. Passionate about helping sales professionals reach their potential.',
                experience: 11,
                availability: 'available',
                rating: 4.7,
                menteeCount: 16,
                interests: ['sales', 'business-development', 'leadership'],
                lastActive: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                mentorshipHistory: {
                    totalMentees: 28,
                    completedSessions: 180,
                    averageRating: 4.6,
                    specializations: ['Sales Leadership', 'Enterprise Sales', 'Client Management']
                }
            },
            {
                name: 'Priya Patel',
                email: 'priya.patel@company.com',
                title: 'DevOps Engineer',
                department: 'Engineering',
                skills: ['CI/CD', 'Docker', 'Kubernetes', 'AWS', 'Terraform', 'Monitoring'],
                bio: 'DevOps specialist focused on automation and scalability. Helping teams adopt modern deployment practices and cloud-native technologies.',
                experience: 6,
                availability: 'available',
                rating: 4.5,
                menteeCount: 10,
                interests: ['devops', 'cloud-computing', 'automation'],
                lastActive: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
                mentorshipHistory: {
                    totalMentees: 12,
                    completedSessions: 75,
                    averageRating: 4.4,
                    specializations: ['DevOps', 'Cloud Infrastructure', 'Automation']
                }
            },
            {
                name: 'James Wilson',
                email: 'james.wilson@company.com',
                title: 'Finance Manager',
                department: 'Finance',
                skills: ['Financial Analysis', 'Budgeting', 'Excel', 'PowerBI', 'Risk Management', 'Strategy'],
                bio: 'Finance professional with expertise in financial planning and analysis. Helping others navigate corporate finance and develop analytical skills.',
                experience: 13,
                availability: 'limited',
                rating: 4.6,
                menteeCount: 18,
                interests: ['finance', 'analytics', 'career-development'],
                lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                mentorshipHistory: {
                    totalMentees: 24,
                    completedSessions: 140,
                    averageRating: 4.5,
                    specializations: ['Financial Analysis', 'Corporate Finance', 'Business Strategy']
                }
            }
        ];

        // Clear existing mentors and insert new ones
        await mentorsCollection.deleteMany({});
        const result = await mentorsCollection.insertMany(sampleMentors);

        return {
            status: 200,
            headers,
            body: JSON.stringify({
                message: 'Mentors seeded successfully',
                insertedCount: result.insertedCount,
                mentors: sampleMentors.map(m => ({ name: m.name, department: m.department, title: m.title }))
            })
        };

    } catch (error) {
        context.error('Error seeding mentors:', error);
        
        return {
            status: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to seed mentors',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
}

app.http('seedMentors', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    route: 'mentors/seed',
    handler: seedMentors
});