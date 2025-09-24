# Career Canvas - Developer Setup & Contribution Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Testing Guidelines](#testing-guidelines)
6. [Code Standards](#code-standards)
7. [Contribution Process](#contribution-process)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18.x or 20.x | JavaScript runtime |
| **npm** | 9.x+ | Package manager |
| **Git** | 2.x+ | Version control |
| **VS Code** | Latest | Recommended IDE |
| **Azure CLI** | 2.x+ | Azure resource management |

### Optional but Recommended

- **Docker Desktop**: Container development
- **MongoDB Compass**: Database management
- **Postman**: API testing
- **Azure Storage Explorer**: Blob storage management

### Development Accounts

You'll need accounts for:
- **Azure**: For cloud services and AI integration
- **MongoDB Atlas**: Database hosting (or local MongoDB)
- **GitHub**: Source control and collaboration

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/career-canvas.git
cd career-canvas
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Azure Functions dependencies (if developing backend)
cd api
npm install
cd ..
```

### 3. Environment Configuration

Create environment files for different environments:

#### Frontend Environment (`.env.local`)

```bash
# Create frontend environment file
cp .env.example .env.local
```

```env
# Frontend Configuration
REACT_APP_API_URL=http://localhost:7071/api
REACT_APP_AZURE_CLIENT_ID=your-azure-client-id
REACT_APP_AZURE_TENANT_ID=your-azure-tenant-id
REACT_APP_ENVIRONMENT=development

# Optional: Third-party integrations
REACT_APP_MICROSOFT_LEARN_API=https://learn.microsoft.com/api
REACT_APP_LINKEDIN_LEARNING_API=https://api.linkedin.com/learning
REACT_APP_ANALYTICS_KEY=your-analytics-key
```

#### Backend Environment (`api/local.settings.json`)

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_OPENAI_ENDPOINT": "https://your-openai-resource.openai.azure.com/",
    "AZURE_OPENAI_KEY": "your-openai-key",
    "AZURE_OPENAI_MODEL": "gpt-4",
    "MONGODB_CONNECTION_STRING": "mongodb://localhost:27017/career-canvas",
    "JWT_SECRET": "your-development-jwt-secret",
    "CORS_ORIGINS": "http://localhost:3000,http://localhost:3001"
  },
  "Host": {
    "LocalHttpPort": 7071,
    "CORS": "*"
  }
}
```

### 4. Database Setup

#### Option A: MongoDB Atlas (Recommended)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get connection string and update `MONGODB_CONNECTION_STRING`

#### Option B: Local MongoDB

```bash
# Install MongoDB locally (Windows)
winget install MongoDB.Server

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Create development database
mongosh
> use career-canvas
> db.createCollection("users")
> db.createCollection("interviews")
> db.createCollection("mentors")
```

### 5. Azure Services Setup

#### Azure OpenAI Setup

```bash
# Login to Azure CLI
az login

# Create resource group
az group create --name career-canvas-dev --location eastus

# Create Azure OpenAI resource
az cognitiveservices account create \
  --name career-canvas-openai-dev \
  --resource-group career-canvas-dev \
  --kind OpenAI \
  --sku s0 \
  --location eastus

# Get API keys
az cognitiveservices account keys list \
  --name career-canvas-openai-dev \
  --resource-group career-canvas-dev
```

#### Azure Storage (for file uploads)

```bash
# Create storage account
az storage account create \
  --name careercanvasdev \
  --resource-group career-canvas-dev \
  --location eastus \
  --sku Standard_LRS

# Get connection string
az storage account show-connection-string \
  --name careercanvasdev \
  --resource-group career-canvas-dev
```

## Project Structure

```
career-canvas/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── VideoMockInterview/  # AI interview component
│   │   ├── MentorDashboard/     # Mentorship features
│   │   ├── LearningResources/   # Learning platform
│   │   └── shared/              # Shared components
│   ├── services/               # API services
│   │   ├── azureOpenAI.ts      # AI integration
│   │   ├── mongodb.ts          # Database service
│   │   └── auth.ts             # Authentication
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom hooks
│   ├── types/                  # TypeScript definitions
│   └── utils/                  # Utility functions
├── api/                        # Azure Functions backend
│   ├── interview/              # Interview endpoints
│   ├── mentorship/             # Mentorship endpoints
│   ├── learning/               # Learning endpoints
│   ├── auth/                   # Authentication endpoints
│   └── shared/                 # Shared backend utilities
├── public/                     # Static assets
├── docs/                       # Documentation
├── tests/                      # Test files
├── scripts/                    # Build and deployment scripts
├── .github/                    # GitHub workflows
└── infrastructure/             # Infrastructure as Code
```

### Component Architecture

```
src/components/
├── VideoMockInterview/
│   ├── VideoMockInterview.tsx     # Main component
│   ├── VideoMockInterview.module.css
│   ├── hooks/
│   │   ├── useVideoRecording.ts   # Video recording logic
│   │   ├── useSpeechRecognition.ts # Speech-to-text
│   │   └── useInterviewSession.ts  # Session management
│   └── components/
│       ├── QuestionDisplay.tsx    # Question rendering
│       ├── ResponseRecorder.tsx   # Answer recording
│       └── FeedbackPanel.tsx      # AI feedback display

├── MentorDashboard/
│   ├── MentorDashboard.tsx        # Mentor discovery
│   ├── MentorProfile.tsx          # Profile display
│   ├── MentorCalendar.tsx         # Scheduling system
│   └── ScheduleMeetingModal.tsx   # Booking modal

└── LearningResources/
    ├── LearningResources.tsx      # Main learning hub
    ├── ResourceCard.tsx           # Individual resource
    ├── LearningPath.tsx           # Learning paths
    └── ProgressTracker.tsx        # Progress tracking
```

## Development Workflow

### 1. Starting Development Environment

```bash
# Terminal 1: Start frontend
npm start

# Terminal 2: Start Azure Functions (if developing backend)
cd api
npm run start

# Terminal 3: Start MongoDB (if using local instance)
mongod

# Terminal 4: Watch tests (optional)
npm run test:watch
```

### 2. Development Process

#### Feature Development

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/interview-improvements
   ```

2. **Implement Feature**
   - Write code following [Code Standards](#code-standards)
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Locally**
   ```bash
   # Run unit tests
   npm test
   
   # Run integration tests
   npm run test:integration
   
   # Run E2E tests
   npm run test:e2e
   
   # Lint code
   npm run lint
   
   # Type check
   npm run type-check
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: improve interview question generation algorithm"
   ```

#### Bug Fix Process

1. **Reproduce Issue**
   - Create minimal reproduction case
   - Add failing test case

2. **Fix Bug**
   - Implement fix
   - Ensure all tests pass
   - Verify fix doesn't break other functionality

3. **Document Fix**
   - Update changelog
   - Add regression test

### 3. Code Generation and Scaffolding

#### Generate New Component

```bash
# Generate new React component
npm run generate:component -- --name NewComponent --type functional

# Generate new service
npm run generate:service -- --name NewService

# Generate new Azure Function
npm run generate:function -- --name NewFunction --trigger http
```

#### Component Template

```typescript
// src/components/NewComponent/NewComponent.tsx
import React from 'react';
import styles from './NewComponent.module.css';

interface NewComponentProps {
  // Define props here
}

const NewComponent: React.FC<NewComponentProps> = ({ }) => {
  return (
    <div className={styles.container}>
      {/* Component content */}
    </div>
  );
};

export default NewComponent;
```

## Testing Guidelines

### Testing Strategy

```
├── Unit Tests (80% coverage)     # Individual functions/components
├── Integration Tests (15% coverage) # Component interactions
└── E2E Tests (5% coverage)       # Full user workflows
```

### Test Structure

```
tests/
├── unit/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   └── utils/
├── integration/
│   ├── api/
│   ├── database/
│   └── auth/
└── e2e/
    ├── interview-flow.spec.ts
    ├── mentorship.spec.ts
    └── learning.spec.ts
```

### Writing Tests

#### Unit Test Example

```typescript
// tests/unit/services/azureOpenAI.test.ts
import { generateInterviewQuestion } from '../../../src/services/azureOpenAI';

describe('Azure OpenAI Service', () => {
  describe('generateInterviewQuestion', () => {
    it('should generate question for given topic and career level', async () => {
      const result = await generateInterviewQuestion({
        topic: 'behavioral',
        careerLevel: 'mid-career',
        previousQuestions: []
      });

      expect(result).toHaveProperty('question');
      expect(result).toHaveProperty('category');
      expect(result.careerLevel).toBe('mid-career');
    });

    it('should avoid repeating previous questions', async () => {
      const previousQuestions = ['Tell me about yourself'];
      
      const result = await generateInterviewQuestion({
        topic: 'behavioral',
        careerLevel: 'senior',
        previousQuestions
      });

      expect(result.question).not.toContain('Tell me about yourself');
    });
  });
});
```

#### Integration Test Example

```typescript
// tests/integration/interview-api.test.ts
import { createInterviewSession, evaluateResponse } from '../helpers/api';

describe('Interview API Integration', () => {
  let sessionId: string;

  beforeEach(async () => {
    const session = await createInterviewSession({
      userId: 'test-user',
      topic: 'technical',
      careerLevel: 'mid-career'
    });
    sessionId = session.id;
  });

  it('should create session and evaluate responses', async () => {
    const evaluation = await evaluateResponse({
      sessionId,
      answer: 'I would use React hooks for state management...',
      questionId: 'q1'
    });

    expect(evaluation.score).toBeGreaterThan(0);
    expect(evaluation.feedback).toBeDefined();
  });
});
```

#### E2E Test Example

```typescript
// tests/e2e/interview-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete interview flow', async ({ page }) => {
  // Navigate to interview page
  await page.goto('/interview');
  
  // Select career level
  await page.selectOption('[data-testid="career-level"]', 'mid-career');
  
  // Start interview
  await page.click('[data-testid="start-interview"]');
  
  // Wait for question to appear
  await expect(page.locator('[data-testid="question"]')).toBeVisible();
  
  // Record answer (simulate)
  await page.click('[data-testid="record-button"]');
  await page.waitForTimeout(3000);
  await page.click('[data-testid="stop-recording"]');
  
  // Check for feedback
  await expect(page.locator('[data-testid="ai-feedback"]')).toBeVisible();
  
  // Complete interview
  await page.click('[data-testid="complete-interview"]');
  
  // Verify results page
  await expect(page).toHaveURL(/\/interview\/results/);
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testNamePattern="Azure OpenAI"

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch
```

## Code Standards

### TypeScript Guidelines

#### Type Definitions

```typescript
// types/interview.ts
export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'situational';
  careerLevel: CareerLevel;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedDuration: number;
  tags: string[];
}

export interface InterviewSession {
  id: string;
  userId: string;
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}

export type CareerLevel = 'early-career' | 'mid-career' | 'senior-career';
```

#### Component Props

```typescript
// Use interfaces for props
interface VideoMockInterviewProps {
  careerLevel?: CareerLevel;
  onSessionComplete: (session: InterviewSession) => void;
  onError: (error: Error) => void;
}

// Use generics for reusable components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}
```

#### Service Layer

```typescript
// services/base.ts
export abstract class BaseService {
  protected readonly baseUrl: string;
  protected readonly apiKey?: string;

  constructor(config: ServiceConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    // Implementation
  }
}

// services/interviewService.ts
export class InterviewService extends BaseService {
  async createSession(params: CreateSessionParams): Promise<InterviewSession> {
    return this.request('/interview/sessions', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
}
```

### React Component Guidelines

#### Functional Components

```typescript
// Preferred: Functional component with hooks
const VideoMockInterview: React.FC<VideoMockInterviewProps> = ({
  careerLevel = 'mid-career',
  onSessionComplete,
  onError
}) => {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Custom hooks for complex logic
  const { startRecording, stopRecording } = useVideoRecording({
    onError: handleRecordingError
  });

  const { generateQuestion } = useInterviewSession({
    careerLevel,
    onError
  });

  // Event handlers
  const handleStartInterview = useCallback(async () => {
    try {
      const newSession = await interviewService.createSession({
        careerLevel,
        userId: user?.id
      });
      setSession(newSession);
    } catch (error) {
      onError(error as Error);
    }
  }, [careerLevel, user?.id, onError]);

  // Cleanup effects
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording, stopRecording]);

  if (!session) {
    return <InterviewSetup onStart={handleStartInterview} />;
  }

  return (
    <div className={styles.container}>
      {/* Component JSX */}
    </div>
  );
};
```

#### Custom Hooks

```typescript
// hooks/useInterviewSession.ts
export const useInterviewSession = (params: UseInterviewSessionParams) => {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [loading, setLoading] = useState(false);

  const generateQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const question = await aiService.generateQuestion({
        topic: params.topic,
        careerLevel: params.careerLevel,
        previousQuestions: session?.questions.map(q => q.id) || []
      });
      
      setCurrentQuestion(question);
      
      if (session) {
        setSession(prev => ({
          ...prev!,
          questions: [...prev!.questions, question]
        }));
      }
    } catch (error) {
      params.onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  }, [params, session]);

  const evaluateResponse = useCallback(async (response: string) => {
    if (!currentQuestion || !session) return;

    try {
      const evaluation = await aiService.evaluateResponse({
        sessionId: session.id,
        questionId: currentQuestion.id,
        answer: response
      });

      return evaluation;
    } catch (error) {
      params.onError?.(error as Error);
    }
  }, [currentQuestion, session, params]);

  return {
    session,
    currentQuestion,
    loading,
    generateQuestion,
    evaluateResponse,
    setSession
  };
};
```

### CSS/Styling Guidelines

#### CSS Modules

```css
/* VideoMockInterview.module.css */
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--background-primary);
}

.questionSection {
  flex: 1;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.questionText {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
  max-width: 600px;
}

.recordingSection {
  padding: 2rem;
  background: var(--background-secondary);
  border-top: 1px solid var(--border-color);
}

.recordButton {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid var(--primary-color);
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recordButton:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.recordButton.recording {
  background: var(--error-color);
  border-color: var(--error-color);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .questionText {
    font-size: 1.2rem;
  }
  
  .recordButton {
    width: 60px;
    height: 60px;
  }
}
```

#### CSS Variables

```css
/* src/styles/variables.css */
:root {
  /* Colors */
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --error-color: #dc3545;
  
  /* Backgrounds */
  --background-primary: #ffffff;
  --background-secondary: #f8f9fa;
  --background-tertiary: #e9ecef;
  
  /* Text */
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-muted: #9ca3af;
  
  /* Borders */
  --border-color: #dee2e6;
  --border-radius: 8px;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 3rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}

/* Dark theme */
[data-theme="dark"] {
  --background-primary: #1a1a1a;
  --background-secondary: #2d2d2d;
  --background-tertiary: #404040;
  
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --text-muted: #666666;
  
  --border-color: #404040;
}
```

### API Guidelines

#### Error Handling

```typescript
// utils/apiError.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// services/base.ts
protected async handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new APIError(
      error.message || 'Request failed',
      response.status,
      error.code,
      error.details
    );
  }

  return response.json();
}
```

#### Request Retry Logic

```typescript
// utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

## Contribution Process

### 1. Getting Started

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR-USERNAME/career-canvas.git
   cd career-canvas
   git remote add upstream https://github.com/ORIGINAL-OWNER/career-canvas.git
   ```

2. **Set Up Development Environment**
   Follow the [Environment Setup](#environment-setup) guide

3. **Choose an Issue**
   - Check [GitHub Issues](https://github.com/career-canvas/career-canvas/issues)
   - Look for `good-first-issue` or `help-wanted` labels
   - Comment on the issue to indicate you're working on it

### 2. Development Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/issue-123-add-new-feature
   ```

2. **Make Changes**
   - Follow [Code Standards](#code-standards)
   - Write tests for new functionality
   - Update documentation as needed

3. **Commit Guidelines**
   
   Use [Conventional Commits](https://www.conventionalcommits.org/):
   
   ```bash
   # Format: type(scope): description
   
   feat(interview): add support for custom question categories
   fix(auth): resolve token refresh issue
   docs(api): update authentication documentation
   test(integration): add mentor booking flow tests
   refactor(ui): improve responsive design patterns
   style(lint): fix ESLint warnings
   chore(deps): update Azure SDK to v2.0
   ```

### 3. Pull Request Process

1. **Prepare Pull Request**
   ```bash
   # Sync with upstream
   git fetch upstream
   git rebase upstream/main
   
   # Run tests
   npm test
   npm run lint
   npm run type-check
   
   # Push to your fork
   git push origin feature/issue-123-add-new-feature
   ```

2. **Create Pull Request**
   
   Use this template:
   
   ```markdown
   ## Description
   Brief description of changes made.
   
   ## Related Issue
   Closes #123
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] E2E tests pass (if applicable)
   - [ ] Manual testing completed
   
   ## Screenshots (if applicable)
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex logic
   - [ ] Documentation updated
   - [ ] No new warnings introduced
   ```

3. **Review Process**
   - Automated tests will run
   - Code review by maintainers
   - Address feedback if requested
   - Merge after approval

### 4. Code Review Guidelines

#### For Contributors
- **Self-Review**: Review your own PR before submission
- **Small PRs**: Keep changes focused and manageable
- **Clear Description**: Explain what and why, not just what
- **Tests**: Include appropriate test coverage
- **Documentation**: Update docs for user-facing changes

#### For Reviewers
- **Be Constructive**: Provide helpful feedback and suggestions
- **Check Standards**: Ensure code follows project guidelines
- **Test Coverage**: Verify adequate testing
- **Performance**: Consider impact on app performance
- **Security**: Look for potential security issues

### 5. Release Process

#### Versioning Strategy

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

#### Release Workflow

```bash
# 1. Create release branch
git checkout -b release/v1.2.0

# 2. Update version
npm version minor

# 3. Update changelog
# Edit CHANGELOG.md with new features, fixes, and breaking changes

# 4. Create release PR
# Merge to main after approval

# 5. Tag release
git tag v1.2.0
git push origin v1.2.0

# 6. Deploy to production
# Automated deployment via GitHub Actions
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

**TypeScript Errors**
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm install

# Check for type conflicts
npm run type-check
```

**Dependency Issues**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Azure Function Issues

**Local Development**
```bash
# Ensure Azure Functions Core Tools installed
npm install -g azure-functions-core-tools@4

# Check local.settings.json configuration
# Verify CORS settings for local development
```

**Deployment Issues**
```bash
# Check Azure CLI authentication
az account show

# Verify resource group and function app exist
az functionapp list --resource-group career-canvas-dev
```

#### 3. Database Connection Issues

**MongoDB Atlas**
- Verify connection string format
- Check IP whitelist settings
- Ensure database user has correct permissions

**Local MongoDB**
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Start MongoDB service (Windows)
net start MongoDB
```

#### 4. Authentication Issues

**Azure AD Setup**
- Verify app registration configuration
- Check redirect URIs
- Ensure correct scopes are configured

**JWT Token Issues**
- Check token expiration
- Verify JWT secret consistency
- Validate token format

#### 5. Performance Issues

**Frontend**
```bash
# Analyze bundle size
npm run analyze

# Check for memory leaks
# Use React DevTools Profiler

# Optimize images and assets
# Implement code splitting for large components
```

**Backend**
```bash
# Monitor function execution times
# Check Azure Function logs

# Optimize database queries
# Implement caching strategies

# Review API rate limiting
```

### Debug Mode Setup

#### Frontend Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug React App",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["start"]
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/react-scripts",
      "args": ["test", "--runInBand", "--no-cache", "--watchAll=false"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

#### Backend Debug Configuration

```json
// api/.vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to Azure Functions",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "preLaunchTask": "func: host start"
    }
  ]
}
```

### Getting Help

#### Documentation Resources
- [Technical Architecture](./TECHNICAL_ARCHITECTURE.md)
- [API Reference](./API_REFERENCE.md)
- [Future Scope](./FUTURE_SCOPE.md)

#### Community Support
- **GitHub Discussions**: For general questions
- **GitHub Issues**: For bug reports and feature requests
- **Discord**: Real-time chat with community
- **Stack Overflow**: Tag questions with `career-canvas`

#### Maintainer Contact
- **Email**: dev-team@career-canvas.com
- **GitHub**: @career-canvas/maintainers
- **Office Hours**: Wednesdays 2-3 PM EST

This guide provides comprehensive information for developers to successfully contribute to Career Canvas. For additional questions or clarifications, please reach out through our community channels.