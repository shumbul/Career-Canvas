// Import Azure Functions entry point
const { app } = require('@azure/functions');

// Handle port configuration for Azure App Service
const port = process.env.PORT || 7071;
if (process.env.WEBSITE_INSTANCE_ID) {
    // Running in Azure App Service, set port to 8080
    process.env.FUNCTIONS_HTTPWORKER_PORT = process.env.PORT || 8080;
}

// Import all functions
const hello = require('./dist/src/functions/hello');
const stories = require('./dist/src/functions/stories');

// Register all functions
app.http('hello', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: hello.default
});

app.http('stories', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: stories.default
});

module.exports = app;
