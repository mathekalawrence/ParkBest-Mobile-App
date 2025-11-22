# ParkBest Railway Deployment Guide

## Overview
This guide covers deploying the ParkBest system components:
- **Express Backend + PostgreSQL** → Railway
- **Admin Portal** → Vercel (recommended)
- **Mobile App** → Expo (no change)

## Prerequisites
- Node.js installed
- Git repository access
- Railway account
- Vercel account (for admin portal)

## Part 1: Backend Deployment on Railway

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```

### Step 3: Initialize Railway Project
```bash
cd express-backend
railway init
```
- Select "Create new project"
- Choose your project name

### Step 4: Add PostgreSQL Database
1. Go to Railway dashboard
2. Click "Add Service" → "Database" → "PostgreSQL"
3. Railway automatically provides `DATABASE_URL`

### Step 5: Configure Environment Variables
In Railway dashboard, add these variables:
```
DATABASE_URL=postgresql://... (auto-provided)
JWT_SECRET=your_jwt_secret_here
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
PORT=3000
NODE_ENV=production
```

### Step 6: Deploy Backend
```bash
railway up
```

### Step 7: Run Database Migrations
```bash
railway run node setup-admin.js
railway run node seed-parking-data.js
```

### Step 8: Get Your Backend URL
- Copy the generated Railway URL (e.g., `https://your-app.railway.app`)

## Part 2: Admin Portal Deployment on Vercel

### Step 1: Update API Configuration
Edit `admin-portal/src/config/api.js`:
```javascript
const API_BASE_URL = 'https://your-app.railway.app/api';
```

### Step 2: Deploy to Vercel
```bash
cd admin-portal
npx vercel --prod
```

### Step 3: Configure Environment Variables in Vercel
Add in Vercel dashboard:
```
REACT_APP_API_URL=https://your-app.railway.app/api
```

## Part 3: Mobile App Configuration

### Step 1: Update API Configuration
Edit `config/api.js`:
```javascript
const API_BASE_URL = 'https://your-app.railway.app/api';
```

### Step 2: Update Environment Variables
Edit `.env`:
```
EXPO_PUBLIC_API_URL=https://your-app.railway.app/api
```

### Step 3: Publish Mobile App
```bash
expo publish
```

## Part 4: Database Migration (If Moving from Existing DB)

### Step 1: Export Current Database
```bash
pg_dump your_current_db > backup.sql
```

### Step 2: Import to Railway
```bash
railway connect postgresql
# Then run your SQL file
```

## Part 5: Testing Deployment

### Test Backend
```bash
curl https://your-app.railway.app/api/health
```

### Test Admin Portal
- Visit your Vercel URL
- Login with admin credentials
- Verify dashboard loads

### Test Mobile App
- Open Expo app
- Test login functionality
- Verify API connections

## Environment Variables Summary

### Railway (Backend)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
PORT=3000
NODE_ENV=production
```

### Vercel (Admin Portal)
```
REACT_APP_API_URL=https://your-app.railway.app/api
```

### Expo (Mobile App)
```
EXPO_PUBLIC_API_URL=https://your-app.railway.app/api
```

## Troubleshooting

### Backend Issues
- Check Railway logs: `railway logs`
- Verify environment variables in Railway dashboard
- Test database connection: `railway connect postgresql`

### Admin Portal Issues
- Check Vercel deployment logs
- Verify API URL configuration
- Test API endpoints manually

### Mobile App Issues
- Clear Expo cache: `expo r -c`
- Verify environment variables
- Test API connectivity

## Cost Optimization

### Railway
- Use hobby plan for development
- Monitor usage in dashboard
- Scale based on traffic

### Vercel
- Free tier sufficient for admin portal
- Monitor bandwidth usage

## Security Checklist

- [ ] All environment variables configured
- [ ] Database access restricted
- [ ] HTTPS enabled (automatic on Railway/Vercel)
- [ ] JWT secrets are secure
- [ ] API keys are not exposed in frontend code

## Maintenance

### Updates
```bash
# Backend updates
cd express-backend
git push
railway up

# Admin portal updates
cd admin-portal
vercel --prod

# Mobile app updates
expo publish
```

### Monitoring
- Railway dashboard for backend metrics
- Vercel analytics for admin portal
- Expo analytics for mobile app

## Support
- Railway: https://railway.app/help
- Vercel: https://vercel.com/support
- Expo: https://docs.expo.dev/