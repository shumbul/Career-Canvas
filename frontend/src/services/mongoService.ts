// MongoDB Service for Video Interview Transcripts and Sessions
// This service handles storing and retrieving interview data

interface InterviewSession {
  id: string;
  userId: string;
  topic: string;
  startTime: Date;
  endTime?: Date;
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  overallScore?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface InterviewResponse {
  questionId: string;
  answer: string;
  confidence: number;
  feedback: string;
  score: number;
  strengths: string[];
  improvements: string[];
  timestamp: Date;
}

interface InterviewTranscript {
  id: string;
  sessionId: string;
  userId: string;
  questionId: string;
  transcript: string;
  confidence: number;
  timestamp: Date;
  isProcessed: boolean;
}

interface InterviewAnalytics {
  userId: string;
  totalInterviews: number;
  averageScore: number;
  improvementAreas: string[];
  strongAreas: string[];
  lastInterviewDate: Date;
  progressTrend: Array<{ date: Date; score: number }>;
}

class MongoService {
  private readonly baseUrl: string;
  private readonly token: string | null;

  constructor() {
    // In production, these would come from environment variables
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:7071/api';
    this.token = localStorage.getItem('authToken'); // Get from auth context in real app
  }

  /**
   * Save interview transcript in real-time
   */
  async saveTranscript(sessionId: string, questionId: string, transcript: string, confidence: number): Promise<boolean> {
    try {
      // Mock implementation - in production this would call the backend API
      await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API call
      
      const transcriptData: Partial<InterviewTranscript> = {
        id: `transcript_${Date.now()}`,
        sessionId,
        questionId,
        transcript,
        confidence,
        timestamp: new Date(),
        isProcessed: false
      };

      // Store in localStorage for demo purposes
      const existingTranscripts = this.getStoredTranscripts();
      existingTranscripts.push(transcriptData as InterviewTranscript);
      localStorage.setItem('interview_transcripts', JSON.stringify(existingTranscripts));

      console.log('Transcript saved:', transcriptData);
      return true;
    } catch (error) {
      console.error('Error saving transcript:', error);
      return false;
    }
  }

  /**
   * Create a new interview session
   */
  async createInterviewSession(userId: string, topic: string, questions: InterviewQuestion[]): Promise<InterviewSession> {
    try {
      const response = await fetch(`${this.baseUrl}/createInterviewSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { Authorization: `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          userId,
          topic,
          questions
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create interview session');
      }

      console.log('Interview session created:', data.session);
      return data.session;
    } catch (error) {
      console.error('Error creating interview session:', error);
      // Fallback to localStorage for offline functionality
      return this.createInterviewSessionFallback(userId, topic, questions);
    }
  }

  /**
   * Update interview session with response
   */
  async updateSessionResponse(sessionId: string, response: InterviewResponse): Promise<boolean> {
    try {
      const apiResponse = await fetch(`${this.baseUrl}/updateInterviewResponse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { Authorization: `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          sessionId,
          response
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update session response');
      }

      console.log('Session response updated:', response);
      return true;
    } catch (error) {
      console.error('Error updating session response:', error);
      // Fallback to localStorage
      return this.updateSessionResponseFallback(sessionId, response);
    }
  }

  /**
   * Complete interview session with final results
   */
  async completeInterviewSession(sessionId: string, overallScore: number, feedback: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/completeInterviewSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { Authorization: `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          sessionId,
          overallScore,
          feedback
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to complete interview session');
      }

      console.log('Interview session completed:', data.session);
      return true;
    } catch (error) {
      console.error('Error completing interview session:', error);
      // Fallback to localStorage
      return this.completeInterviewSessionFallback(sessionId, overallScore, feedback);
    }
  }

  /**
   * Get interview sessions for a user
   */
  async getUserInterviewSessions(userId: string, limit: number = 10): Promise<InterviewSession[]> {
    try {
      const response = await fetch(`${this.baseUrl}/getUserInterviewSessions?userId=${userId}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { Authorization: `Bearer ${this.token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch user interview sessions');
      }

      return data.sessions || [];
    } catch (error) {
      console.error('Error fetching user interview sessions:', error);
      // Fallback to localStorage
      const sessions = this.getStoredSessions();
      return sessions
        .filter(s => s.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    }
  }

  /**
   * Get interview session by ID
   */
  async getInterviewSession(sessionId: string): Promise<InterviewSession | null> {
    try {
      const response = await fetch(`${this.baseUrl}/getInterviewSession?sessionId=${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { Authorization: `Bearer ${this.token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch interview session');
      }

      return data.session || null;
    } catch (error) {
      console.error('Error fetching interview session:', error);
      // Fallback to localStorage
      const sessions = this.getStoredSessions();
      return sessions.find(s => s.id === sessionId) || null;
    }
  }

  /**
   * Get transcripts for a session
   */
  async getSessionTranscripts(sessionId: string): Promise<InterviewTranscript[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const transcripts = this.getStoredTranscripts();
      return transcripts
        .filter(t => t.sessionId === sessionId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      console.error('Error fetching session transcripts:', error);
      return [];
    }
  }

  /**
   * Get user interview analytics
   */
  async getUserAnalytics(userId: string): Promise<InterviewAnalytics | null> {
    try {
      const response = await fetch(`${this.baseUrl}/getUserInterviewAnalytics?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { Authorization: `Bearer ${this.token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch user analytics');
      }

      return data.analytics || null;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      // Fallback to localStorage
      const analytics = this.getStoredAnalytics();
      return analytics.find(a => a.userId === userId) || null;
    }
  }

  /**
   * Search interview sessions by topic or keyword
   */
  async searchInterviewSessions(userId: string, query: string): Promise<InterviewSession[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const sessions = this.getStoredSessions();
      const lowercaseQuery = query.toLowerCase();
      
      return sessions.filter(s => 
        s.userId === userId && (
          s.topic.toLowerCase().includes(lowercaseQuery) ||
          s.feedback?.toLowerCase().includes(lowercaseQuery) ||
          s.responses.some(r => r.answer.toLowerCase().includes(lowercaseQuery))
        )
      );
    } catch (error) {
      console.error('Error searching interview sessions:', error);
      return [];
    }
  }

  /**
   * Delete interview session
   */
  async deleteInterviewSession(sessionId: string): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const sessions = this.getStoredSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      
      localStorage.setItem('interview_sessions', JSON.stringify(filteredSessions));
      
      // Also delete associated transcripts
      const transcripts = this.getStoredTranscripts();
      const filteredTranscripts = transcripts.filter(t => t.sessionId !== sessionId);
      localStorage.setItem('interview_transcripts', JSON.stringify(filteredTranscripts));
      
      console.log('Interview session deleted:', sessionId);
      return true;
    } catch (error) {
      console.error('Error deleting interview session:', error);
      return false;
    }
  }

  /**
   * Update user analytics based on completed session
   */
  private async updateUserAnalytics(userId: string, session: InterviewSession): Promise<void> {
    try {
      const analytics = this.getStoredAnalytics();
      let userAnalytics = analytics.find(a => a.userId === userId);
      
      if (!userAnalytics) {
        userAnalytics = {
          userId,
          totalInterviews: 0,
          averageScore: 0,
          improvementAreas: [],
          strongAreas: [],
          lastInterviewDate: new Date(),
          progressTrend: []
        };
        analytics.push(userAnalytics);
      }

      // Update analytics
      userAnalytics.totalInterviews += 1;
      userAnalytics.lastInterviewDate = new Date();
      
      if (session.overallScore) {
        // Update average score
        const newAverage = ((userAnalytics.averageScore * (userAnalytics.totalInterviews - 1)) + session.overallScore) / userAnalytics.totalInterviews;
        userAnalytics.averageScore = Math.round(newAverage * 100) / 100;
        
        // Add to progress trend
        userAnalytics.progressTrend.push({
          date: new Date(),
          score: session.overallScore
        });
        
        // Keep only last 20 data points
        if (userAnalytics.progressTrend.length > 20) {
          userAnalytics.progressTrend = userAnalytics.progressTrend.slice(-20);
        }
      }

      // Update improvement areas based on responses
      const allImprovements = session.responses.flatMap(r => r.improvements || []);
      const improvementCounts = allImprovements.reduce((acc, improvement) => {
        acc[improvement] = (acc[improvement] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      userAnalytics.improvementAreas = Object.entries(improvementCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([area]) => area);

      // Update strong areas
      const allStrengths = session.responses.flatMap(r => r.strengths || []);
      const strengthCounts = allStrengths.reduce((acc, strength) => {
        acc[strength] = (acc[strength] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      userAnalytics.strongAreas = Object.entries(strengthCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([area]) => area);

      localStorage.setItem('interview_analytics', JSON.stringify(analytics));
    } catch (error) {
      console.error('Error updating user analytics:', error);
    }
  }

  /**
   * Helper methods for localStorage operations
   */
  private getStoredSessions(): InterviewSession[] {
    try {
      const stored = localStorage.getItem('interview_sessions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getStoredTranscripts(): InterviewTranscript[] {
    try {
      const stored = localStorage.getItem('interview_transcripts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getStoredAnalytics(): InterviewAnalytics[] {
    try {
      const stored = localStorage.getItem('interview_analytics');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Fallback methods for offline functionality
   */
  private async createInterviewSessionFallback(userId: string, topic: string, questions: InterviewQuestion[]): Promise<InterviewSession> {
    const session: InterviewSession = {
      id: `session_${Date.now()}`,
      userId,
      topic,
      startTime: new Date(),
      questions,
      responses: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existingSessions = this.getStoredSessions();
    existingSessions.push(session);
    localStorage.setItem('interview_sessions', JSON.stringify(existingSessions));

    console.log('Interview session created (offline):', session);
    return session;
  }

  private async updateSessionResponseFallback(sessionId: string, response: InterviewResponse): Promise<boolean> {
    try {
      const sessions = this.getStoredSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) {
        throw new Error('Session not found');
      }

      sessions[sessionIndex].responses.push(response);
      sessions[sessionIndex].updatedAt = new Date();
      
      localStorage.setItem('interview_sessions', JSON.stringify(sessions));
      
      console.log('Session response updated (offline):', response);
      return true;
    } catch (error) {
      console.error('Error updating session response (offline):', error);
      return false;
    }
  }

  private async completeInterviewSessionFallback(sessionId: string, overallScore: number, feedback: string): Promise<boolean> {
    try {
      const sessions = this.getStoredSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) {
        throw new Error('Session not found');
      }

      sessions[sessionIndex].endTime = new Date();
      sessions[sessionIndex].overallScore = overallScore;
      sessions[sessionIndex].feedback = feedback;
      sessions[sessionIndex].updatedAt = new Date();
      
      localStorage.setItem('interview_sessions', JSON.stringify(sessions));
      
      // Update user analytics
      await this.updateUserAnalytics(sessions[sessionIndex].userId, sessions[sessionIndex]);
      
      console.log('Interview session completed (offline):', sessions[sessionIndex]);
      return true;
    } catch (error) {
      console.error('Error completing interview session (offline):', error);
      return false;
    }
  }

  /**
   * Clear all interview data (for testing/demo purposes)
   */
  async clearAllData(): Promise<void> {
    localStorage.removeItem('interview_sessions');
    localStorage.removeItem('interview_transcripts');
    localStorage.removeItem('interview_analytics');
    console.log('All interview data cleared');
  }
}

// Export singleton instance
export const mongoService = new MongoService();
export default mongoService;