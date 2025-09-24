import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { connectToDatabase } from '../utils/database';

interface InterviewSession {
  id: string;
  userId: string;
  topic: string;
  startTime: Date;
  endTime?: Date;
  questions: Array<{
    id: string;
    question: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  responses: Array<{
    questionId: string;
    answer: string;
    confidence: number;
    feedback: string;
    score: number;
    strengths: string[];
    improvements: string[];
    timestamp: Date;
  }>;
  overallScore?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createInterviewSession(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Creating interview session');

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
    const db = await connectToDatabase();
    const body = await request.json() as any;

    // Validate required fields
    if (!body.userId || !body.topic || !body.questions) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required fields: userId, topic, questions' })
      };
    }

    const session: InterviewSession = {
      id: `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: body.userId,
      topic: body.topic,
      startTime: new Date(),
      questions: body.questions,
      responses: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('interview_sessions').insertOne(session);
    
    if (result.insertedId) {
      context.log(`Interview session created with ID: ${result.insertedId}`);
      
      return {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          session: { ...session, _id: result.insertedId }
        })
      };
    } else {
      throw new Error('Failed to create interview session');
    }

  } catch (error) {
    context.error('Error creating interview session:', error);
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

app.http('createInterviewSession', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: createInterviewSession
});