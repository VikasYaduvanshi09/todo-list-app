# TO-DO LIST App Deployment Guide

## Quick Deploy Options

### 1. Vercel (Recommended - 2 minutes)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 2. Heroku (5 minutes)
```bash
# Install Heroku CLI
npm i -g heroku

# Login
heroku login

# Create app
heroku create your-todo-app-name

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### 3. Railway (3 minutes)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway init
railway up
```

## Pre-Deployment Checklist

1. **Set up MongoDB Atlas**
   - Create account at mongodb.com/atlas
   - Create free cluster
   - Get connection string
   - Add to environment variables

2. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your MongoDB URI
   - Set JWT_SECRET (random string)
   - Configure CLIENT_URL

3. **Test Locally**
   ```bash
   cd backend
   npm install
   npm start
   ```

## Platform-Specific Instructions

### Vercel
1. Push code to GitHub
2. Import repository on vercel.com
3. Set environment variables in dashboard
4. Deploy

### Heroku
1. Add MongoDB Atlas addon or set MONGODB_URI
2. Set all environment variables
3. Deploy

### Netlify
1. Use Netlify Functions for backend
2. Deploy frontend as static site
3. Configure redirects

## Post-Deployment
- Update CLIENT_URL in environment variables
- Test all endpoints
- Monitor logs
- Set up custom domain (optional)
