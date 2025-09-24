import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { connectToDatabase } from '../utils/database';

export async function completeInterviewSession(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Completing interview session');

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
    const db = await connectToDatabase();
    const body = await request.json() as any;

    // Validate required fields
    if (!body.sessionId || body.overallScore === undefined || !body.feedback) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required fields: sessionId, overallScore, feedback' })
      };
    }

    const result = await db.collection('interview_sessions').updateOne(
      { id: body.sessionId },
      { 
        $set: { 
          endTime: new Date(),
          overallScore: body.overallScore,
          feedback: body.feedback,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Interview session not found' })
      };
    }

    // Update user analytics
    await updateUserAnalytics(db, body.sessionId, body.overallScore);

    context.log(`Interview session completed: ${body.sessionId}`);
    
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Interview session completed successfully'
      })
    };

  } catch (error) {
    context.error('Error completing interview session:', error);
    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}

async function updateUserAnalytics(db: any, sessionId: string, overallScore: number) {
  try {
    // Get the completed session
    const session = await db.collection('interview_sessions').findOne({ id: sessionId });
    if (!session) return;

    // Update or create user analytics
    const existingAnalytics = await db.collection('user_interview_analytics').findOne({ userId: session.userId });

    if (existingAnalytics) {
      // Update existing analytics
      const newTotalInterviews = existingAnalytics.totalInterviews + 1;
      const newAverageScore = ((existingAnalytics.averageScore * existingAnalytics.totalInterviews) + overallScore) / newTotalInterviews;

      await db.collection('user_interview_analytics').updateOne(
        { userId: session.userId },
        {
          $set: {
            totalInterviews: newTotalInterviews,
            averageScore: Math.round(newAverageScore * 100) / 100,
            lastInterviewDate: new Date(),
            updatedAt: new Date()
          },
          $push: {
            progressTrend: {
              $each: [{ date: new Date(), score: overallScore }],
              $slice: -20 // Keep only last 20 data points
            }
          }
        }
      );
    } else {
      // Create new analytics record
      await db.collection('user_interview_analytics').insertOne({
        userId: session.userId,
        totalInterviews: 1,
        averageScore: overallScore,
        lastInterviewDate: new Date(),
        progressTrend: [{ date: new Date(), score: overallScore }],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating user analytics:', error);
  }
}

app.http('completeInterviewSession', {
  methods: ['PUT', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: completeInterviewSession
});