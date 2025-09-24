import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { connectToDatabase } from '../utils/database';
import { authenticateToken } from '../utils/auth';

app.http('scheduleTeamsMeeting', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        context.log('Teams meeting scheduling request received');

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
            // Authenticate user
            const user = authenticateToken(request);
            if (!user) {
                return {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        success: false,
                        error: 'Authentication required'
                    })
                };
            }

            const body = await request.json() as any;
            const { meetingData, mentorId, userId } = body;

            context.log('Scheduling Teams meeting:', { meetingData, mentorId, userId });

            // For now, we'll simulate the Teams meeting creation
            // In a real implementation, you would use Microsoft Graph API
            const mockTeamsMeeting = {
                id: `meeting-${Date.now()}`,
                webUrl: `https://teams.microsoft.com/l/meetup-join/${Date.now()}`,
                joinUrl: `https://teams.microsoft.com/l/meetup-join/${Date.now()}`,
                subject: meetingData.subject,
                start: meetingData.start,
                end: meetingData.end,
                organizer: {
                    emailAddress: {
                        address: user.email,
                        name: user.name
                    }
                },
                attendees: meetingData.attendees
            };

            // Store the meeting in the database
            const db = await connectToDatabase();
            const meetingsCollection = db.collection('scheduled_meetings');

            const meetingDoc = {
                meetingId: mockTeamsMeeting.id,
                organizerId: userId,
                mentorId: mentorId,
                subject: meetingData.subject,
                startDateTime: new Date(meetingData.start.dateTime),
                endDateTime: new Date(meetingData.end.dateTime),
                attendees: meetingData.attendees,
                teamsJoinUrl: mockTeamsMeeting.joinUrl,
                status: 'scheduled',
                notes: meetingData.body?.content || '',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await meetingsCollection.insertOne(meetingDoc);

            context.log('Meeting stored in database successfully');

            // In a real implementation, you would:
            // 1. Use Microsoft Graph API to create the actual Teams meeting
            // 2. Send calendar invitations to attendees
            // 3. Handle error responses from Graph API
            
            // Simulate successful meeting creation
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Teams meeting scheduled successfully',
                    meeting: {
                        id: mockTeamsMeeting.id,
                        subject: mockTeamsMeeting.subject,
                        joinUrl: mockTeamsMeeting.joinUrl,
                        startDateTime: meetingData.start.dateTime,
                        endDateTime: meetingData.end.dateTime
                    }
                })
            };

        } catch (error) {
            context.error('Error scheduling Teams meeting:', error);
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Internal server error while scheduling meeting',
                    message: error instanceof Error ? error.message : 'Unknown error'
                })
            };
        }
    }
});