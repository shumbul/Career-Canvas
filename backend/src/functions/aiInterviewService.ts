import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

// Azure OpenAI Configuration
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4';
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ResponseEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  confidence: number;
}

export async function generateInterviewQuestion(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Generating interview question with Azure OpenAI');

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
    const body = await request.json() as any;

    // Validate required fields
    if (!body.topic) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required field: topic' })
      };
    }

    const { topic, previousQuestions = [] } = body;

    // Generate question using Azure OpenAI
    const question = await callAzureOpenAI(
      createQuestionPrompt(topic, previousQuestions),
      context
    );

    if (!question) {
      // Fallback to static questions if AI service fails
      const fallbackQuestion = getFallbackQuestion(topic, previousQuestions);
      
      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          question: fallbackQuestion,
          source: 'fallback'
        })
      };
    }

    context.log(`Generated question for topic: ${topic}`);
    
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        question,
        source: 'ai'
      })
    };

  } catch (error) {
    context.error('Error generating interview question:', error);
    
    // Return fallback question on error
    const body = await request.json() as any;
    const fallbackQuestion = getFallbackQuestion(body.topic || 'general', []);
    
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        question: fallbackQuestion,
        source: 'fallback',
        error: 'AI service unavailable'
      })
    };
  }
}

export async function evaluateInterviewResponse(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Evaluating interview response with Azure OpenAI');

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
    const body = await request.json() as any;

    // Validate required fields
    if (!body.question || !body.answer || !body.category) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required fields: question, answer, category' })
      };
    }

    const { question, answer, category } = body;

    // Evaluate response using Azure OpenAI
    const evaluation = await evaluateWithAI(question, answer, category, context);

    context.log(`Evaluated response for category: ${category}, score: ${evaluation.score}`);
    
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        evaluation
      })
    };

  } catch (error) {
    context.error('Error evaluating interview response:', error);
    
    // Return basic evaluation on error
    const body = await request.json() as any;
    const basicEvaluation = getBasicEvaluation(body.answer || '');
    
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        evaluation: basicEvaluation,
        source: 'fallback'
      })
    };
  }
}

async function callAzureOpenAI(prompt: string, context: InvocationContext): Promise<InterviewQuestion | null> {
  if (!AZURE_OPENAI_API_KEY || !AZURE_OPENAI_ENDPOINT) {
    context.log('Azure OpenAI credentials not configured, using fallback');
    return null;
  }

  try {
    const url = `${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_API_KEY
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview question generator. Generate relevant, thoughtful interview questions based on the given topic and criteria. Return the response as a JSON object with id, question, category, and difficulty fields.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (content) {
      try {
        return JSON.parse(content);
      } catch {
        // If JSON parsing fails, create question from text
        return {
          id: `ai_${Date.now()}`,
          question: content.trim(),
          category: 'general',
          difficulty: 'medium'
        };
      }
    }

    return null;
  } catch (error) {
    context.error('Azure OpenAI API call failed:', error);
    return null;
  }
}

async function evaluateWithAI(question: string, answer: string, category: string, context: InvocationContext): Promise<ResponseEvaluation> {
  if (!AZURE_OPENAI_API_KEY || !AZURE_OPENAI_ENDPOINT) {
    context.log('Azure OpenAI credentials not configured, using basic evaluation');
    return getBasicEvaluation(answer);
  }

  try {
    const url = `${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`;
    
    const prompt = `Evaluate this interview response:

Question: "${question}"
Category: ${category}
Answer: "${answer}"

Provide a detailed evaluation with:
1. A score from 0-100
2. Specific feedback
3. List of strengths (if any)
4. List of areas for improvement
5. Confidence level (0-100)

Return as JSON with fields: score, feedback, strengths (array), improvements (array), confidence`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_API_KEY
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview evaluator. Provide constructive, detailed feedback on interview responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (content) {
      try {
        return JSON.parse(content);
      } catch {
        // Fallback to basic evaluation
        return getBasicEvaluation(answer);
      }
    }

    return getBasicEvaluation(answer);
  } catch (error) {
    context.error('Azure OpenAI evaluation failed:', error);
    return getBasicEvaluation(answer);
  }
}

function createQuestionPrompt(topic: string, previousQuestions: string[]): string {
  const usedQuestions = previousQuestions.length > 0 
    ? `\nAvoid these already used questions: ${previousQuestions.join(', ')}`
    : '';

  // Parse combined topic format (e.g., "early-career-behavioral" or just "behavioral")
  let careerLevel = '';
  let questionTopic = topic;
  
  if (topic.includes('-')) {
    const parts = topic.split('-');
    if (parts.length >= 2 && (parts[0] === 'early' || parts[0] === 'mid' || parts[0] === 'senior')) {
      careerLevel = parts[0] + '-career';
      questionTopic = parts.slice(1).join('-');
    }
  }

  const careerContext = careerLevel ? 
    `\nCareer Level Context: This is for someone at ${careerLevel} level. Tailor the question complexity and expectations accordingly.` : '';

  return `Generate an interview question for the topic: "${questionTopic}".${careerContext}
The question should be:
- Relevant to the topic and career level
- Appropriate difficulty level for the target audience
- Engaging and thought-provoking
- Different from previous questions${usedQuestions}

Return as JSON with fields: id (unique), question (string), category ("${topic}"), difficulty ("easy", "medium", or "hard")`;
}

function getFallbackQuestion(topic: string, previousQuestions: string[]): InterviewQuestion {
  const fallbackQuestions: { [key: string]: InterviewQuestion[] } = {
    behavioral: [
      { id: 'behavioral_1', question: 'Tell me about a challenging project you worked on and how you overcame obstacles.', category: 'behavioral', difficulty: 'medium' },
      { id: 'behavioral_2', question: 'Describe a time when you had to work with a difficult team member.', category: 'behavioral', difficulty: 'medium' }
    ],
    technical: [
      { id: 'technical_1', question: 'Explain a complex technical concept to someone without a technical background.', category: 'technical', difficulty: 'medium' },
      { id: 'technical_2', question: 'How do you approach debugging a complex issue?', category: 'technical', difficulty: 'medium' }
    ],
    'early-career': [
      { id: 'early_1', question: 'What motivates you to start your career in this field?', category: 'early-career', difficulty: 'easy' },
      { id: 'early_2', question: 'How do you handle constructive feedback?', category: 'early-career', difficulty: 'easy' }
    ],
    'mid-career': [
      { id: 'mid_1', question: 'How has your leadership approach evolved over your career?', category: 'mid-career', difficulty: 'medium' },
      { id: 'mid_2', question: 'Describe a strategic decision you made that had significant impact.', category: 'mid-career', difficulty: 'hard' }
    ],
    'senior-career': [
      { id: 'senior_1', question: 'How do you develop and execute long-term strategic vision for your organization?', category: 'senior-career', difficulty: 'hard' },
      { id: 'senior_2', question: 'Describe how you\'ve led organizational transformation or major change initiatives.', category: 'senior-career', difficulty: 'hard' },
      { id: 'senior_3', question: 'How do you build and maintain relationships with C-level executives?', category: 'senior-career', difficulty: 'hard' }
    ],
    general: [
      { id: 'general_1', question: 'What are your career goals for the next 3-5 years?', category: 'general', difficulty: 'easy' },
      { id: 'general_2', question: 'How do you prioritize competing demands on your time?', category: 'general', difficulty: 'medium' }
    ]
  };

  const questions = fallbackQuestions[topic] || fallbackQuestions.general;
  const usedIds = new Set(previousQuestions);
  const availableQuestions = questions.filter(q => !usedIds.has(q.id));
  
  if (availableQuestions.length > 0) {
    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  }
  
  return questions[Math.floor(Math.random() * questions.length)];
}

function getBasicEvaluation(answer: string): ResponseEvaluation {
  const wordCount = answer.split(' ').length;
  const hasSpecificExamples = /\b(example|instance|time|situation|project)\b/i.test(answer);
  const hasQuantifiableResults = /\d+%|\$\d+|\d+\s*(users|people|days|months|years)/i.test(answer);
  
  let score = 60;
  if (wordCount > 50) score += 10;
  if (wordCount > 100) score += 10;
  if (hasSpecificExamples) score += 15;
  if (hasQuantifiableResults) score += 10;
  
  score = Math.min(100, Math.max(30, score));
  
  const strengths: string[] = [];
  const improvements: string[] = [];
  
  if (hasSpecificExamples) strengths.push('Provided specific examples');
  if (hasQuantifiableResults) strengths.push('Included quantifiable results');
  if (wordCount > 100) strengths.push('Comprehensive answer');
  
  if (!hasSpecificExamples) improvements.push('Include more specific examples');
  if (!hasQuantifiableResults) improvements.push('Add quantifiable metrics');
  if (wordCount < 50) improvements.push('Provide more detailed explanations');
  
  return {
    score,
    feedback: score >= 80 ? 'Strong response with good detail and examples.' : 
              score >= 60 ? 'Solid response with room for improvement.' : 
              'Consider adding more specific examples and details.',
    strengths,
    improvements,
    confidence: Math.min(100, score + 5)
  };
}

app.http('generateInterviewQuestion', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: generateInterviewQuestion
});

app.http('evaluateInterviewResponse', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: evaluateInterviewResponse
});