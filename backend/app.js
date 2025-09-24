// Environment mode detection
const isProduction = process.env.NODE_ENV === 'production' || process.env.WEBSITE_INSTANCE_ID;

// Use different entry points based on environment
if (isProduction) {
    // Production mode (Azure App Service)
    console.log("Running in production mode");
    module.exports = require('./index.js');
} else {
    // Local development mode
    console.log("Running in local development mode");
    module.exports = require('./local.js');
}
