# Referral Finder - AI-Powered Job Referral Platform

A Next.js web application that helps job seekers get personalized LinkedIn referral requests by matching them with people at their target company based on shared background, interests, and experiences.

## Features

- 🔐 **User Authentication**: Sign in with Google OAuth or email/password
- 📝 **Comprehensive Profile Questionnaire**: Multi-step form to build detailed user profiles
- 🤖 **AI-Powered Matching**: Uses OpenAI/Grok to find potential referrers based on commonalities
- 🎯 **Smart Referral Suggestions**: Generates personalized outreach messages
- 🔍 **Job Scraping**: Automatically extract job details from LinkedIn, Indeed, and other job boards
- 📊 **Dashboard**: Track your searches and referral matches
- 📱 **Responsive Design**: Beautiful UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI API / Grok API
- **Form Validation**: React Hook Form + Zod
- **Job Scraping**: Cheerio
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MongoDB database (local or MongoDB Atlas)
- OpenAI API key or Grok API key
- Google OAuth credentials (optional, for Google sign-in)

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd referral-finder
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/referral-finder
# or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/referral-finder

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI API (or use XAI_API_KEY for Grok)
OPENAI_API_KEY=your-openai-api-key
# XAI_API_KEY=your-grok-api-key
```

4. **Generate NextAuth Secret**

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

5. **Set up Google OAuth (Optional)**

- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing one
- Enable Google+ API
- Go to Credentials → Create Credentials → OAuth 2.0 Client ID
- Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- Copy Client ID and Client Secret to `.env.local`

6. **Set up MongoDB**

**Option 1: Local MongoDB**
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

**Option 2: MongoDB Atlas**
- Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get your connection string and add it to `.env.local`

7. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Usage Flow

### 1. User Registration/Sign In
- Users can sign up with email/password or Google OAuth
- First-time users are redirected to the profile questionnaire

### 2. Profile Questionnaire
- Multi-step form collecting:
  - Basic demographics (age, gender, ethnicity, nationality, location)
  - Personal background (childhood, family, life events)
  - Education history
  - Work experience
  - Personal life (hobbies, interests, personality traits)
  - Additional details (languages, travel, volunteer work, awards)
  - **LinkedIn profile URL (required)**

### 3. Job Portal Dashboard
- View recent searches and stats
- Search for referrals by:
  - Pasting a job URL (auto-scrapes details)
  - Manually entering job details

### 4. AI Referral Matching
- AI analyzes your profile and the job description
- Searches for people at the target company who:
  - Share your ethnicity, nationality, or background
  - Attended the same school
  - Have similar interests or hobbies
  - Work in related roles
  - Share other commonalities

### 5. Review Referral Matches
- See 5-10 potential referrers with:
  - Their LinkedIn profile link
  - Why they're relevant
  - Shared commonalities
  - Personalized outreach message
- Copy messages to send via LinkedIn (manual sending only)

## Project Structure

```
referral-finder/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts    # NextAuth configuration
│   │   │   └── register/route.ts         # User registration
│   │   ├── profile/route.ts              # Profile management
│   │   ├── referrals/
│   │   │   ├── route.ts                  # Referral matching
│   │   │   └── [id]/route.ts             # Get specific search
│   │   └── jobs/scrape/route.ts          # Job scraping
│   ├── auth/
│   │   ├── signin/page.tsx               # Sign in page
│   │   └── signup/page.tsx               # Sign up page
│   ├── dashboard/page.tsx                # Main dashboard
│   ├── questionnaire/page.tsx            # Profile questionnaire
│   ├── search/[id]/page.tsx              # Search detail view
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Landing page
│   ├── providers.tsx                     # Session provider
│   └── globals.css                       # Global styles
├── components/
│   ├── JobSearchForm.tsx                 # Job search component
│   └── ReferralResults.tsx               # Display referral matches
├── lib/
│   └── mongodb.ts                        # MongoDB connection
├── models/
│   ├── User.ts                           # User schema
│   └── JobSearch.ts                      # Job search schema
├── types/
│   └── next-auth.d.ts                    # NextAuth types
├── middleware.ts                         # Auth middleware
├── tailwind.config.ts                    # Tailwind configuration
├── next.config.js                        # Next.js configuration
└── package.json                          # Dependencies
```

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import project to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Add environment variables**
   - Add all variables from `.env.local` to Vercel
   - Don't forget to update `NEXTAUTH_URL` to your production URL

4. **Update Google OAuth redirect URI**
   - Add `https://yourdomain.com/api/auth/callback/google` to Google Console

5. **Deploy!**
   - Vercel will automatically build and deploy your app

### Environment Variables for Production

Make sure to set these in Vercel:

```
MONGODB_URI=<your-mongodb-atlas-uri>
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<your-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
OPENAI_API_KEY=<your-openai-key>
```

## Important Notes

### LinkedIn Terms of Service
- **Manual Sending Only**: This app provides suggested messages that users must manually copy and send via LinkedIn
- **No Automation**: We do NOT automate sending messages to comply with LinkedIn's Terms of Service
- **Educational Purpose**: Users should use this tool responsibly and respectfully

### AI Model Options

The app supports both OpenAI and Grok:

**Using OpenAI (default):**
```env
OPENAI_API_KEY=your-openai-key
```

**Using Grok:**
```env
XAI_API_KEY=your-grok-key
```

The code automatically detects which API key is available.

### Data Privacy
- User data is stored securely in MongoDB
- Passwords are hashed with bcrypt
- Profile data is only used for referral matching
- No data is shared with third parties

## Customization

### Modify AI Prompts
Edit `/app/api/referrals/route.ts` to customize how the AI finds and matches referrers.

### Add More Fields to Profile
1. Update `/models/User.ts` schema
2. Add fields to `/app/questionnaire/page.tsx`
3. Update the AI prompt in `/app/api/referrals/route.ts`

### Change Styling
- Modify `/app/globals.css` for global styles
- Update `/tailwind.config.ts` for theme colors
- Edit component styles directly

## Troubleshooting

### MongoDB Connection Issues
```bash
# Make sure MongoDB is running
docker ps  # Check if MongoDB container is running

# Test connection
mongosh mongodb://localhost:27017/referral-finder
```

### NextAuth Issues
```bash
# Regenerate secret
openssl rand -base64 32

# Clear browser cookies and try again
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For questions or issues:
- Open a GitHub issue
- Check existing documentation
- Review the code comments

## Acknowledgments

- Built with Next.js and React
- AI powered by OpenAI/Grok
- UI components with Tailwind CSS
- Authentication with NextAuth.js

---

**Remember**: This tool is meant to facilitate genuine networking. Always be respectful and personal in your outreach!

