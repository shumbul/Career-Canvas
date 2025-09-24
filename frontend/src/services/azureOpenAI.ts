// Azure OpenAI Service for Video Interview
// This service provides AI-powered interview questions and evaluation

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

class AzureOpenAIService {
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly deployment: string;
  private readonly apiVersion: string;

  constructor() {
    // In a real implementation, these would come from environment variables
    this.apiKey = process.env.REACT_APP_AZURE_OPENAI_API_KEY || 'mock-key';
    this.endpoint = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT || 'https://mock.openai.azure.com/';
    this.deployment = process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT || 'gpt-4';
    this.apiVersion = process.env.REACT_APP_AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
  }

  /**
   * Generate interview questions based on topic using Azure OpenAI
   */
  async getAIQuestion(topic: string, previousQuestions: InterviewQuestion[] = []): Promise<InterviewQuestion> {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:7071/api'}/generateInterviewQuestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          previousQuestions
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate question');
      }

      return data.question;
    } catch (error) {
      console.error('Error generating AI question:', error);
      // Fallback to local question bank
      return this.getFallbackQuestion(topic, previousQuestions);
    }
  }

  private getFallbackQuestion(topic: string, previousQuestions: InterviewQuestion[] = []): InterviewQuestion {
    const questionBank: { [key: string]: InterviewQuestion[] } = {
      behavioral: [
        {
          id: `behavioral_${Date.now()}`,
          question: "Tell me about a time when you had to work under pressure. How did you handle it?",
          category: 'behavioral',
          difficulty: 'medium'
        },
        {
          id: `behavioral_${Date.now() + 1}`,
          question: "Describe a situation where you had to learn something completely new quickly. What was your approach?",
          category: 'behavioral',
          difficulty: 'medium'
        },
        {
          id: `behavioral_${Date.now() + 2}`,
          question: "Give me an example of a time when you had to deal with a difficult stakeholder. How did you manage the relationship?",
          category: 'behavioral',
          difficulty: 'hard'
        }
      ],
      technical: [
        {
          id: `technical_${Date.now()}`,
          question: "Explain the concept of dependency injection and its benefits in software development.",
          category: 'technical',
          difficulty: 'medium'
        },
        {
          id: `technical_${Date.now() + 1}`,
          question: "How would you implement rate limiting in a REST API? Discuss different approaches.",
          category: 'technical',
          difficulty: 'hard'
        },
        {
          id: `technical_${Date.now() + 2}`,
          question: "What are the differences between SQL and NoSQL databases? When would you choose one over the other?",
          category: 'technical',
          difficulty: 'medium'
        }
      ],
      'system-design': [
        {
          id: `design_${Date.now()}`,
          question: "Design a real-time notification system that can handle millions of users. What components would you include?",
          category: 'system-design',
          difficulty: 'hard'
        },
        {
          id: `design_${Date.now() + 1}`,
          question: "How would you design a distributed caching system? Consider scalability and consistency.",
          category: 'system-design',
          difficulty: 'hard'
        },
        {
          id: `design_${Date.now() + 2}`,
          question: "Design a file storage system like Dropbox. What are the key architectural considerations?",
          category: 'system-design',
          difficulty: 'hard'
        }
      ],
      leadership: [
        {
          id: `leadership_${Date.now()}`,
          question: "How do you handle team members who consistently miss deadlines? Walk me through your approach.",
          category: 'leadership',
          difficulty: 'medium'
        },
        {
          id: `leadership_${Date.now() + 1}`,
          question: "Describe a time when you had to make a difficult decision that affected your team. How did you communicate it?",
          category: 'leadership',
          difficulty: 'medium'
        },
        {
          id: `leadership_${Date.now() + 2}`,
          question: "How do you foster innovation and creativity within your team while maintaining productivity?",
          category: 'leadership',
          difficulty: 'hard'
        }
      ],
      'early-career': [
        {
          id: `early_${Date.now()}`,
          question: "Tell me about yourself and why you're interested in starting your career in this field.",
          category: 'early-career',
          difficulty: 'easy'
        },
        {
          id: `early_${Date.now() + 1}`,
          question: "How do you handle feedback and criticism from supervisors or colleagues?",
          category: 'early-career',
          difficulty: 'easy'
        },
        {
          id: `early_${Date.now() + 2}`,
          question: "Describe a time when you had to learn something new quickly. What was your approach?",
          category: 'early-career',
          difficulty: 'medium'
        },
        {
          id: `early_${Date.now() + 3}`,
          question: "What are your career goals for the next 2-3 years?",
          category: 'early-career',
          difficulty: 'easy'
        },
        {
          id: `early_${Date.now() + 4}`,
          question: "How do you stay organized and manage your time effectively?",
          category: 'early-career',
          difficulty: 'easy'
        }
      ],
      'mid-career': [
        {
          id: `mid_${Date.now()}`,
          question: "How has your leadership style evolved throughout your career?",
          category: 'mid-career',
          difficulty: 'medium'
        },
        {
          id: `mid_${Date.now() + 1}`,
          question: "Describe a time when you had to make a difficult strategic decision with limited information.",
          category: 'mid-career',
          difficulty: 'hard'
        },
        {
          id: `mid_${Date.now() + 2}`,
          question: "How do you mentor and develop junior team members?",
          category: 'mid-career',
          difficulty: 'medium'
        },
        {
          id: `mid_${Date.now() + 3}`,
          question: "Tell me about a time when you had to drive change in your organization.",
          category: 'mid-career',
          difficulty: 'hard'
        },
        {
          id: `mid_${Date.now() + 4}`,
          question: "How do you balance competing priorities and stakeholder demands?",
          category: 'mid-career',
          difficulty: 'medium'
        }
      ],
      'senior-career': [
        {
          id: `senior_${Date.now()}`,
          question: "How do you develop and execute long-term strategic vision for your organization?",
          category: 'senior-career',
          difficulty: 'hard'
        },
        {
          id: `senior_${Date.now() + 1}`,
          question: "Describe how you've led organizational transformation or major change initiatives.",
          category: 'senior-career',
          difficulty: 'hard'
        },
        {
          id: `senior_${Date.now() + 2}`,
          question: "How do you build and maintain relationships with C-level executives and board members?",
          category: 'senior-career',
          difficulty: 'hard'
        },
        {
          id: `senior_${Date.now() + 3}`,
          question: "Tell me about a time when you had to make a decision that significantly impacted the company's direction.",
          category: 'senior-career',
          difficulty: 'hard'
        },
        {
          id: `senior_${Date.now() + 4}`,
          question: "How do you develop next-generation leaders within your organization?",
          category: 'senior-career',
          difficulty: 'medium'
        },
        {
          id: `senior_${Date.now() + 5}`,
          question: "Describe your approach to managing in times of crisis or uncertainty.",
          category: 'senior-career',
          difficulty: 'hard'
        }
      ],
      general: [
        {
          id: `general_${Date.now()}`,
          question: "What motivates you in your work, and how do you stay engaged during challenging periods?",
          category: 'general',
          difficulty: 'easy'
        },
        {
          id: `general_${Date.now() + 1}`,
          question: "How do you prioritize your work when you have multiple competing deadlines?",
          category: 'general',
          difficulty: 'easy'
        },
        {
          id: `general_${Date.now() + 2}`,
          question: "What's the most challenging project you've worked on, and what made it challenging?",
          category: 'general',
          difficulty: 'medium'
        }
      ]
    };

    const availableQuestions = questionBank[topic] || questionBank.general;
    const usedQuestionIds = new Set(previousQuestions.map(q => q.id));
    const unusedQuestions = availableQuestions.filter(q => !usedQuestionIds.has(q.id));
    
    if (unusedQuestions.length === 0) {
      // If all questions are used, return a random one
      return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }
    
    return unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];
  }

  /**
   * Evaluate user's response using Azure OpenAI
   */
  async evaluateAIResponse(question: string, answer: string, category: string): Promise<ResponseEvaluation> {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:7071/api'}/evaluateInterviewResponse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          answer,
          category
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to evaluate response');
      }

      return data.evaluation;
    } catch (error) {
      console.error('Error evaluating AI response:', error);
      // Fallback to local evaluation
      return this.getFallbackEvaluation(question, answer, category);
    }
  }

  private getFallbackEvaluation(question: string, answer: string, category: string): ResponseEvaluation {
    // Generate mock evaluation based on answer length and keywords
    const wordCount = answer.split(' ').length;
    const hasSpecificExamples = /\b(example|instance|time|situation|project|company|team)\b/i.test(answer);
    const hasQuantifiableResults = /\d+%|\$\d+|\d+\s*(users|people|days|months|years|projects)/i.test(answer);
    
    let baseScore = 60;
    
    // Scoring logic
    if (wordCount > 50) baseScore += 10;
    if (wordCount > 100) baseScore += 10;
    if (hasSpecificExamples) baseScore += 15;
    if (hasQuantifiableResults) baseScore += 10;
    
    // Category-specific adjustments
    if (category === 'behavioral' && hasSpecificExamples) baseScore += 5;
    if (category === 'technical' && answer.toLowerCase().includes('because')) baseScore += 5;
    if (category === 'system-design' && /\b(scalability|performance|availability|consistency)\b/i.test(answer)) baseScore += 10;
    
    const score = Math.min(100, Math.max(30, baseScore + Math.floor(Math.random() * 10) - 5));
    
    const mockFeedback = this.generateMockFeedback(score, category, hasSpecificExamples, hasQuantifiableResults);
    
    return {
      score,
      feedback: mockFeedback.feedback,
      strengths: mockFeedback.strengths,
      improvements: mockFeedback.improvements,
      confidence: Math.min(100, score + Math.floor(Math.random() * 10))
    };
  }

  /**
   * Generate follow-up questions based on user's response
   */
  async generateFollowUpQuestion(originalQuestion: string, userAnswer: string): Promise<string> {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:7071/api'}/generateFollowUpQuestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalQuestion,
          userAnswer
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate follow-up question');
      }

      return data.followUpQuestion;
    } catch (error) {
      console.error('Error generating follow-up question:', error);
      // Fallback to local follow-up questions
      return this.getFallbackFollowUpQuestion();
    }
  }

  private getFallbackFollowUpQuestion(): string {
    const followUpQuestions = [
      "That's interesting. Can you elaborate on the specific challenges you faced?",
      "What would you do differently if you encountered a similar situation again?",
      "How did you measure the success of your approach?",
      "What was the most important lesson you learned from this experience?",
      "How did stakeholders react to your solution?",
      "What alternative approaches did you consider before settling on this one?"
    ];

    return followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)];
  }

  /**
   * Generate overall interview feedback
   */
  async generateOverallFeedback(responses: Array<{ question: string; answer: string; score: number }>): Promise<string> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const averageScore = responses.reduce((sum, r) => sum + r.score, 0) / responses.length;
    const responseCount = responses.length;
    
    let feedback = "";
    
    if (averageScore >= 85) {
      feedback = "Excellent interview performance! You demonstrated strong communication skills and provided detailed, well-structured responses. ";
    } else if (averageScore >= 70) {
      feedback = "Good interview performance overall. You showed solid understanding and provided relevant examples. ";
    } else if (averageScore >= 55) {
      feedback = "Moderate interview performance. There's room for improvement in providing more specific examples and detailed responses. ";
    } else {
      feedback = "There are several areas where you can improve your interview performance. Focus on providing more concrete examples and expanding your responses. ";
    }
    
    // Add specific suggestions based on response patterns
    const hasShortResponses = responses.some(r => r.answer.split(' ').length < 30);
    const lacksExamples = responses.filter(r => !/\b(example|instance|time|situation)\b/i.test(r.answer)).length > responses.length / 2;
    
    if (hasShortResponses) {
      feedback += "Try to expand your answers with more detail and context. ";
    }
    
    if (lacksExamples) {
      feedback += "Include specific examples and stories to illustrate your points more effectively. ";
    }
    
    feedback += `You completed ${responseCount} questions with an average score of ${Math.round(averageScore)}%.`;
    
    return feedback;
  }

  /**
   * Generate mock feedback based on response characteristics
   */
  private generateMockFeedback(score: number, category: string, hasExamples: boolean, hasQuantifiableResults: boolean) {
    const strengths: string[] = [];
    const improvements: string[] = [];
    let feedback = "";

    if (score >= 80) {
      strengths.push("Clear and well-structured response");
      if (hasExamples) strengths.push("Good use of specific examples");
      if (hasQuantifiableResults) strengths.push("Quantifiable results mentioned");
      feedback = "Strong response that demonstrates good understanding and communication skills.";
    } else if (score >= 60) {
      if (hasExamples) strengths.push("Included relevant examples");
      feedback = "Solid response with room for improvement.";
      if (!hasQuantifiableResults) improvements.push("Include more quantifiable results and metrics");
    } else {
      feedback = "Response needs significant improvement.";
      improvements.push("Provide more detailed explanations");
      if (!hasExamples) improvements.push("Include specific examples and situations");
    }

    // Category-specific feedback
    if (category === 'behavioral' && !hasExamples) {
      improvements.push("Use the STAR method (Situation, Task, Action, Result)");
    }
    
    if (category === 'technical') {
      if (score >= 70) {
        strengths.push("Good technical knowledge demonstrated");
      } else {
        improvements.push("Explain technical concepts more clearly");
      }
    }
    
    if (category === 'system-design') {
      if (score >= 70) {
        strengths.push("Considered important architectural aspects");
      } else {
        improvements.push("Discuss scalability, performance, and trade-offs");
      }
    }

    return { feedback, strengths, improvements };
  }
}

// Export singleton instance
export const azureOpenAIService = new AzureOpenAIService();
export default azureOpenAIService;