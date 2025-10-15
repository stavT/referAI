import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import JobSearch from '@/models/JobSearch';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    // Create user profile summary
    const userProfileSummary = `
User Profile:
- Name: ${user.name}
- LinkedIn: ${user.profile?.linkedinUrl || 'Not provided'}
- Ethnicity: ${user.profile?.ethnicity || 'N/A'}
- Nationality: ${user.profile?.nationality || 'N/A'}
- Location: ${user.profile?.currentLocation || 'N/A'}
- Education: ${user.profile?.educationHistory?.map((edu: any) => 
  `${edu.degree} in ${edu.major} from ${edu.school}`
).join(', ') || 'Not provided'}
- Work: ${user.profile?.workExperience?.map((work: any) => 
  `${work.position} at ${work.company}`
).join(', ') || 'Not provided'}
- Interests: ${user.profile?.interests?.join(', ') || 'N/A'}
- Languages: ${user.profile?.languages?.join(', ') || 'N/A'}
- Values: ${user.profile?.personalityTraits?.values?.join(', ') || 'N/A'}
`;

    const searchPrompt = `Use web search to find REAL employees currently working at ${company}. 

Search LinkedIn for people at ${company} in roles related to: ${jobTitle}

CRITICAL REQUIREMENTS:
1. Use web search to find ACTUAL LinkedIn profiles
2. Only return people who CURRENTLY work at ${company}
3. Return 5-10 REAL employees with valid LinkedIn URLs
4. Match people who share commonalities with this user:

${userProfileSummary}

Look for shared: ethnicity, nationality, alma mater, location, interests, values, language, or background.

For each person found, return this JSON structure:
{
  "matches": [
    {
      "name": "Real Full Name from their LinkedIn",
      "linkedinUrl": "https://linkedin.com/in/their-real-username",
      "relevance": "Their current job title at ${company} and why they're a good referral contact",
      "commonalities": ["Specific shared background/trait", "Another specific commonality"],
      "suggestedMessage": "Personalized 150-300 character message highlighting specific shared traits",
      "connectionDegree": "2nd degree"
    }
  ]
}

IMPORTANT:
- Use web search to verify they currently work at ${company}
- LinkedIn URLs must be real and accessible
- Focus on genuine connections (shared background, school, interests, etc.)
- Messages must mention specific commonalities, not be generic`;

    console.log(`Searching for employees at ${company} using web search...`);

    // Use OpenAI Responses API with web search
    try {
      const response: any = await openai.responses.create({
        model: 'gpt-4o-mini',
        tools: [
          { 
            type: 'web_search',
            filters: {
              allowed_domains: ['linkedin.com']
            }
          }
        ],
        tool_choice: 'auto',
        include: ['web_search_call.action.sources'],
        input: searchPrompt,
      });

      console.log('Web search completed');
      console.log('Sources used:', response.output?.[0]?.web_search_call?.action?.sources);

      // Get the text response
      let responseText = '';
      if (response.output_text) {
        responseText = response.output_text;
      } else if (response.output && Array.isArray(response.output)) {
        const messageOutput = response.output.find((item: any) => item.type === 'message');
        if (messageOutput?.content?.[0]?.text) {
          responseText = messageOutput.content[0].text;
        }
      }

      console.log('Response text:', responseText?.substring(0, 500));

      if (!responseText) {
        throw new Error('No response text from OpenAI');
      }

      // Parse JSON from response
      let result: any;
      try {
        // Try to extract JSON if it's wrapped in markdown or text
        const jsonMatch = responseText.match(/\{[\s\S]*"matches"[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          result = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Failed to parse AI response as JSON');
      }

      const matches: ReferralMatch[] = result.matches || [];

      console.log(`Found ${matches.length} potential matches`);

      // Validate matches
      const validMatches = matches.filter((match: ReferralMatch) => {
        const isValid = (
          match.name &&
          match.linkedinUrl &&
          match.linkedinUrl.includes('linkedin.com/in/') &&
          match.relevance &&
          match.relevance.toLowerCase().includes(company.toLowerCase()) &&
          match.commonalities?.length > 0 &&
          match.suggestedMessage &&
          !match.linkedinUrl.toLowerCase().includes('example') &&
          !match.linkedinUrl.toLowerCase().includes('fake') &&
          !match.linkedinUrl.toLowerCase().includes('test')
        );

        if (!isValid) {
          console.log('Invalid match filtered out:', match.name, match.linkedinUrl);
        }

        return isValid;
      });

      console.log(`${validMatches.length} valid matches after filtering`);

      if (validMatches.length === 0) {
        return NextResponse.json(
          { error: `No valid employees found at ${company}. The AI may not have found real LinkedIn profiles. Try a different company or job.` },
          { status: 404 }
        );
      }

      // Save to database
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

    } catch (apiError: any) {
      console.error('OpenAI API error:', apiError);
      
      // Fallback to regular chat completions if Responses API fails
      console.log('Falling back to Chat Completions API...');
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: searchPrompt + '\n\nNote: Search the web and LinkedIn to find REAL current employees.'
        }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 3000,
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from fallback API');
      }

      const result = JSON.parse(responseContent);
      const matches = result.matches || [];

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
    }
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

