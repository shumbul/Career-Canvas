# Career Canvas Backend API

Azure Functions backend for the Career Canvas application with AI-powered video interview functionality.

## Features

- **AI Video Interview System**
  - Real-time interview session management
  - Azure OpenAI integration for question generation and response evaluation
  - MongoDB storage for transcripts and analytics
  - User performance tracking and analytics

- **Authentication & Authorization**
  - Google OAuth integration
  - Microsoft Azure AD integration
  - JWT token validation

- **Mentorship Platform**
  - Mentor profile management
  - Connection requests and matching
  - Teams meeting scheduling

- **Story Sharing Platform**
  - Career story submission and management
  - Community engagement features

## AI Interview Functions

### Core Interview Functions

- `createInterviewSession` - Create new interview session with MongoDB storage
- `updateInterviewResponse` - Update interview responses in real-time
- `completeInterviewSession` - Finalize session with analytics updates
- `getInterviewData` - Retrieve user sessions and analytics
- `aiInterviewService` - Azure OpenAI integration for questions and evaluation

### Azure OpenAI Integration

- **Question Generation**: Dynamic interview questions based on topic and career level
- **Response Evaluation**: AI-powered scoring with detailed feedback
- **Follow-up Questions**: Context-aware follow-up generation
- **Categories**: Behavioral, Technical, System Design, Leadership, Early-career, Mid-career, General

## Environment Variables

Create a `local.settings.json` file:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "MONGODB_CONNECTION_STRING": "your_mongodb_connection_string",
    "AZURE_OPENAI_API_KEY": "your_azure_openai_key",
    "AZURE_OPENAI_ENDPOINT": "your_azure_openai_endpoint",
    "AZURE_OPENAI_DEPLOYMENT": "gpt-4",
    "AZURE_OPENAI_API_VERSION": "2024-02-15-preview"
  }
}
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Azure Functions Core Tools**
   ```bash
   npm install -g azure-functions-core-tools@4 --unsafe-perm true
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### AI Interview Endpoints

- `POST /api/createInterviewSession` - Create new interview session
- `POST /api/updateInterviewResponse` - Update session with user response
- `POST /api/completeInterviewSession` - Complete interview with final results
- `GET /api/getUserInterviewSessions` - Get user's interview history
- `GET /api/getInterviewSession` - Get specific interview session
- `GET /api/getUserInterviewAnalytics` - Get user performance analytics

### AI Service Endpoints

- `POST /api/generateInterviewQuestion` - Generate AI-powered interview questions
- `POST /api/evaluateInterviewResponse` - Evaluate user responses with AI
- `POST /api/generateFollowUpQuestion` - Generate contextual follow-up questions

## Structure

- `src/functions/` - Azure Function endpoints
- `src/utils/` - Utility functions (database, OpenAI)
- `package.json` - Dependencies and scripts
- `host.json` - Azure Functions configuration
- `tsconfig.json` - TypeScript configuration