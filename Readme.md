# Career Canvas

**AI-Powered All In One Career Development Platform**

Career Canvas is an innovative platform that empowers professionals to navigate their career journey through personalized AI insights, smart networking, and data-driven recommendations. Built with Microsoft technologies and integrated with the Microsoft Graph API, it provides seamless career development tools for modern professionals.

## 🚀 Features

- **AI Career Coach**: Personalized career advice powered by OpenAI/Azure OpenAI
- **Resume Optimizer**: AI-driven resume analysis and improvement suggestions
- **Smart Networking**: Microsoft Graph integration for internal networking and mentorship matching
- **OAuth2 Authentication**: Secure login with Google and Microsoft identity providers
- **Protected Mentorship Preferences**: Authenticated user preferences with JWT token validation
- **Interview Preparation**: Customized interview questions and preparation materials
- **Skill Development**: Personalized learning paths and skill gap analysis
- **Career Analytics**: Track progress and measure career development success

## 🏗️ Tech Stack

### Frontend
- **React** with **TypeScript** - Modern, type-safe UI development
- **Create React App** - Zero-config React setup
- **Modern CSS** - Responsive design with CSS Grid and Flexbox

### Backend
- **Azure Functions** - Serverless compute platform
- **Node.js** with **TypeScript** - Type-safe backend development
- **RESTful API** - Clean, scalable API architecture

### AI Services
- **OpenAI GPT-4** - Advanced natural language processing
- **Azure OpenAI** - Enterprise-grade AI services (alternative)
- **Custom AI Services** - Specialized career development algorithms

### Database & Integration
- **MongoDB** - Flexible document database for user profiles
- **Microsoft Graph API** - Organization data and user profile sync
- **OAuth2 Authentication** - Google and Microsoft identity provider integration
- **JWT Tokens** - Secure token-based authentication
- **Azure AD** - Enterprise authentication and single sign-on

### Infrastructure
- **Microsoft Azure** - Cloud platform and services
- **GitHub Actions** - CI/CD pipeline
- **Application Insights** - Monitoring and analytics

## 📁 Project Structure

```
Career-Canvas/
├── frontend/           # React TypeScript application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/            # Azure Functions API
│   ├── src/
│   ├── host.json
│   └── package.json
├── ai-services/        # AI models and utilities
│   ├── src/
│   ├── .env.example
│   └── package.json
├── data-models/        # MongoDB schemas and Graph API
│   ├── src/
│   ├── .env.example
│   └── package.json
├── docs/              # Documentation and design
│   ├── project-overview.md
│   ├── pitch-deck.md
│   ├── planning-notes.md
│   └── architecture.md
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Azure Functions Core Tools** (for backend development)
- **MongoDB** (local or Atlas)
- **Azure Account** (for deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/aychaudhuri_microsoft/Career-Canvas.git
cd Career-Canvas
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will be available at `http://localhost:3000`

### 3. Backend Setup

```bash
cd backend
npm install
# Install Azure Functions Core Tools globally if not already installed
npm install -g @azure/functions-core-tools@4 --unsafe-perm true
npm start
```

The API will be available at `http://localhost:7071`

### 4. OAuth2 Authentication Setup

```bash
cd backend
cp local.settings.json.example local.settings.json
# Edit local.settings.json with your OAuth provider credentials
```

For detailed OAuth setup instructions, see [OAUTH_SETUP.md](./OAUTH_SETUP.md)

### 5. AI Services Setup

```bash
cd ai-services
npm install
cp .env.example .env
# Edit .env with your OpenAI/Azure OpenAI credentials
npm run dev
```

### 6. Data Models Setup

```bash
cd data-models
npm install
cp .env.example .env
# Edit .env with your MongoDB and Microsoft Graph credentials
npm run dev
```

## 🔧 Environment Configuration

### AI Services (.env)
```
OPENAI_API_KEY=your_openai_api_key_here
AZURE_OPENAI_API_KEY=your_azure_openai_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### Data Models (.env)
```
MONGODB_URI=mongodb://localhost:27017/career-canvas
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
MICROSOFT_TENANT_ID=your_tenant_id_here
MICROSOFT_REDIRECT_URI=http://localhost:3000/auth/callback
```

## 📚 Documentation

- **[Project Overview](docs/project-overview.md)** - Detailed project vision, features, and roadmap
- **[Pitch Deck](docs/pitch-deck.md)** - Business case and market opportunity
- **[Planning Notes](docs/planning-notes.md)** - Development sprints and task planning
- **[Architecture](docs/architecture.md)** - Technical architecture and system design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for significant changes
- Follow the existing code style and conventions
- Ensure all CI/CD checks pass before submitting PR

## 📋 Available Scripts

### Frontend
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (not recommended)

### Backend
- `npm start` - Start Azure Functions locally
- `npm run build` - Build TypeScript
- `npm run watch` - Watch mode for development

### AI Services
- `npm run dev` - Start in development mode
- `npm run build` - Build TypeScript
- `npm start` - Start production server

### Data Models
- `npm run dev` - Start in development mode
- `npm run build` - Build TypeScript
- `npm start` - Start production server

## 🚀 Deployment

### Frontend (Azure Static Web Apps)
```bash
# Build the frontend
cd frontend
npm run build

# Deploy using Azure CLI or GitHub Actions
```

### Backend (Azure Functions)
```bash
# Deploy using Azure Functions Core Tools
cd backend
func azure functionapp publish <your-function-app-name>
```

### Infrastructure as Code
Coming soon: ARM templates and Terraform configurations for complete infrastructure deployment.

## 🧪 Testing

- **Unit Tests**: Jest and React Testing Library
- **Integration Tests**: Automated API testing
- **E2E Tests**: Cypress for end-to-end testing
- **Performance Tests**: Load testing for production readiness

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 🔒 Security & Privacy

- **Authentication**: Azure AD integration with SSO support
- **Data Encryption**: All data encrypted at rest and in transit
- **Privacy Compliance**: GDPR-compliant data handling
- **API Security**: Rate limiting, input validation, and secure headers
- **Audit Logging**: Comprehensive audit trails for all user actions

## 📊 Monitoring & Analytics

- **Application Insights**: Real-time monitoring and performance tracking
- **User Analytics**: Feature usage and user journey analysis
- **Error Tracking**: Automated error detection and alerting
- **Performance Monitoring**: API latency and throughput metrics

## 🗺️ Roadmap

### Phase 1: MVP (Completed ✅)
- Basic user authentication and profiles
- AI career advice functionality
- Microsoft Graph integration for profile sync
- React frontend with core features

### Phase 2: Enhanced Features (In Progress 🚧)
- Advanced resume analysis
- Networking recommendations
- Interview preparation tools
- Mobile responsiveness

### Phase 3: Social Features (Planned 📋)
- Mentorship matching
- Community features
- Goal tracking and analytics
- Enterprise admin tools

### Phase 4: Scale & Optimize (Future 🔮)
- Performance optimization
- Advanced AI features
- Multi-tenant architecture
- International expansion

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team**: Full-stack developers with expertise in React, Node.js, and Azure
- **AI/ML Engineers**: Specialists in OpenAI integration and machine learning
- **UX/UI Designers**: User experience and interface design experts
- **Product Management**: Career development and HR technology experts

## 📞 Contact

- **Email**: team@careercanvas.ai
- **GitHub**: [Career-Canvas Repository](https://github.com/aychaudhuri_microsoft/Career-Canvas)
- **Documentation**: [Project Wiki](https://github.com/aychaudhuri_microsoft/Career-Canvas/wiki)

## 🙏 Acknowledgments

- **Microsoft Graph Team** - For excellent API documentation and support
- **OpenAI** - For providing powerful AI capabilities
- **React Community** - For the amazing ecosystem and tools
- **Azure Team** - For robust cloud platform and services

---

**Career Canvas** - Empowering careers through AI and intelligent networking.

*Built with ❤️ by the Career Canvas Team*
