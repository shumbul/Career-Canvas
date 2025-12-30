# Career Canvas - Deployment Guide

This document provides comprehensive instructions for deploying the Career Canvas application to Microsoft Azure. It covers both local development setup and production deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Azure Resources Setup](#azure-resources-setup)
- [CI/CD Configuration](#cicd-configuration)
- [Manual Deployment](#manual-deployment)
- [Post-Deployment Verification](#post-deployment-verification)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Development Tools

- **Node.js**: v20.x or later
- **npm**: v9.x or later
- **Azure Functions Core Tools**: v4.x
- **Azure CLI**: latest version
- **Git**: latest version
- **Visual Studio Code**: with Azure extensions

### Azure Resources

- Azure subscription with Owner or Contributor access
- Microsoft Entra ID (Azure AD) application registration
- Azure App Service plan
- Azure Storage account
- Azure Cosmos DB account (with MongoDB API)
- Azure OpenAI service (or standard OpenAI API access)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/shumbul/Career-Canvas.git
cd Career-Canvas
```

### 2. Install Dependencies

Install dependencies for each module:

```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..

# Data Models
cd data-models
npm install
cd ..

# AI Services
cd ai-services
npm install
cd ..
```

### 3. Set Up Environment Variables

Create `.env` files in each module directory:

#### Backend (.env or local.settings.json)

```
# Azure Functions Configuration
AzureWebJobsStorage=UseDevelopmentStorage=true
FUNCTIONS_WORKER_RUNTIME=node

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/career-canvas
MONGODB_DB_NAME=career-canvas

# Authentication
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_TENANT_ID=your_tenant_id

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000
```

#### Frontend (.env.local)

```
REACT_APP_API_BASE_URL=http://localhost:7073/api
REACT_APP_AUTH_CLIENT_ID=your_client_id
REACT_APP_AUTH_AUTHORITY=https://login.microsoftonline.com/your_tenant_id
REACT_APP_AUTH_REDIRECT_URI=http://localhost:3000/auth
```

#### AI Services (.env)

```
AZURE_OPENAI_API_KEY=your_api_key
AZURE_OPENAI_ENDPOINT=your_endpoint
AZURE_OPENAI_DEPLOYMENT=your_deployment_name
AZURE_OPENAI_API_VERSION=2023-05-15
```

#### Data Models (.env)

```
MONGODB_URI=mongodb://localhost:27017/career-canvas
MONGODB_DB_NAME=career-canvas

MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_TENANT_ID=your_tenant_id
```

### 4. Start Local Development Servers

#### Backend

```bash
cd backend
npm run start
```

This will start the Azure Functions runtime on `http://localhost:7073`.

#### Frontend

```bash
cd frontend
npm start
```

This will start the React development server on `http://localhost:3000`.

## Azure Resources Setup

### 1. Create Resource Group

```bash
az group create --name career-canvas-rg --location eastus
```

### 2. Create Azure App Service Plan

```bash
az appservice plan create --name career-canvas-plan --resource-group career-canvas-rg --sku B1 --is-linux
```

### 3. Create Azure Function App

```bash
az functionapp create --name CareerCanvas --resource-group career-canvas-rg --plan career-canvas-plan --runtime node --runtime-version 20 --storage-account careercanvasstorage --functions-version 4
```

### 4. Create Cosmos DB Account with MongoDB API

```bash
az cosmosdb create --name career-canvas-db --resource-group career-canvas-rg --kind MongoDB --capabilities EnableMongo
az cosmosdb mongodb database create --account-name career-canvas-db --resource-group career-canvas-rg --name career-canvas
```

### 5. Create Azure OpenAI Resource

```bash
az cognitiveservices account create --name career-canvas-openai --resource-group career-canvas-rg --kind OpenAI --sku S0 --location eastus
```

### 6. Configure Federated Credentials

If using federated credentials for GitHub Actions:

1. Create an Azure AD app registration
2. Add federated credentials for GitHub Actions
3. Assign necessary roles to the app registration

## CI/CD Configuration

The project uses GitHub Actions for CI/CD.

### GitHub Actions Workflow

The `.github/workflows/main_careercanvas.yml` file contains the CI/CD pipeline configuration:

1. Builds the backend application
2. Runs tests
3. Deploys to Azure Function App

### Setting Up GitHub Secrets

Configure the following secrets in your GitHub repository:

- `AZUREAPPSERVICE_CLIENTID`: Client ID for Azure deployment
- `AZUREAPPSERVICE_TENANTID`: Tenant ID for Azure deployment
- `AZUREAPPSERVICE_SUBSCRIPTIONID`: Subscription ID for Azure deployment

## Manual Deployment

If you need to deploy manually without CI/CD:

### Backend Deployment

```bash
cd backend
npm run build
func azure functionapp publish CareerCanvas
```

### Frontend Deployment

```bash
cd frontend
npm run build
az storage blob upload-batch --account-name careercanvasstatic --auth-mode key --source ./build --destination '$web'
```

## Post-Deployment Verification

After deployment, verify the application is working correctly:

1. **Backend API**: Test the API endpoints using Postman or curl
   ```bash
   curl https://careercanvas.azurewebsites.net/api/hello
   ```

2. **Frontend**: Open the application URL in a browser
   ```
   https://careercanvas.azurewebsites.net
   ```

3. **Authentication**: Verify login functionality works
4. **Database Connection**: Verify data is being stored and retrieved
5. **AI Services**: Test AI-powered features

## Monitoring and Maintenance

### Application Insights

The application uses Azure Application Insights for monitoring:

1. **Performance Monitoring**: Track API response times and frontend performance
2. **Error Tracking**: Monitor exceptions and errors
3. **Usage Analytics**: Analyze user behavior and feature usage

Access Application Insights in the Azure Portal:
```
https://portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/microsoft.insights%2Fcomponents
```

### Log Management

- Backend logs are available in Azure Functions logs
- Application-specific logs are stored in Application Insights

### Backup and Recovery

- Database: Cosmos DB automatic backups
- Code: GitHub repository
- Environment variables: Store in Azure KeyVault

## Troubleshooting

### Common Issues

#### Deployment Failures

1. **Package.json Not Found**:
   - Ensure GitHub Actions workflow points to the correct directory
   - Verify package.json exists in the backend directory

2. **Build Errors**:
   - Check the build logs for compilation errors
   - Verify TypeScript configuration is correct

3. **Test Failures**:
   - Update test script in package.json to exit with code 0 if no tests
   - Configure tests to run properly in CI/CD

#### Runtime Errors

1. **Connection String Issues**:
   - Verify environment variables are set correctly in Azure
   - Check for typos in connection strings

2. **Authentication Errors**:
   - Verify Microsoft Entra ID app registration is configured correctly
   - Check CORS settings in Azure Functions

3. **API Not Found**:
   - Verify Azure Function app is deployed correctly
   - Check function.json files for route configuration

### Getting Help

- File issues on GitHub repository
- Contact project maintainers
- Consult Azure documentation for platform-specific issues

## Security Considerations

- Store all secrets in Azure Key Vault
- Use managed identities whenever possible
- Implement proper CORS configuration
- Use HTTPS for all endpoints
- Follow the principle of least privilege for all resources

## Reference Documentation

- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
- [Cosmos DB Documentation](https://docs.microsoft.com/en-us/azure/cosmos-db/)
- [Azure OpenAI Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)
- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/overview)
