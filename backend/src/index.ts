import { app } from '@azure/functions';

// Import function handlers
import './functions/hello';
import './functions/submitStory';
import './functions/submitMentorshipPreferences';
import './functions/getMentorshipPreferences';
import './functions/testConnection';
import './functions/getStories';
import './functions/updateStory';
import './functions/deleteStory';
import './functions/getMentors';
import './functions/seedMentors';
import './functions/submitConnectionRequest';
import './functions/scheduleTeamsMeeting';
import './functions/createMentorProfile';
import './functions/deleteMentorProfile';
import './functions/authGoogle';
import './functions/authMicrosoft';
import './functions/validateToken';

// AI Interview Functions
import './functions/createInterviewSession';
import './functions/updateInterviewResponse';
import './functions/completeInterviewSession';
import './functions/getInterviewData';
import './functions/aiInterviewService';

// Export the app for Azure Functions
export default app;