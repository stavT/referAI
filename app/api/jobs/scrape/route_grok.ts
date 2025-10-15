import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.XAI_API_KEY ? 'https://api.x.ai/v1' : undefined,
});

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log('Scraping job from URL:', url);

    // Use Grok with Live Search to read the job page
    const prompt = `Visit this job posting URL and extract the job details: ${url}

Extract and return this information in JSON format:
{
  "title": "The job title",
  "company": "The company name",
  "description": "The full job description (first 1000 characters)"
}

Be accurate and only return information you find on the actual page.`;

    const requestBody: any = {
      model: process.env.XAI_API_KEY ? 'grok-2-latest' : 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    };

    // Add search parameters for Grok to read the URL
    if (process.env.XAI_API_KEY) {
      requestBody.search_parameters = {
        mode: 'on',
        return_citations: true,
      };
    }

    const response = await openai.chat.completions.create(requestBody);

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI extracted job data:', content);

    const jobData = JSON.parse(content);

    if (!jobData.title || !jobData.company) {
      return NextResponse.json(
        { 
          error: 'Could not extract job details from URL. Please enter them manually.',
          partialData: jobData 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      job: {
        title: jobData.title,
        company: jobData.company,
        description: jobData.description || '',
        url: url
      }
    });
    
  } catch (error: any) {
    console.error('Job scraping error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to scrape job details. Please enter them manually.' },
      { status: 500 }
    );
  }
}

