import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { connectToDatabase } from '../utils/database';

export async function getUserInterviewSessions(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Getting user interview sessions');

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
    const db = await connectToDatabase();
    
    const userId = request.query.get('userId');
    const limit = parseInt(request.query.get('limit') || '10');

    if (!userId) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required parameter: userId' })
      };
    }

    const sessions = await db.collection('interview_sessions')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    context.log(`Found ${sessions.length} interview sessions for user: ${userId}`);
    
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        sessions,
        count: sessions.length
      })
    };

  } catch (error) {
    context.error('Error getting user interview sessions:', error);
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

export async function getInterviewSession(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Getting interview session');

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
    const db = await connectToDatabase();
    
    const sessionId = request.query.get('sessionId');

    if (!sessionId) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required parameter: sessionId' })
      };
    }

    const session = await db.collection('interview_sessions').findOne({ id: sessionId });

    if (!session) {
      return {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Interview session not found' })
      };
    }

    context.log(`Retrieved interview session: ${sessionId}`);
    
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        session
      })
    };

  } catch (error) {
    context.error('Error getting interview session:', error);
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

export async function getUserInterviewAnalytics(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Getting user interview analytics');

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
    const db = await connectToDatabase();
    
    const userId = request.query.get('userId');

    if (!userId) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required parameter: userId' })
      };
    }

    // Get user analytics
    const analytics = await db.collection('user_interview_analytics').findOne({ userId });

    // Get recent sessions for additional insights
    const recentSessions = await db.collection('interview_sessions')
      .find({ userId, endTime: { $exists: true } })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Calculate category performance
    const categoryPerformance: { [key: string]: { scores: number[], count: number } } = {};
    
    recentSessions.forEach(session => {
      if (session.responses) {
        session.responses.forEach((response: any) => {
          const question = session.questions.find((q: any) => q.id === response.questionId);
          if (question) {
            const category = question.category;
            if (!categoryPerformance[category]) {
              categoryPerformance[category] = { scores: [], count: 0 };
            }
            categoryPerformance[category].scores.push(response.score);
            categoryPerformance[category].count++;
          }
        });
      }
    });

    // Calculate averages
    const categoryAverages = Object.entries(categoryPerformance).map(([category, data]) => ({
      category,
      averageScore: Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.count),
      totalQuestions: data.count
    }));

    context.log(`Retrieved analytics for user: ${userId}`);
    
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        analytics: analytics || {
          userId,
          totalInterviews: 0,
          averageScore: 0,
          lastInterviewDate: null,
          progressTrend: []
        },
        categoryPerformance: categoryAverages,
        recentSessionsCount: recentSessions.length
      })
    };

  } catch (error) {
    context.error('Error getting user interview analytics:', error);
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

app.http('getUserInterviewSessions', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: getUserInterviewSessions
});

app.http('getInterviewSession', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: getInterviewSession
});

app.http('getUserInterviewAnalytics', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: getUserInterviewAnalytics
});