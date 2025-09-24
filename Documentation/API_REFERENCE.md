# Career Canvas - API Reference & Integration Guide

## Overview

Career Canvas provides a comprehensive RESTful API for integrating with external systems, building custom applications, and extending platform functionality. This document serves as a complete API reference and integration guide.

## Base URL

```
Production: https://career-canvas-api.azurewebsites.net/api
Development: http://localhost:7071/api
```

## Authentication

### OAuth 2.0 Authentication

Career Canvas uses OAuth 2.0 for secure authentication with support for multiple identity providers.

#### Supported Providers
- **Microsoft Azure AD**: Enterprise authentication
- **Google OAuth**: Personal and G-Suite accounts
- **LinkedIn OAuth**: Professional network integration

#### Authentication Flow

```http
POST /auth/oauth/authorize
Content-Type: application/json

{
  "provider": "microsoft|google|linkedin",
  "redirect_uri": "https://your-app.com/callback",
  "scope": "profile email"
}
```

#### Token Usage

```http
Authorization: Bearer <jwt_token>
```

### API Key Authentication (Enterprise)

```http
X-API-Key: <your_api_key>
X-API-Secret: <your_api_secret>
```

## Core API Endpoints

### User Management API

#### Get User Profile

```http
GET /users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "title": "Senior Software Engineer",
    "department": "Engineering",
    "skills": ["React", "Node.js", "Azure"],
    "interests": ["career-growth", "technical-skills"],
    "experience": 5,
    "profileImage": "https://example.com/avatar.jpg"
  }
}
```

#### Update User Profile

```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Lead Software Engineer",
  "skills": ["React", "Node.js", "Azure", "Kubernetes"],
  "goals": ["leadership", "architecture"]
}
```

#### Get User Analytics

```http
GET /users/analytics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalInterviews": 15,
    "averageScore": 85.3,
    "improvementAreas": ["system-design", "leadership"],
    "strongAreas": ["technical-skills", "communication"],
    "progressTrend": [
      {"date": "2024-01-01", "score": 75},
      {"date": "2024-02-01", "score": 82},
      {"date": "2024-03-01", "score": 85}
    ]
  }
}
```

### AI Interview API

#### Create Interview Session

```http
POST /interview/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_123",
  "topic": "behavioral",
  "careerLevel": "mid-career",
  "duration": 30,
  "questionCount": 5
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "session_456",
    "userId": "user_123",
    "topic": "mid-career-behavioral",
    "startTime": "2024-03-15T10:00:00Z",
    "questions": [
      {
        "id": "q1",
        "question": "Tell me about a time when you had to lead a difficult project.",
        "category": "behavioral",
        "difficulty": "medium"
      }
    ],
    "status": "active"
  }
}
```

#### Generate AI Question

```http
POST /ai/generate-question
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "technical",
  "careerLevel": "senior",
  "previousQuestions": ["q1", "q2"],
  "context": {
    "role": "Software Architect",
    "industry": "Technology"
  }
}
```

**Response:**
```json
{
  "success": true,
  "question": {
    "id": "q3",
    "question": "How would you design a scalable microservices architecture for a high-traffic e-commerce platform?",
    "category": "system-design",
    "difficulty": "hard",
    "expectedDuration": 300,
    "evaluationCriteria": [
      "scalability considerations",
      "service decomposition",
      "data consistency"
    ]
  }
}
```

#### Evaluate Interview Response

```http
POST /ai/evaluate-response
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session_456",
  "questionId": "q1",
  "answer": "In my previous role, I led a cross-functional team of 8 developers...",
  "metadata": {
    "duration": 120,
    "confidence": 0.85
  }
}
```

**Response:**
```json
{
  "success": true,
  "evaluation": {
    "score": 88,
    "feedback": "Excellent example demonstrating leadership skills and problem-solving approach.",
    "strengths": [
      "Clear structure and storytelling",
      "Specific metrics and outcomes",
      "Leadership demonstration"
    ],
    "improvements": [
      "Could elaborate on stakeholder management",
      "More details on risk mitigation"
    ],
    "followUpQuestions": [
      "How did you handle resistance from team members?",
      "What would you do differently next time?"
    ]
  }
}
```

#### Complete Interview Session

```http
POST /interview/sessions/{sessionId}/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "overallFeedback": "Strong performance with room for improvement in system design.",
  "recommendations": [
    "Practice system design scenarios",
    "Study distributed systems patterns"
  ]
}
```

### Mentorship API

#### Search Mentors

```http
GET /mentors/search?skills=React,Leadership&department=Engineering&availability=available&page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "mentors": [
    {
      "id": "mentor_789",
      "name": "Sarah Johnson",
      "title": "Senior Engineering Manager",
      "department": "Engineering",
      "skills": ["React", "Leadership", "System Design"],
      "bio": "Passionate about developing technical leaders...",
      "experience": 10,
      "rating": 4.8,
      "availability": "available",
      "menteeCount": 12,
      "nextAvailable": "2024-03-20T14:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### Get Mentor Profile

```http
GET /mentors/{mentorId}
Authorization: Bearer <token>
```

#### Request Mentorship Connection

```http
POST /mentors/{mentorId}/connect
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Hi Sarah, I'm interested in learning more about technical leadership...",
  "goals": ["leadership-skills", "career-advancement"],
  "preferredFrequency": "bi-weekly"
}
```

#### Schedule Mentoring Session

```http
POST /mentors/{mentorId}/schedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "dateTime": "2024-03-25T15:00:00Z",
  "duration": 60,
  "topic": "Career progression planning",
  "meetingType": "teams|zoom|phone",
  "agenda": "Discuss technical leadership transition"
}
```

### Learning Resources API

#### Get Learning Paths

```http
GET /learning/paths?category=technical&level=intermediate&format=course&provider=Microsoft%20Learn
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "learningPaths": [
    {
      "id": "path_101",
      "title": "Azure Solution Architecture",
      "description": "Comprehensive guide to designing Azure solutions",
      "category": "technical",
      "provider": "Microsoft Learn",
      "duration": "8 hours",
      "level": "intermediate",
      "modules": [
        {
          "id": "module_1",
          "title": "Azure Compute Services",
          "duration": "2 hours",
          "completed": false
        }
      ],
      "prerequisites": ["Basic Azure knowledge"],
      "certification": "Azure Solutions Architect"
    }
  ]
}
```

#### Get Personalized Recommendations

```http
GET /learning/recommendations
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "type": "skill-gap",
      "title": "Kubernetes Fundamentals",
      "reason": "Based on your career goals and current skill set",
      "priority": "high",
      "estimatedTime": "4 hours"
    },
    {
      "type": "trending",
      "title": "AI and Machine Learning Basics",
      "reason": "Popular among professionals in your field",
      "priority": "medium",
      "estimatedTime": "6 hours"
    }
  ]
}
```

#### Track Learning Progress

```http
POST /learning/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "resourceId": "path_101",
  "moduleId": "module_1",
  "status": "completed",
  "timeSpent": 120,
  "score": 95
}
```

### Analytics & Reporting API

#### Get Platform Analytics

```http
GET /analytics/platform?startDate=2024-01-01&endDate=2024-03-31
Authorization: Bearer <token>
X-API-Key: <enterprise_key>
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "userEngagement": {
      "activeUsers": 1250,
      "newUsers": 180,
      "retentionRate": 0.76
    },
    "interviewMetrics": {
      "totalSessions": 450,
      "averageScore": 82.3,
      "completionRate": 0.89
    },
    "mentorshipMetrics": {
      "activeConnections": 320,
      "satisfactionRate": 4.6,
      "sessionCount": 180
    }
  }
}
```

#### Export User Data

```http
GET /analytics/export/users?format=csv&fields=name,email,department,lastLogin
Authorization: Bearer <token>
X-API-Key: <enterprise_key>
```

## WebSocket API (Real-time Features)

### Connection

```javascript
const socket = new WebSocket('wss://career-canvas-api.azurewebsites.net/ws');

socket.onopen = function(event) {
    // Send authentication
    socket.send(JSON.stringify({
        type: 'authenticate',
        token: 'your_jwt_token'
    }));
};
```

### Interview Session Events

```javascript
// Subscribe to interview updates
socket.send(JSON.stringify({
    type: 'subscribe',
    channel: 'interview_session',
    sessionId: 'session_456'
}));

// Receive real-time feedback
socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'interview_feedback') {
        // Handle real-time feedback
        console.log(data.feedback);
    }
};
```

### Notification Events

```javascript
// Subscribe to notifications
socket.send(JSON.stringify({
    type: 'subscribe',
    channel: 'notifications',
    userId: 'user_123'
}));

// Receive notifications
socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'mentor_response') {
        // Handle mentor response notification
        displayNotification(data.message);
    }
};
```

## Webhooks

### Configuration

```http
POST /webhooks/configure
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/career-canvas",
  "events": [
    "interview.completed",
    "mentor.connected",
    "learning.milestone"
  ],
  "secret": "your_webhook_secret"
}
```

### Event Examples

#### Interview Completed

```json
{
  "event": "interview.completed",
  "timestamp": "2024-03-15T10:30:00Z",
  "data": {
    "sessionId": "session_456",
    "userId": "user_123",
    "score": 85,
    "duration": 1800,
    "completedQuestions": 5
  }
}
```

#### Mentor Connected

```json
{
  "event": "mentor.connected",
  "timestamp": "2024-03-15T11:00:00Z",
  "data": {
    "menteeId": "user_123",
    "mentorId": "mentor_789",
    "connectionDate": "2024-03-15T11:00:00Z"
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript SDK

```bash
npm install @career-canvas/sdk
```

```typescript
import { CareerCanvasSDK } from '@career-canvas/sdk';

const sdk = new CareerCanvasSDK({
  apiKey: 'your_api_key',
  baseUrl: 'https://career-canvas-api.azurewebsites.net/api'
});

// Create interview session
const session = await sdk.interviews.create({
  topic: 'behavioral',
  careerLevel: 'mid-career'
});

// Get mentors
const mentors = await sdk.mentors.search({
  skills: ['React', 'Leadership'],
  department: 'Engineering'
});
```

### Python SDK

```bash
pip install career-canvas-sdk
```

```python
from career_canvas import CareerCanvasClient

client = CareerCanvasClient(
    api_key='your_api_key',
    base_url='https://career-canvas-api.azurewebsites.net/api'
)

# Create interview session
session = client.interviews.create(
    topic='behavioral',
    career_level='mid-career'
)

# Get user analytics
analytics = client.users.get_analytics(user_id='user_123')
```

### .NET SDK

```bash
dotnet add package CareerCanvas.SDK
```

```csharp
using CareerCanvas.SDK;

var client = new CareerCanvasClient(new CareerCanvasConfig
{
    ApiKey = "your_api_key",
    BaseUrl = "https://career-canvas-api.azurewebsites.net/api"
});

// Create interview session
var session = await client.Interviews.CreateAsync(new CreateInterviewRequest
{
    Topic = "behavioral",
    CareerLevel = "mid-career"
});

// Search mentors
var mentors = await client.Mentors.SearchAsync(new MentorSearchRequest
{
    Skills = new[] { "React", "Leadership" },
    Department = "Engineering"
});
```

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "careerLevel",
        "message": "Must be one of: early-career, mid-career, senior-career"
      }
    ],
    "requestId": "req_789012"
  }
}
```

### HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Invalid or expired token |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `RATE_LIMIT_EXCEEDED` | API rate limit exceeded |
| `SERVICE_UNAVAILABLE` | Temporary service unavailability |

## Rate Limiting

### Limits

| Plan | Requests per Hour | Concurrent Connections |
|------|-------------------|------------------------|
| Free | 1,000 | 5 |
| Professional | 10,000 | 25 |
| Enterprise | 100,000 | 100 |

### Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1710334800
X-RateLimit-Retry-After: 3600
```

## Versioning

### API Versioning Strategy

Career Canvas uses URL path versioning:

```
/v1/users/profile  (Current stable version)
/v2/users/profile  (Next version - beta)
```

### Version Support Policy

- **Current Version (v1)**: Fully supported with all features
- **Previous Version**: Supported for 12 months after new version release
- **Beta Version**: Available for testing, not recommended for production

### Migration Guide

When migrating between API versions, refer to the migration guides available at:
- [v1 to v2 Migration Guide](./migrations/v1-to-v2.md)
- [Breaking Changes](./breaking-changes.md)

## Best Practices

### Authentication

1. **Secure Token Storage**: Store JWT tokens securely (HttpOnly cookies, secure storage)
2. **Token Refresh**: Implement automatic token refresh logic
3. **Scope Management**: Request minimal required scopes

### Performance

1. **Caching**: Implement client-side caching for frequently accessed data
2. **Pagination**: Use pagination for large result sets
3. **Batch Requests**: Combine multiple operations when possible
4. **Connection Pooling**: Reuse HTTP connections

### Error Handling

1. **Retry Logic**: Implement exponential backoff for transient errors
2. **Graceful Degradation**: Handle API unavailability gracefully
3. **User Feedback**: Provide meaningful error messages to users

### Security

1. **Input Validation**: Validate all user inputs
2. **HTTPS Only**: Always use HTTPS in production
3. **Secret Management**: Never expose API keys in client-side code
4. **CORS**: Configure CORS appropriately for web applications

## Support and Resources

### Documentation
- [API Changelog](./changelog.md)
- [Status Page](https://status.career-canvas.com)
- [Developer Portal](https://developers.career-canvas.com)

### Community
- [GitHub Repository](https://github.com/career-canvas/api)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/career-canvas)
- [Discord Community](https://discord.gg/career-canvas)

### Support Channels
- **Email**: api-support@career-canvas.com
- **Enterprise Support**: enterprise@career-canvas.com
- **Emergency**: Call +1-800-CAREER-1 (Enterprise customers only)

This API reference provides comprehensive documentation for integrating with the Career Canvas platform. For additional examples and tutorials, visit our [Developer Portal](https://developers.career-canvas.com).