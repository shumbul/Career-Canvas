# Deployment Checklist

## OAuth2 Authentication Deployment

### Before Deployment

- [ ] Configure OAuth providers with production redirect URIs
- [ ] Update JWT secret to a secure random key (32+ characters)
- [ ] Set up environment variables in production environment
- [ ] Configure CORS for production domains
- [ ] Test OAuth flow in staging environment

### Google OAuth Production Setup

1. Update Google Cloud Console OAuth settings:
   - Authorized redirect URIs: `https://your-domain.com/auth/callback`
   - Authorized origins: `https://your-domain.com`

### Microsoft OAuth Production Setup

1. Update Azure AD App Registration:
   - Redirect URI: `https://your-domain.com/auth/callback`
   - Add production domain to CORS origins

### Environment Variables (Production)

```bash
# Backend (Azure Functions Application Settings)
GOOGLE_CLIENT_ID=prod_google_client_id
GOOGLE_CLIENT_SECRET=prod_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/callback
MICROSOFT_CLIENT_ID=prod_microsoft_client_id
MICROSOFT_CLIENT_SECRET=prod_microsoft_client_secret
MICROSOFT_REDIRECT_URI=https://your-domain.com/auth/callback
MICROSOFT_TENANT_ID=common
JWT_SECRET=secure_random_production_key_32plus_chars
JWT_EXPIRES_IN=7d
MONGODB_CONNECTION_STRING=mongodb_atlas_connection_string
```

### Security Checklist

- [ ] Enable HTTPS for all endpoints
- [ ] Use secure JWT secrets (not development keys)
- [ ] Configure proper CORS origins (no wildcards in production)
- [ ] Enable Application Insights for monitoring
- [ ] Test authentication flow end-to-end
- [ ] Verify MongoDB security settings
- [ ] Enable rate limiting for OAuth endpoints

### Testing

- [ ] Test Google OAuth login flow
- [ ] Test Microsoft OAuth login flow
- [ ] Test protected API endpoints with JWT tokens
- [ ] Test token expiration handling
- [ ] Test logout functionality
- [ ] Verify user data persistence in MongoDB

### Post-Deployment

- [ ] Monitor authentication success rates
- [ ] Check for OAuth errors in logs
- [ ] Verify database connectivity
- [ ] Test mentor preference saving with authentication
- [ ] Confirm user experience across different browsers