require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const { BearerStrategy } = require('passport-azure-ad');

// Import routes
const storyRoutes = require('./routes/stories');
const mentorshipRoutes = require('./routes/mentorship');
const projectRoutes = require('./routes/projects');
const profileRoutes = require('./routes/profiles');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Configure Azure AD authentication
const bearerStrategy = new BearerStrategy(
  {
    identityMetadata: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0/.well-known/openid-configuration`,
    clientID: process.env.CLIENT_ID,
    audience: process.env.CLIENT_ID,
    validateIssuer: true,
    issuer: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0`,
    passReqToCallback: false
  },
  (token, done) => {
    return done(null, token);
  }
);

passport.use(bearerStrategy);

// API Routes
app.use('/api/stories', passport.authenticate('oauth-bearer', { session: false }), storyRoutes);
app.use('/api/mentorship', passport.authenticate('oauth-bearer', { session: false }), mentorshipRoutes);
app.use('/api/projects', passport.authenticate('oauth-bearer', { session: false }), projectRoutes);
app.use('/api/profiles', passport.authenticate('oauth-bearer', { session: false }), profileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Career Canvas API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing
