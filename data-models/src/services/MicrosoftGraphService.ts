import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@azure/msal-node';

export interface MSGraphUser {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  userPrincipalName: string;
  mail: string;
  jobTitle?: string;
  department?: string;
  companyName?: string;
  officeLocation?: string;
}

export interface MSGraphProfile {
  skills: string[];
  interests: string[];
  projects: Array<{
    name: string;
    description: string;
    displayName: string;
  }>;
  positions: Array<{
    companyName: string;
    displayName: string;
    jobTitle: string;
    startMonthYear: Date;
    endMonthYear?: Date;
    location: string;
    summary: string;
  }>;
  educationalActivities: Array<{
    institution: string;
    program: string;
    activities: string[];
    degree: string;
    endMonthYear: Date;
  }>;
}

export class MicrosoftGraphService {
  private graphClient: Client;

  constructor(authProvider: AuthenticationProvider) {
    this.graphClient = Client.initWithMiddleware({ authProvider });
  }

  /**
   * Get user basic information from Microsoft Graph
   */
  async getUserProfile(userId?: string): Promise<MSGraphUser> {
    try {
      const endpoint = userId ? `/users/${userId}` : '/me';
      const user = await this.graphClient
        .api(endpoint)
        .select('id,displayName,givenName,surname,userPrincipalName,mail,jobTitle,department,companyName,officeLocation')
        .get();
      
      return user as MSGraphUser;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile from Microsoft Graph');
    }
  }

  /**
   * Get user's profile information including skills, interests, and experience
   */
  async getExtendedProfile(userId?: string): Promise<MSGraphProfile> {
    try {
      const endpoint = userId ? `/users/${userId}/profile` : '/me/profile';
      
      // Get skills
      const skills = await this.graphClient
        .api(`${endpoint}/skills`)
        .get();

      // Get interests
      const interests = await this.graphClient
        .api(`${endpoint}/interests`)
        .get();

      // Get projects
      const projects = await this.graphClient
        .api(`${endpoint}/projects`)
        .get();

      // Get work positions
      const positions = await this.graphClient
        .api(`${endpoint}/positions`)
        .get();

      // Get educational activities
      const educationalActivities = await this.graphClient
        .api(`${endpoint}/educationalActivities`)
        .get();

      return {
        skills: skills.value || [],
        interests: interests.value || [],
        projects: projects.value || [],
        positions: positions.value || [],
        educationalActivities: educationalActivities.value || []
      };
    } catch (error) {
      console.error('Error fetching extended profile:', error);
      throw new Error('Failed to fetch extended profile from Microsoft Graph');
    }
  }

  /**
   * Get user's calendar events for networking opportunities
   */
  async getCalendarEvents(startDate?: Date, endDate?: Date): Promise<any[]> {
    try {
      let query = this.graphClient.api('/me/events');
      
      if (startDate && endDate) {
        const startTime = startDate.toISOString();
        const endTime = endDate.toISOString();
        query = query.filter(`start/dateTime ge '${startTime}' and end/dateTime le '${endTime}'`);
      }

      const events = await query
        .select('subject,start,end,location,attendees,organizer')
        .top(50)
        .get();

      return events.value || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw new Error('Failed to fetch calendar events from Microsoft Graph');
    }
  }

  /**
   * Search for people in the organization
   */
  async searchPeople(query: string): Promise<any[]> {
    try {
      const people = await this.graphClient
        .api('/me/people')
        .search(query)
        .select('displayName,givenName,surname,emailAddresses,jobTitle,companyName,department')
        .top(20)
        .get();

      return people.value || [];
    } catch (error) {
      console.error('Error searching people:', error);
      throw new Error('Failed to search people in Microsoft Graph');
    }
  }
}

export default MicrosoftGraphService;