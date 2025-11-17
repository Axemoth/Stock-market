# Environment Setup Guide

This guide will help you set up the environment variables for the Stock Market Watchlist application.

## Quick Setup Commands

```bash
# Copy example files to actual .env files
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
```

## Required Environment Variables

### Backend (.env in backend/ directory)

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `PORT` | Port for the backend server | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `FRONTEND_URL` | URL of the frontend application | `http://localhost:3000` |
| `SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `KOTAK_API_BASE_URL` | Kotak Securities API base URL | `https://api.kotaksecurities.com` |
| `KOTAK_API_KEY` | Your Kotak API key | `your_kotak_api_key` |
| `KOTAK_API_SECRET` | Your Kotak API secret | `your_kotak_api_secret` |
| `KOTAK_API_USERNAME` | Your Kotak username | `your_kotak_username` |
| `KOTAK_API_PASSWORD` | Your Kotak password | `your_kotak_password` |
| `KOTAK_CLIENT_ID` | Your Kotak client ID | `your_kotak_client_id` |
| `SESSION_SECRET` | Secret for session encryption | `your_secure_random_string` |

### Frontend (.env in frontend/ directory)

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `REACT_APP_API_BASE_URL` | Backend API base URL | `http://localhost:5000` |
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anon/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## Getting Supabase Credentials

1. Go to [Supabase](https://supabase.com) and create an account
2. Create a new project
3. Go to Settings → API to find:
   - **Project URL** (SUPABASE_URL)
   - **anon/public key** (SUPABASE_ANON_KEY)

## Getting Kotak API Credentials

1. Contact Kotak Securities for API access
2. Obtain:
   - **API Base URL** (KOTAK_API_BASE_URL)
   - **API Key** (KOTAK_API_KEY)
   - **Client ID** (KOTAK_CLIENT_ID)

## Security Best Practices

1. **Never commit .env files** to version control (they are in .gitignore)
2. Use different credentials for development and production
3. Generate strong, random SESSION_SECRET
4. Rotate API keys regularly
5. Use environment-specific configurations

## Development vs Production

### Development
- Use localhost URLs
- Enable debug features
- Use test API keys

### Production
- Use actual domain URLs
- Disable debug features
- Use production API keys
- Enable security features

## Troubleshooting

### Common Issues

1. **Missing environment variables**: Check that all required variables are set
2. **CORS errors**: Ensure FRONTEND_URL matches your frontend URL
3. **Supabase connection issues**: Verify SUPABASE_URL and SUPABASE_ANON_KEY
4. **Kotak API errors**: Check API credentials and base URL

### Verification

To verify your environment variables are loaded correctly:

```bash
# Test backend environment configuration
cd backend
node test-env.js

# This will check all required environment variables and provide feedback

# Start the backend server
npm start

# Look for console messages showing:
# - Supabase URL loaded
# - Server started on correct port

# Frontend
cd frontend
npm start

# Check browser console for any environment-related errors
```

## Optional Configuration

The example files include optional variables for:
- Database connections
- Email services
- Redis caching
- Advanced logging
- Feature flags
- Analytics services

Update these as needed for your specific deployment requirements.
