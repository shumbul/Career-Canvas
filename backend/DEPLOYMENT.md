# Azure Functions Deployment Configuration

## Prerequisites

1. Azure CLI installed and configured
2. Azure Functions Core Tools v4
3. MongoDB Atlas or Azure Cosmos DB account
4. Azure OpenAI Service instance

## Environment Setup

### Local Development
Copy `local.settings.example.json` to `local.settings.json` and update values:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "MONGODB_CONNECTION_STRING": "your_actual_mongodb_connection_string",
    "AZURE_OPENAI_API_KEY": "your_actual_azure_openai_key",
    "AZURE_OPENAI_ENDPOINT": "https://your-resource.openai.azure.com/",
    "AZURE_OPENAI_DEPLOYMENT": "gpt-4",
    "AZURE_OPENAI_API_VERSION": "2024-02-15-preview"
  }
}
```

### Production Deployment

1. **Create Function App**
   ```bash
   az functionapp create \
     --resource-group your-resource-group \
     --consumption-plan-location eastus \
     --runtime node \
     --runtime-version 18 \
     --functions-version 4 \
     --name career-canvas-api \
     --storage-account your-storage-account
   ```

2. **Configure App Settings**
   ```bash
   az functionapp config appsettings set \
     --name career-canvas-api \
     --resource-group your-resource-group \
     --settings \
     MONGODB_CONNECTION_STRING="your_mongodb_connection_string" \
     AZURE_OPENAI_API_KEY="your_azure_openai_key" \
     AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/" \
     AZURE_OPENAI_DEPLOYMENT="gpt-4" \
     AZURE_OPENAI_API_VERSION="2024-02-15-preview"
   ```

3. **Deploy Functions**
   ```bash
   npm run build
   func azure functionapp publish career-canvas-api
   ```

## MongoDB Configuration

### MongoDB Atlas (Recommended for Production)
1. Create cluster on MongoDB Atlas
2. Create database user with read/write permissions
3. Whitelist Azure Function IP addresses
4. Use connection string format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/careercanvas?retryWrites=true&w=majority
   ```

### Local MongoDB (Development)
```
mongodb://localhost:27017/careercanvas
```

## Azure OpenAI Configuration

1. Create Azure OpenAI resource in Azure Portal
2. Deploy GPT-4 model
3. Get API key and endpoint from resource
4. Configure environment variables

## Testing Deployment

### Health Check
```bash
curl https://career-canvas-api.azurewebsites.net/api/hello
```

### AI Interview Test
```bash
curl -X POST https://career-canvas-api.azurewebsites.net/api/generateInterviewQuestion \
  -H "Content-Type: application/json" \
  -d '{"topic":"behavioral","previousQuestions":[]}'
```

## Monitoring & Logging

- Use Azure Application Insights for monitoring
- Enable logging in Azure Portal
- Set up alerts for errors and performance issues

## CORS Configuration

Add allowed origins in Azure Portal:
- https://your-frontend-domain.com
- http://localhost:3000 (for development)

## Security Best Practices

1. Use Azure Key Vault for secrets
2. Enable HTTPS only
3. Configure authentication if needed
4. Set up proper CORS origins
5. Monitor API usage and set rate limits