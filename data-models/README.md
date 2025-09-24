# Data Models

This folder contains MongoDB schemas and Microsoft Graph API integration for Career Canvas.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure your database and API credentials
3. Run in development: `npm run dev`
4. Build: `npm run build`

## Structure

### Schemas (`src/schemas/`)
- `User.ts` - User account information
- `CareerProfile.ts` - Detailed career profile data

### Services (`src/services/`)
- `MicrosoftGraphService.ts` - Integration with Microsoft Graph API

## MongoDB Schemas

### User Schema
- Basic user information (email, name, preferences)
- Microsoft integration fields
- Timestamps and indexing

### CareerProfile Schema
- Detailed career information
- Skills, interests, and goals
- Education and experience history
- Salary preferences and certifications

## Microsoft Graph Integration

The Microsoft Graph service provides:
- User profile synchronization
- Extended profile data (skills, interests, projects)
- Calendar integration for networking
- People search within organization

## Configuration

Configure your database and API credentials in the `.env` file:

- `MONGODB_URI` - Your MongoDB connection string
- `MICROSOFT_CLIENT_ID` - Your Microsoft App registration client ID
- `MICROSOFT_CLIENT_SECRET` - Your Microsoft App client secret
- `MICROSOFT_TENANT_ID` - Your Azure AD tenant ID