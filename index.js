const express = require('express');
const path = require('path');
const { app: azureFunctionsApp } = require('./backend/dist/index');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from React app build
app.use(express.static(path.join(__dirname, 'frontend/build')));

// API routes - proxy to Azure Functions
app.use('/api', (req, res, next) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  // Forward to Azure Functions
  next();
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Career Canvas app listening on port ${port}`);
  console.log(`Frontend: http://localhost:${port}`);
  console.log(`API: http://localhost:${port}/api`);
});

module.exports = app;