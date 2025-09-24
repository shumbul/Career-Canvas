# Career Canvas Microsoft Teams App

This directory contains the Microsoft Teams app configuration for Career Canvas, which embeds the storytelling hub, mentor dashboard, and progress tracking components as Teams tabs.

## 📁 Files Overview

### Teams App Manifest
- `manifest.json` - Teams app configuration and metadata
- `color.png.txt` - Placeholder for 192x192 color icon
- `outline.png.txt` - Placeholder for 32x32 outline icon
- `create-package.js` - Script to create Teams app package (.zip)

### React Components (in frontend/src/components/teams/)
- `TeamsApp.tsx` - Main Teams app router component
- `MentorTab.tsx` - Teams wrapper for mentor dashboard
- `StoriesTab.tsx` - Teams wrapper for storytelling hub
- `ProgressTab.tsx` - Career progress tracking tab
- `TeamsApp.css` - Teams-specific styles

### Tab HTML Files (in frontend/public/)
- `mentors.html` - HTML entry point for mentor tab
- `stories.html` - HTML entry point for stories tab
- `progress.html` - HTML entry point for progress tab

## 🚀 Setup Instructions

### 1. Prerequisites
- Microsoft Teams developer account
- Azure App Registration (for SSO)
- Deployed React app (Azure Static Web Apps recommended)

### 2. Prepare Icons
Replace the placeholder files with actual PNG icons:
- `color.png` - 192x192 colored icon
- `outline.png` - 32x32 transparent outline icon

### 3. Update Manifest
Edit `manifest.json` and update these values:
```json
{
  "id": "your-unique-guid-here",
  "developer": {
    "websiteUrl": "https://your-app-url.com",
    "privacyUrl": "https://your-app-url.com/privacy",
    "termsOfUseUrl": "https://your-app-url.com/terms"
  },
  "staticTabs": [
    {
      "contentUrl": "https://your-app-url.com/tabs/mentors",
      "websiteUrl": "https://your-app-url.com/mentors"
    }
  ],
  "validDomains": [
    "your-app-url.com"
  ],
  "webApplicationInfo": {
    "id": "your-azure-app-registration-id"
  }
}
```

### 4. Deploy React App
Deploy your React app to a publicly accessible URL (e.g., Azure Static Web Apps):

```bash
cd ../frontend
npm run build
# Deploy build/ folder to your hosting platform
```

### 5. Create Teams Package
```bash
cd teams-app
npm install
npm run package
```

This creates `career-canvas-teams-app.zip` ready for Teams App Studio.

### 6. Install in Teams

#### Option A: Teams Developer Portal (Recommended)
1. Go to [Teams Developer Portal](https://dev.teams.microsoft.com/)
2. Click "Import app" and upload the .zip file
3. Update URLs to point to your deployed app
4. Install in your Teams environment

#### Option B: Teams App Studio (Legacy)
1. In Teams, install "App Studio" app
2. Go to "Manifest editor" tab
3. Click "Import an existing app"
4. Upload the .zip file
5. Update configuration as needed
6. Test and install

## 📋 Teams App Features

### Tab 1: Find Mentors
- **URL**: `/tabs/mentors` or `/mentors.html`
- **Features**: 
  - Mentor discovery with intelligent filtering
  - Department, skills, and availability filters
  - Teams context integration (user info, team name)
  - Connect with mentors in your organization

### Tab 2: Professional Stories
- **URL**: `/tabs/stories` or `/stories.html`
- **Features**:
  - Share career journey stories
  - Professional storytelling hub
  - Team-specific story sharing
  - Career inspiration and learning

### Tab 3: Progress Tracking
- **URL**: `/tabs/progress` or `/progress.html`
- **Features**:
  - Career goal tracking
  - Achievement metrics and points
  - Activity feed
  - Progress visualization

## 🔧 Development

### Local Testing
```bash
# Start the React app
cd ../frontend
npm start

# Test individual tabs at:
# http://localhost:3000/mentors.html
# http://localhost:3000/stories.html  
# http://localhost:3000/progress.html
```

### Teams Context Integration
The Teams components automatically:
- Initialize Microsoft Teams SDK
- Retrieve user context (name, team, tenant)
- Adapt UI for Teams environment
- Handle Teams-specific styling and navigation

### Adding New Features
1. Create new React component in `frontend/src/components/`
2. Create Teams wrapper in `frontend/src/components/teams/`
3. Add new tab configuration to `manifest.json`
4. Create corresponding HTML file in `frontend/public/`
5. Update `TeamsApp.tsx` router

## 🎨 Teams Design Guidelines

### Colors
- Primary: #6264a7 (Teams purple)
- Success: #237b4b (Teams green)  
- Warning: #ff8c00 (Teams orange)
- Error: #c4314b (Teams red)

### Layout
- Use Teams-compatible spacing and typography
- Ensure mobile responsiveness
- Follow Teams accessibility guidelines
- Use Teams Fluent UI components when possible

## 🔐 Security & Permissions

### Required Permissions
- `identity` - Access user profile information
- `messageTeamMembers` - Send notifications to team members

### Valid Domains
- Add all domains that will host your app content
- Include authentication domains (e.g., login.microsoftonline.com)
- Ensure HTTPS for all domains

### SSO Integration
For production, integrate Azure AD SSO:
1. Register app in Azure AD
2. Configure authentication in React app
3. Update `webApplicationInfo` in manifest
4. Test SSO flow in Teams

## 📊 Analytics & Monitoring

Consider adding:
- Application Insights for performance monitoring
- Teams usage analytics
- User engagement tracking
- Error reporting and logging

---

**Ready to deploy!** 🚀 Your Career Canvas Teams app will provide seamless career development tools directly within the Teams environment.