import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import JobSearch from '@/models/JobSearch';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.XAI_API_KEY,
  baseURL: process.env.XAI_API_KEY ? 'https://api.x.ai/v1' : undefined,
});

interface ReferralMatch {
  name: string;
  linkedinUrl: string;
  relevance: string;
  commonalities: string[];
  suggestedMessage: string;
  connectionDegree?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobTitle, company, jobDescription, jobUrl } = await req.json();

    if (!jobTitle || !company || !jobDescription) {
      return NextResponse.json(
        { error: 'Job title, company, and description are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id);

    if (!user || !user.profileCompleted) {
      return NextResponse.json(
        { error: 'Please complete your profile first' },
        { status: 400 }
      );
    }

    // Create a comprehensive user profile summary for the AI
    const userProfileSummary = `
User Profile:
- Name: ${user.name}
- LinkedIn: ${user.profile?.linkedinUrl || 'Not provided'}
- Age: ${user.profile?.age || 'N/A'}
- Gender: ${user.profile?.gender || 'N/A'}
- Ethnicity: ${user.profile?.ethnicity || 'N/A'}
- Nationality: ${user.profile?.nationality || 'N/A'}
- Current Location: ${user.profile?.currentLocation || 'N/A'}
- Childhood Location: ${user.profile?.childhoodLocation || 'N/A'}

Education:
${user.profile?.educationHistory?.map((edu: any) => 
  `- ${edu.degree} in ${edu.major} from ${edu.school} (${edu.graduationYear || 'N/A'})`
).join('\n') || 'Not provided'}

Work Experience:
${user.profile?.workExperience?.map((work: any) => 
  `- ${work.position} at ${work.company} (${work.duration})\n  Skills: ${work.skills?.join(', ') || 'N/A'}\n  Achievements: ${work.achievements?.join(', ') || 'N/A'}`
).join('\n') || 'Not provided'}

Interests & Hobbies: ${user.profile?.interests?.join(', ') || 'N/A'}, ${user.profile?.hobbies?.join(', ') || 'N/A'}
Languages: ${user.profile?.languages?.join(', ') || 'N/A'}
Personality: ${user.profile?.personalityTraits?.introvertExtrovert || 'N/A'}
Values: ${user.profile?.personalityTraits?.values?.join(', ') || 'N/A'}
Goals: ${user.profile?.personalityTraits?.goals?.join(', ') || 'N/A'}
Strengths: ${user.profile?.personalityTraits?.strengths?.join(', ') || 'N/A'}

Volunteer Work: ${user.profile?.volunteerWork?.join(', ') || 'N/A'}
Awards: ${user.profile?.uniqueAspects?.awards?.join(', ') || 'N/A'}
Side Projects: ${user.profile?.uniqueAspects?.sideProjects?.join(', ') || 'N/A'}
`;

    const prompt = `You are an expert networking strategist. Your task is to find 5-10 potential referrers on LinkedIn for this user's job application.

${userProfileSummary}

Target Job:
- Title: ${jobTitle}
- Company: ${company}
- Description: ${jobDescription}

Instructions:
1. Search for people who currently work at ${company} or have relevant connections
2. Prioritize people who share commonalities with the user:
   - Same ethnicity, nationality, or cultural background
   - Same alma mater or educational background
   - Same location or hometown
   - Similar interests, hobbies, or values
   - Similar career path or skills
   - Similar volunteer experiences or causes

3. For each potential referrer, identify:
   - Their name and LinkedIn profile URL (must be real and valid: https://linkedin.com/in/username)
   - Why they're relevant (their role, connection to the company)
   - Specific commonalities they share with the user
   - Their likely connection degree (2nd degree, 3rd degree, or open profile)

4. Generate a personalized outreach message (150-300 characters) that:
   - Mentions specific commonalities (e.g., "As a fellow [ethnicity] graduate from [school]...")
   - Highlights the user's fit for the role
   - Makes a polite ask for referral or quick chat
   - Feels genuine and personal, not templated

Return EXACTLY this JSON format:
{
  "matches": [
    {
      "name": "Full Name",
      "linkedinUrl": "https://linkedin.com/in/actual-username",
      "relevance": "Their current role at the company and why they matter",
      "commonalities": ["Shared ethnicity/background", "Same alma mater", "Similar interests"],
      "suggestedMessage": "Hi [Name], as a fellow [commonality]...",
      "connectionDegree": "2nd degree" or "3rd degree" or "Open profile"
    }
  ]
}

IMPORTANT: 
- Return 5-10 matches minimum
- All LinkedIn URLs must be real and valid
- Focus on genuine shared connections and commonalities
- Messages should be personal, not generic`;

    console.log('Sending request to AI for referral matching...');

    const completion = await openai.chat.completions.create({
      model: process.env.XAI_API_KEY ? 'grok-beta' : 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 3000,
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error('No response from AI');
    }

    console.log('AI Response:', responseContent);

    const result = JSON.parse(responseContent);
    const matches: ReferralMatch[] = result.matches || [];

    // Validate matches
    const validMatches = matches.filter((match: ReferralMatch) => {
      return (
        match.name &&
        match.linkedinUrl &&
        match.linkedinUrl.includes('linkedin.com/in/') &&
        match.relevance &&
        match.commonalities?.length > 0 &&
        match.suggestedMessage
      );
    });

    if (validMatches.length === 0) {
      return NextResponse.json(
        { error: 'No valid referral matches found' },
        { status: 404 }
      );
    }

    // Save the job search and matches to database
    const jobSearch = await JobSearch.create({
      userId: session.user.id,
      jobTitle,
      company,
      jobDescription,
      jobUrl,
      referralMatches: validMatches,
    });

    return NextResponse.json({
      matches: validMatches,
      searchId: jobSearch._id,
    });
  } catch (error) {
    console.error('Referral matching error:', error);
    return NextResponse.json(
      { error: 'Failed to find referral matches' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const searches = await JobSearch.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({ searches });
  } catch (error) {
    console.error('Search history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search history' },
      { status: 500 }
    );
  }
}

