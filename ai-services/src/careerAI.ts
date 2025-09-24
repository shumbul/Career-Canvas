import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Azure OpenAI Configuration (alternative)
// import { AzureOpenAI } from '@azure/openai';
// const azureOpenAI = new AzureOpenAI({
//   endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
//   apiKey: process.env.AZURE_OPENAI_API_KEY || '',
//   apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
// });

export class CareerCanvasAI {
  
  /**
   * Generate career advice based on user profile
   */
  async generateCareerAdvice(userProfile: any): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a career counselor AI assistant helping professionals with career development."
          },
          {
            role: "user",
            content: `Based on this user profile, provide personalized career advice: ${JSON.stringify(userProfile)}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });
      
      return response.choices[0].message.content || "Unable to generate advice at this time.";
    } catch (error) {
      console.error('Error generating career advice:', error);
      throw new Error('Failed to generate career advice');
    }
  }

  /**
   * Analyze resume and provide feedback
   */
  async analyzeResume(resumeText: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert resume reviewer. Provide constructive feedback on resumes."
          },
          {
            role: "user",
            content: `Please analyze this resume and provide feedback: ${resumeText}`
          }
        ],
        max_tokens: 800,
        temperature: 0.5,
      });
      
      return response.choices[0].message.content || "Unable to analyze resume at this time.";
    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw new Error('Failed to analyze resume');
    }
  }

  /**
   * Generate interview questions for a specific role
   */
  async generateInterviewQuestions(jobTitle: string, company?: string): Promise<string[]> {
    try {
      const companyContext = company ? ` at ${company}` : '';
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an interview preparation expert. Generate relevant interview questions."
          },
          {
            role: "user",
            content: `Generate 10 interview questions for a ${jobTitle} position${companyContext}. Return as a JSON array.`
          }
        ],
        max_tokens: 600,
        temperature: 0.6,
      });
      
      const content = response.choices[0].message.content;
      if (content) {
        try {
          return JSON.parse(content);
        } catch {
          return content.split('\n').filter(q => q.trim().length > 0);
        }
      }
      return [];
    } catch (error) {
      console.error('Error generating interview questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }
}

export default CareerCanvasAI;