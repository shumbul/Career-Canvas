# PowerApps Integration API Specification

## Overview
This document defines the REST API endpoints for PowerApps to submit career stories and mentorship preferences to MongoDB.

## Base URL
```
https://your-backend-api.azurewebsites.net/api
```

## Authentication
- Use Azure AD authentication
- Include Bearer token in Authorization header
- PowerApps will handle token management automatically

## API Endpoints

### 1. Submit Career Story
**POST** `/stories`

**Request Body:**
```json
{
  "userId": "string", // Azure AD user ID
  "title": "string", // Required, max 200 chars
  "content": "string", // Required, max 5000 chars
  "category": "string", // Required: "leadership", "technical", "career-change", "mentorship", "teamwork", "problem-solving"
  "tags": ["string"], // Array of tags, max 10
  "isPublic": boolean, // Default: true
  "mediaUrls": ["string"], // Optional attachments
  "careerLevel": "string", // "entry", "mid", "senior", "executive"
  "industry": "string", // User's industry
  "createdAt": "ISO8601 datetime"
}
```

**Response:**
```json
{
  "success": true,
  "storyId": "mongodb_object_id",
  "message": "Story submitted successfully"
}
```

### 2. Submit Mentorship Preferences
**POST** `/mentorship/preferences`

**Request Body:**
```json
{
  "userId": "string", // Azure AD user ID
  "mentorshipType": "string", // "seeking-mentor", "offering-mentor", "both"
  "preferences": {
    "industries": ["string"], // Preferred industries
    "skills": ["string"], // Skills to learn/teach
    "careerLevels": ["string"], // Preferred mentor/mentee levels
    "meetingFrequency": "string", // "weekly", "bi-weekly", "monthly", "as-needed"
    "communicationStyle": "string", // "formal", "casual", "structured"
    "goals": ["string"], // Career goals
    "timeCommitment": "string", // Hours per month
    "remotePreference": "string" // "remote-only", "in-person", "hybrid"
  },
  "availability": {
    "timezone": "string",
    "preferredTimes": ["string"], // e.g., ["monday-morning", "wednesday-evening"]
    "startDate": "ISO8601 date",
    "endDate": "ISO8601 date" // Optional
  },
  "bio": "string", // Max 1000 chars
  "experience": "string", // Years of experience
  "updatedAt": "ISO8601 datetime"
}
```

**Response:**
```json
{
  "success": true,
  "preferenceId": "mongodb_object_id",
  "message": "Preferences updated successfully"
}
```

### 3. Get User Stories (for PowerApps gallery)
**GET** `/stories/user/{userId}`

**Response:**
```json
{
  "success": true,
  "stories": [
    {
      "id": "mongodb_object_id",
      "title": "string",
      "category": "string",
      "tags": ["string"],
      "createdAt": "ISO8601 datetime",
      "likes": number,
      "views": number
    }
  ]
}
```

### 4. Get Mentorship Matches (for PowerApps)
**GET** `/mentorship/matches/{userId}`

**Response:**
```json
{
  "success": true,
  "matches": [
    {
      "id": "mongodb_object_id",
      "name": "string",
      "title": "string",
      "company": "string",
      "skills": ["string"],
      "matchScore": number, // 0-100
      "availability": "string"
    }
  ]
}
```

## MongoDB Collections

### Stories Collection
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "title": "string",
  "content": "string",
  "category": "string",
  "tags": ["string"],
  "isPublic": boolean,
  "mediaUrls": ["string"],
  "careerLevel": "string",
  "industry": "string",
  "likes": number,
  "views": number,
  "comments": [
    {
      "userId": "string",
      "content": "string",
      "createdAt": "Date"
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Mentorship Preferences Collection
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "mentorshipType": "string",
  "preferences": {
    "industries": ["string"],
    "skills": ["string"],
    "careerLevels": ["string"],
    "meetingFrequency": "string",
    "communicationStyle": "string",
    "goals": ["string"],
    "timeCommitment": "string",
    "remotePreference": "string"
  },
  "availability": {
    "timezone": "string",
    "preferredTimes": ["string"],
    "startDate": "Date",
    "endDate": "Date"
  },
  "bio": "string",
  "experience": "string",
  "isActive": boolean,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Users Collection (Profile Data)
```json
{
  "_id": "ObjectId",
  "azureId": "string", // Azure AD user ID
  "email": "string",
  "displayName": "string",
  "jobTitle": "string",
  "company": "string",
  "department": "string",
  "location": "string",
  "profilePicture": "string",
  "careerLevel": "string",
  "industry": "string",
  "skills": ["string"],
  "interests": ["string"],
  "joinDate": "Date",
  "lastActive": "Date"
}
```

## Error Responses
All endpoints return consistent error format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {} // Additional context
  }
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## PowerApps Integration Notes
1. Use PowerApps HTTP connector to call these APIs
2. Store user context from Office365Users connector
3. Implement offline capability with PowerApps collections
4. Use PowerApps validation rules matching API requirements
5. Handle file uploads through PowerApps attachment controls