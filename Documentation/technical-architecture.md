# Career Canvas - Technical Architecture

## System Architecture

The Career Canvas application is built using a modern, modular architecture with a focus on scalability, maintainability, and extensibility. The system is designed to leverage AI services, Microsoft Graph integration, and a robust data layer.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Career Canvas Platform                   │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)                                 │
│  ├─ User Authentication & Profile Management                    │
│  ├─ StorytellingHub & Career Stories                            │
│  ├─ Dashboard & Career Insights                                 │
│  └─ Resume Analysis & Interview Prep                            │
├─────────────────────────────────────────────────────────────────┤
│  Backend API (Azure Functions)                                 │
│  ├─ Authentication & Authorization                              │
│  ├─ Story Management API                                        │
│  ├─ AI Services Integration                                     │
│  └─ Microsoft Graph Integration                                 │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer                                                     │
│  ├─ MongoDB/Cosmos DB (User Profiles & Career Data)            │
│  ├─ Microsoft Graph API (Organizational Data)                  │
│  └─ Azure Storage (Media & Documents)                          │
├─────────────────────────────────────────────────────────────────┤
│  AI Services                                                    │
│  ├─ Azure OpenAI (Career Advice & Analysis)                    │
│  ├─ Text Analytics (Content Moderation & Analysis)             │
│  └─ Language Understanding                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

The application is organized into four main modules:

```
career-canvas/
├── frontend/               # React TypeScript frontend
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts for state management
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client services
│   │   └── utils/          # Utility functions
│   ├── package.json        # Frontend dependencies
│   └── tsconfig.json       # TypeScript configuration
│
├── backend/                # Azure Functions backend
│   ├── src/                # Source code
│   │   ├── functions/      # Azure Function endpoints
│   │   ├── middleware/     # Request middleware
│   │   └── utils/          # Utility functions
│   ├── host.json           # Azure Functions host configuration
│   ├── local.settings.json # Local settings (not in version control)
│   └── package.json        # Backend dependencies
│
├── data-models/            # Shared data models
│   ├── src/                # Source code
│   │   ├── schemas/        # MongoDB/Cosmos DB schemas
│   │   └── services/       # Data access services
│   └── package.json        # Data models dependencies
│
├── ai-services/            # AI integration services
│   ├── src/                # Source code
│   │   └── services/       # AI service implementations
│   └── package.json        # AI services dependencies
│
└── docs/                   # Project documentation
    ├── architecture.md     # System architecture
    ├── api-specs.md        # API specifications
    └── deployment.md       # Deployment guide
```

## Technology Stack

### Frontend
- **Framework**: React 19.1.1 with TypeScript 4.9.5
- **State Management**: React Context API and custom hooks
- **Styling**: Tailwind CSS 3.3.0
- **Form Handling**: React Hook Form 7.45.0
- **Routing**: React Router
- **Build Tool**: Create React App

### Backend
- **Runtime**: Node.js 20.x with TypeScript
- **API Framework**: Azure Functions v4
- **Authentication**: Microsoft Identity Platform with federated credentials
- **Deployment**: Azure App Service

### Data Layer
- **Primary Database**: MongoDB/Cosmos DB with MongoDB API
- **Data Models**: Mongoose ODM
- **Organizational Data**: Microsoft Graph API

### AI Services
- **NLP & Text Generation**: Azure OpenAI (GPT-4)
- **Text Analysis**: Azure Cognitive Services
- **Content Moderation**: Azure Content Moderator

### DevOps & Infrastructure
- **Version Control**: Git with GitHub
- **CI/CD**: GitHub Actions
- **Cloud Provider**: Microsoft Azure
- **Monitoring**: Azure Application Insights

## Authentication Flow

Career Canvas uses the Microsoft Identity Platform for authentication, with a focus on security best practices:

1. **User Authentication**:
   - Microsoft Authentication Library (MSAL) integration
   - Single Sign-On with Microsoft accounts
   - Support for Multi-Factor Authentication

2. **API Authentication**:
   - Azure Functions with Easy Auth
   - JWT token validation
   - Role-based access control

3. **Service-to-Service Authentication**:
   - Federated credentials for Microsoft Graph access
   - Azure Managed Identities when possible
   - No secrets stored in code or configuration files

## Data Flow Architecture

```
┌───────────┐      ┌───────────┐      ┌───────────┐
│  Frontend │      │  Backend  │      │ Databases │
│  (React)  │─────►│  (Azure   │─────►│ (MongoDB/ │
│           │◄─────│ Functions) │◄─────│ Cosmos DB)│
└───────────┘      └───────────┘      └───────────┘
      │                  │                  ▲
      │                  │                  │
      │                  ▼                  │
      │            ┌───────────┐            │
      │            │ Microsoft │            │
      └───────────►│  Graph   │────────────┘
                   │   API    │
                   └───────────┘
                         │
                         ▼
                   ┌───────────┐
                   │   Azure   │
                   │  OpenAI   │
                   │  Services │
                   └───────────┘
```

## Key Components

### StorytellingHub Component

The StorytellingHub is a key feature that allows users to share professional career stories:

- **Form with Validation**: React Hook Form for input validation
- **Preview Mode**: Toggle to preview stories before posting
- **Tag Filtering**: Filter stories by tags/categories
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### Backend API Endpoints

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| /api/hello | GET | Health check endpoint | None |
| /api/stories | GET | Retrieve career stories | Optional |
| /api/stories | POST | Create a new career story | Required |
| /api/stories/:id | GET | Get a specific story | Optional |
| /api/stories/:id | PUT | Update a story | Required |
| /api/stories/:id | DELETE | Delete a story | Required |

### Data Models

#### User Model
- Basic user profile information
- Authentication details
- Preferences and settings

#### CareerProfile Model
- Professional history
- Skills and expertise
- Career goals
- Education and certifications

#### Story Model
- Title and content
- Author information
- Tags/categories
- Engagement metrics

## Scalability Considerations

The architecture is designed to scale horizontally with the following considerations:

1. **Stateless Backend**: Azure Functions are stateless and scale automatically
2. **Database Scaling**: Cosmos DB offers automatic scaling
3. **CDN Integration**: Static assets served via Azure CDN
4. **Caching Strategy**: Implementable at multiple levels (API, database, client)

## Security Measures

1. **Authentication**: Microsoft Identity Platform with OAuth 2.0
2. **Authorization**: Role-based access control
3. **Data Protection**: TLS for all communications
4. **Input Validation**: Client and server-side validation
5. **Content Security**: AI-powered content moderation
6. **Federated Credentials**: No secrets in code or configuration

## Monitoring and Observability

1. **Application Insights**: Real-time performance monitoring
2. **Logging Strategy**: Structured logging with severity levels
3. **Error Tracking**: Centralized error reporting
4. **User Analytics**: Engagement and usage metrics

## Future Technical Roadmap

1. **Real-time Collaboration**: WebSocket integration for live features
2. **Enhanced AI Integration**: More sophisticated career recommendations
3. **Mobile Applications**: Native mobile apps using React Native
4. **Advanced Analytics**: Career progression tracking and visualization
5. **Integration with Learning Platforms**: Connect with learning resources
