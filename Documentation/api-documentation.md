# Career Canvas - API Documentation

## API Overview

The Career Canvas API is built with Azure Functions and provides endpoints for user management, career stories, profile data, and AI services integration. This document provides comprehensive information about the available endpoints, request/response formats, and authentication requirements.

## Base URL

```
Production: https://careercanvas.azurewebsites.net/api
Development: http://localhost:7073/api
```

## Authentication

Most API endpoints require authentication. The API uses Azure AD for authentication.

**Authentication Headers:**

```
Authorization: Bearer {token}
```

Where `{token}` is a valid JWT token obtained from the Microsoft Identity Platform.

## API Endpoints

### Health Check

#### GET /hello

Simple health check endpoint to verify the API is running.

**Request:**
```http
GET /api/hello HTTP/1.1
Host: careercanvas.azurewebsites.net
```

**Response:**
```json
{
  "message": "Hello from Career Canvas API!",
  "timestamp": "2025-09-17T12:34:56.789Z"
}
```

**Status Codes:**
- 200: Success

### Career Stories

#### GET /stories

Retrieve a list of career stories, with optional filtering by tags.

**Request:**
```http
GET /api/stories?tags=tech,leadership&limit=10 HTTP/1.1
Host: careercanvas.azurewebsites.net
```

**Query Parameters:**
- `tags` (optional): Comma-separated list of tags to filter stories
- `limit` (optional): Maximum number of stories to return (default: 20)
- `offset` (optional): Number of stories to skip (for pagination, default: 0)

**Response:**
```json
{
  "stories": [
    {
      "id": "story123",
      "title": "My Career Journey",
      "author": {
        "id": "user456",
        "name": "John Doe"
      },
      "content": "This is my career story...",
      "tags": ["tech", "leadership", "growth"],
      "createdAt": "2025-09-15T10:23:45.678Z",
      "updatedAt": "2025-09-15T10:23:45.678Z"
    },
    // More stories...
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "nextOffset": 10
  }
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request (e.g., invalid query parameters)
- 500: Server error

#### POST /stories

Create a new career story.

**Request:**
```http
POST /api/stories HTTP/1.1
Host: careercanvas.azurewebsites.net
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "My Leadership Journey",
  "content": "This is the story of how I became a leader...",
  "tags": ["leadership", "personal-growth", "career-change"]
}
```

**Request Body:**
- `title` (required): Story title (3-100 characters)
- `content` (required): Story content (50-5000 characters)
- `tags` (optional): Array of tags (0-5 tags, each 2-20 characters)

**Response:**
```json
{
  "id": "story789",
  "title": "My Leadership Journey",
  "author": {
    "id": "user123",
    "name": "Jane Smith"
  },
  "content": "This is the story of how I became a leader...",
  "tags": ["leadership", "personal-growth", "career-change"],
  "createdAt": "2025-09-17T12:34:56.789Z",
  "updatedAt": "2025-09-17T12:34:56.789Z"
}
```

**Status Codes:**
- 201: Created successfully
- 400: Invalid request (validation errors)
- 401: Unauthorized
- 500: Server error

#### GET /stories/:id

Retrieve a specific career story by ID.

**Request:**
```http
GET /api/stories/story123 HTTP/1.1
Host: careercanvas.azurewebsites.net
```

**Response:**
```json
{
  "id": "story123",
  "title": "My Career Journey",
  "author": {
    "id": "user456",
    "name": "John Doe"
  },
  "content": "This is my career story...",
  "tags": ["tech", "leadership", "growth"],
  "createdAt": "2025-09-15T10:23:45.678Z",
  "updatedAt": "2025-09-15T10:23:45.678Z"
}
```

**Status Codes:**
- 200: Success
- 404: Story not found
- 500: Server error

#### PUT /stories/:id

Update an existing career story.

**Request:**
```http
PUT /api/stories/story123 HTTP/1.1
Host: careercanvas.azurewebsites.net
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "My Updated Career Journey",
  "content": "I've updated my career story with new insights...",
  "tags": ["tech", "leadership", "mentorship"]
}
```

**Response:**
```json
{
  "id": "story123",
  "title": "My Updated Career Journey",
  "author": {
    "id": "user456",
    "name": "John Doe"
  },
  "content": "I've updated my career story with new insights...",
  "tags": ["tech", "leadership", "mentorship"],
  "createdAt": "2025-09-15T10:23:45.678Z",
  "updatedAt": "2025-09-17T14:25:36.789Z"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request
- 401: Unauthorized
- 403: Forbidden (not the author)
- 404: Story not found
- 500: Server error

#### DELETE /stories/:id

Delete a career story.

**Request:**
```http
DELETE /api/stories/story123 HTTP/1.1
Host: careercanvas.azurewebsites.net
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Story deleted successfully",
  "id": "story123"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Forbidden (not the author)
- 404: Story not found
- 500: Server error

### User Profiles

#### GET /users/me

Retrieve the current user's profile.

**Request:**
```http
GET /api/users/me HTTP/1.1
Host: careercanvas.azurewebsites.net
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "user123",
  "email": "jane.smith@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "profilePicture": "https://example.com/profile.jpg",
  "preferences": {
    "notifications": true,
    "publicProfile": false,
    "dataSharing": true
  },
  "createdAt": "2025-01-15T08:12:34.567Z",
  "updatedAt": "2025-09-10T15:23:45.678Z"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 500: Server error

### Career Profiles

#### GET /career-profiles/me

Retrieve the current user's career profile.

**Request:**
```http
GET /api/career-profiles/me HTTP/1.1
Host: careercanvas.azurewebsites.net
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "profile123",
  "userId": "user123",
  "currentRole": "Senior Software Engineer",
  "currentCompany": "Microsoft",
  "yearsOfExperience": 8,
  "skills": ["JavaScript", "TypeScript", "React", "Azure", "Node.js"],
  "interests": ["AI", "Cloud Computing", "Leadership"],
  "careerGoals": ["Technical Leadership", "Mentoring"],
  "industryPreferences": ["Technology", "Education"],
  "locationPreferences": ["Remote", "Seattle", "Bangalore"],
  "education": [
    {
      "institution": "University of Washington",
      "degree": "Master's",
      "field": "Computer Science",
      "graduationYear": 2018
    }
  ],
  "experience": [
    {
      "company": "Microsoft",
      "role": "Senior Software Engineer",
      "startDate": "2020-03-01T00:00:00.000Z",
      "description": "Leading development of cloud-based solutions",
      "achievements": [
        "Led a team of 5 engineers",
        "Reduced system latency by 40%"
      ]
    },
    {
      "company": "Amazon",
      "role": "Software Development Engineer",
      "startDate": "2018-01-15T00:00:00.000Z",
      "endDate": "2020-02-28T00:00:00.000Z",
      "description": "Worked on e-commerce platform optimization",
      "achievements": [
        "Improved checkout conversion by 15%",
        "Implemented A/B testing framework"
      ]
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 404: Career profile not found
- 500: Server error

### AI Services

#### POST /ai/career-advice

Get AI-generated career advice based on the user's profile.

**Request:**
```http
POST /api/ai/career-advice HTTP/1.1
Host: careercanvas.azurewebsites.net
Content-Type: application/json
Authorization: Bearer {token}

{
  "query": "What skills should I develop to advance in my career?",
  "includeProfileContext": true
}
```

**Response:**
```json
{
  "advice": "Based on your background in software engineering and interest in AI, I recommend developing these skills:\n\n1. Machine Learning fundamentals\n2. Cloud architecture design patterns\n3. Team leadership and mentoring\n4. Product management basics\n\nThese skills would complement your technical expertise and position you well for technical leadership roles.",
  "relatedResources": [
    {
      "title": "Microsoft Learn: AI Fundamentals",
      "url": "https://learn.microsoft.com/ai-fundamentals"
    },
    {
      "title": "Cloud Architecture Patterns",
      "url": "https://learn.microsoft.com/azure/architecture/patterns/"
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request
- 401: Unauthorized
- 500: Server error

## Error Handling

All API endpoints follow a consistent error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request was invalid.",
    "details": [
      {
        "field": "title",
        "message": "Title must be between 3 and 100 characters"
      }
    ]
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `NOT_FOUND` | Resource not found |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Permission denied |
| `INTERNAL_ERROR` | Server error |

## Rate Limiting

The API implements rate limiting to ensure fair usage and system stability:

- 100 requests per minute per authenticated user
- 20 requests per minute per IP address for unauthenticated requests

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1632511234
```

## Versioning

The API follows semantic versioning. The current version is v1.

Future versions will be accessible via:
```
https://careercanvas.azurewebsites.net/api/v2/...
```

## SDK & Client Libraries

- [JavaScript Client (npm)](https://www.npmjs.com/package/career-canvas-client)
- [Python Client (PyPI)](https://pypi.org/project/career-canvas-client/)
- [.NET Client (NuGet)](https://www.nuget.org/packages/CareerCanvas.Client)

## Postman Collection

A Postman collection for testing the API is available [here](https://www.getpostman.com/collections/career-canvas-api).
