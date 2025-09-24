// This file is specifically for local development
// It uses Azure Functions Core Tools

const { app } = require('@azure/functions');

// Import all function handlers
const hello = require('./dist/src/functions/hello');
const stories = require('./dist/src/functions/stories');

// Register the functions
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
