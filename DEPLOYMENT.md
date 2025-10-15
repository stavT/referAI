# Deployment Guide

## Quick Start Deployment to Vercel

### Step 1: Prepare Your Repository

1. **Initialize Git (if not already done)**
```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Push to GitHub**
```bash
gh repo create referral-finder --public --source=. --remote=origin --push
# Or manually create a repo on GitHub and push
git remote add origin https://github.com/yourusername/referral-finder.git
git push -u origin main
```

### Step 2: Set Up MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Select "FREE" tier (M0)
   - Choose a cloud provider and region (closest to your users)
   - Click "Create Cluster"

3. **Set Up Database Access**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (save these!)
   - Set role to "Atlas admin" or "Read and write to any database"

4. **Set Up Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (or add specific IPs)
   - Confirm

5. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/referral-finder`

### Step 3: Set Up Google OAuth (Optional but Recommended)

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click and enable it

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Name it "Referral Finder"

4. **Configure Authorized URIs**
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (for local dev)
     - `https://yourdomain.vercel.app` (for production)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google` (for local dev)
     - `https://yourdomain.vercel.app/api/auth/callback/google` (for production)

5. **Save Credentials**
   - Copy Client ID and Client Secret

### Step 4: Get OpenAI API Key

1. **Go to OpenAI Platform**
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Sign up or log in

2. **Create API Key**
   - Go to "API keys" section
   - Click "Create new secret key"
   - Name it "Referral Finder"
   - Copy the key (you won't see it again!)

**OR Use Grok API:**
1. Go to [xAI](https://x.ai/)
2. Sign up and get API access
3. Create an API key

### Step 5: Deploy to Vercel

1. **Go to Vercel**
   - Visit [Vercel](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." > "Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Next.js app

3. **Configure Environment Variables**
   
   Click "Environment Variables" and add:

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/referral-finder
   NEXTAUTH_SECRET=your-generated-secret-here
   NEXTAUTH_URL=https://your-app-name.vercel.app
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   OPENAI_API_KEY=your-openai-api-key
   ```

   **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Your app will be live at `https://your-app-name.vercel.app`

5. **Update Google OAuth Redirect URIs**
   - Go back to Google Cloud Console
   - Update authorized redirect URI with your Vercel URL:
     `https://your-app-name.vercel.app/api/auth/callback/google`

### Step 6: Test Your Deployment

1. **Visit Your Site**
   - Go to `https://your-app-name.vercel.app`

2. **Test Sign Up/Sign In**
   - Create an account with email/password
   - Try Google OAuth sign-in

3. **Complete Profile Questionnaire**
   - Fill out the multi-step form
   - Submit your profile

4. **Test Job Referral Finder**
   - Enter a job URL or details
   - Check if AI generates referral matches
   - Copy a message to clipboard

## Custom Domain (Optional)

### Add Custom Domain to Vercel

1. **Go to Vercel Dashboard**
   - Select your project
   - Go to "Settings" > "Domains"

2. **Add Domain**
   - Enter your domain name
   - Follow Vercel's DNS configuration instructions

3. **Update Environment Variables**
   - Update `NEXTAUTH_URL` to your custom domain
   - Update Google OAuth redirect URIs

## Environment Variables Reference

### Required
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production URL (e.g., `https://yourdomain.com`)
- `OPENAI_API_KEY` - OpenAI API key (or `XAI_API_KEY` for Grok)

### Optional
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

## Monitoring and Analytics (Optional)

### Add Vercel Analytics

1. Go to Vercel project settings
2. Enable "Analytics" tab
3. Analytics will automatically track page views and performance

### Add Error Monitoring (Sentry)

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Follow Sentry setup wizard and add `SENTRY_DSN` to environment variables.

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Your app will automatically rebuild and redeploy!

## Troubleshooting

### Build Fails on Vercel

**Check build logs:**
- Go to Vercel dashboard > Deployments
- Click on failed deployment
- Check build logs for errors

**Common issues:**
- Missing environment variables
- TypeScript errors
- Dependency issues

**Solution:**
```bash
# Test build locally first
npm run build

# Fix any errors before pushing
```

### MongoDB Connection Timeout

**Symptoms:**
- App works locally but not on Vercel
- "MongoServerSelectionError" in logs

**Solution:**
1. Check MongoDB Atlas Network Access
2. Make sure "Allow Access from Anywhere" (0.0.0.0/0) is enabled
3. Verify connection string has correct password
4. Check if MongoDB user has correct permissions

### NextAuth Errors

**Symptoms:**
- "NEXTAUTH_URL not set" error
- OAuth callback errors

**Solution:**
1. Verify `NEXTAUTH_URL` is set in Vercel
2. Make sure it matches your production URL (no trailing slash)
3. Update Google OAuth redirect URIs to match exactly

### API Rate Limits

**OpenAI Rate Limits:**
- Free tier: Limited requests per minute
- Solution: Add error handling, implement rate limiting, or upgrade plan

**MongoDB Atlas Limits:**
- Free tier: 512MB storage
- Solution: Monitor usage, upgrade if needed

## Scaling Considerations

### Performance Optimization

1. **Enable Vercel Edge Caching**
   - Add `cache-control` headers to static routes

2. **Optimize Images**
   ```typescript
   import Image from 'next/image'
   // Use Next.js Image component
   ```

3. **Add Redis for Session Storage** (Optional)
   - Use Upstash Redis for faster session lookups

### Database Optimization

1. **Add Indexes**
   ```javascript
   UserSchema.index({ email: 1 });
   JobSearchSchema.index({ userId: 1, createdAt: -1 });
   ```

2. **Implement Pagination**
   - Limit query results
   - Add infinite scroll or pagination

### Cost Management

**Free Tier Limits:**
- Vercel: 100GB bandwidth/month
- MongoDB Atlas: 512MB storage
- OpenAI: Based on usage

**Upgrade When:**
- Vercel: > 100GB bandwidth
- MongoDB: > 512MB data
- OpenAI: Need higher rate limits

## Security Checklist

- [ ] Environment variables secured (not in code)
- [ ] NEXTAUTH_SECRET is random and strong
- [ ] MongoDB network access properly configured
- [ ] Google OAuth redirect URIs are exact matches
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] No sensitive data in client-side code
- [ ] API routes protected with authentication
- [ ] Rate limiting implemented (optional but recommended)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas metrics
3. Review browser console for errors
4. Check GitHub issues
5. Review this deployment guide

---

**Congratulations!** Your AI-powered referral finder is now live! 🎉

