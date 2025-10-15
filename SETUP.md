# Setup Guide - Quick Start

Follow these steps to get your Referral Finder app running locally.

## Prerequisites Check

Before you begin, make sure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm, yarn, or pnpm installed
- [ ] Git installed
- [ ] MongoDB installed locally OR MongoDB Atlas account
- [ ] OpenAI API key OR Grok API key

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set Up Environment Variables

```bash
# Copy the example env file
cp env.example .env.local
```

Now edit `.env.local` and fill in the required values:

#### Required Variables:

**MongoDB URI:**
```env
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/referral-finder

# OR for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/referral-finder
```

**NextAuth Configuration:**
```bash
# Generate a secret key:
openssl rand -base64 32

# Then add to .env.local:
NEXTAUTH_SECRET=<paste-generated-secret-here>
NEXTAUTH_URL=http://localhost:3000
```

**AI API Key (choose one):**
```env
# Option 1: OpenAI
OPENAI_API_KEY=sk-...your-openai-key...

# Option 2: Grok
XAI_API_KEY=xai-...your-grok-key...
```

#### Optional Variables:

**Google OAuth (for Google sign-in):**
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Set Up MongoDB

#### Option A: Local MongoDB

```bash
# Using Docker (recommended):
docker run -d -p 27017:27017 --name mongodb mongo

# Or install MongoDB locally:
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb
# Windows: Download from mongodb.com
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a cluster (free M0 tier)
4. Create database user
5. Allow network access (0.0.0.0/0 for now)
6. Get connection string
7. Add to `.env.local`

### 4. Set Up OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up / Log in
3. Go to API Keys section
4. Create new secret key
5. Copy and add to `.env.local`

**OR use Grok:**
1. Go to [xAI](https://x.ai/)
2. Get API access
3. Create API key
4. Add as `XAI_API_KEY` in `.env.local`

### 5. Set Up Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:
   - `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### 6. Run the App

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Test the App

1. **Sign Up**
   - Go to Sign Up page
   - Create an account with email/password
   - Or use Google OAuth

2. **Complete Profile**
   - Fill out the multi-step questionnaire
   - Add your LinkedIn profile URL
   - Submit

3. **Find Referrals**
   - Paste a job URL (LinkedIn, Indeed, etc.)
   - Or enter job details manually
   - Click "Find Referrals"
   - Review AI-generated matches and messages

## Troubleshooting

### "Cannot find module" errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### MongoDB connection fails

```bash
# Check if MongoDB is running:
docker ps  # if using Docker
# or
mongosh  # try to connect

# Check connection string in .env.local
# Make sure no special characters are unencoded in password
```

### NextAuth errors

```bash
# Make sure NEXTAUTH_SECRET is set:
openssl rand -base64 32

# Make sure NEXTAUTH_URL matches your local URL:
NEXTAUTH_URL=http://localhost:3000  # no trailing slash!
```

### "Module not found" TypeScript errors

```bash
# Restart TypeScript server in VS Code:
# Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"

# Or restart the dev server:
# Ctrl + C (stop)
npm run dev  # start again
```

### Build errors

```bash
# Clear Next.js cache
rm -rf .next

# Try building
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### OpenAI API errors

**"Incorrect API key":**
- Double-check your API key in `.env.local`
- Make sure there are no spaces or quotes

**"Rate limit exceeded":**
- You've hit API rate limits
- Wait a few minutes and try again
- Or upgrade your OpenAI plan

**"Model not found":**
- Using Grok? Make sure `XAI_API_KEY` is set (not `OPENAI_API_KEY`)
- Check the model name in `/app/api/referrals/route.ts`

## Quick Reference

### Environment Variables Template

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/referral-finder

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI API (choose one)
OPENAI_API_KEY=
# XAI_API_KEY=
```

### Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# MongoDB
docker start mongodb              # Start MongoDB container
docker stop mongodb               # Stop MongoDB container
mongosh mongodb://localhost:27017 # Connect to MongoDB

# Generate secrets
openssl rand -base64 32  # Generate NextAuth secret
openssl rand -hex 32     # Generate alternative secret
```

### File Structure Quick Reference

```
referral-finder/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── auth/              # Auth pages
│   ├── dashboard/         # Dashboard page
│   └── questionnaire/     # Profile questionnaire
├── components/            # React components
├── lib/                   # Utilities (MongoDB, etc.)
├── models/                # Mongoose schemas
├── types/                 # TypeScript types
├── .env.local            # Environment variables (create this!)
└── package.json          # Dependencies
```

## Next Steps

Once everything is working:

1. ✅ Customize the profile questionnaire questions
2. ✅ Modify AI prompts for better matching
3. ✅ Add your own branding/styling
4. ✅ Test with real job postings
5. ✅ Deploy to Vercel (see DEPLOYMENT.md)

## Getting Help

- Check the main [README.md](./README.md) for detailed documentation
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Review code comments for implementation details
- Open a GitHub issue if you find bugs

---

Happy coding! 🚀

