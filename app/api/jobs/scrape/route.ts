import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Fetch the job posting page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch job page');
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let jobData: any = {
      title: '',
      company: '',
      description: '',
      url: url,
    };

    // LinkedIn job scraping
    if (url.includes('linkedin.com/jobs')) {
      jobData.title = $('.top-card-layout__title').text().trim() || 
                      $('h1.topcard__title').text().trim();
      jobData.company = $('.topcard__org-name-link').text().trim() || 
                        $('.top-card-layout__card a.topcard__org-name-link').text().trim();
      jobData.description = $('.description__text').text().trim() || 
                           $('.show-more-less-html__markup').text().trim();
    }
    // Indeed job scraping
    else if (url.includes('indeed.com')) {
      jobData.title = $('h1.jobsearch-JobInfoHeader-title').text().trim() ||
                      $('.jobsearch-JobInfoHeader-title-container h1').text().trim();
      jobData.company = $('[data-company-name="true"]').text().trim() ||
                        $('.jobsearch-InlineCompanyRating-companyHeader a').text().trim();
      jobData.description = $('#jobDescriptionText').text().trim();
    }
    // Glassdoor job scraping
    else if (url.includes('glassdoor.com')) {
      jobData.title = $('[data-test="job-title"]').text().trim();
      jobData.company = $('[data-test="employer-name"]').text().trim();
      jobData.description = $('.jobDescriptionContent').text().trim();
    }
    // Generic fallback
    else {
      jobData.title = $('h1').first().text().trim() || 
                      $('title').text().trim();
      jobData.company = $('[class*="company"]').first().text().trim() ||
                        $('[class*="employer"]').first().text().trim();
      jobData.description = $('[class*="description"]').first().text().trim() ||
                           $('p').slice(0, 5).text().trim();
    }

    // Clean up the data
    jobData.title = jobData.title.split('|')[0].trim();
    jobData.company = jobData.company.split('|')[0].trim();
    jobData.description = jobData.description.substring(0, 2000); // Limit description length

    if (!jobData.title || !jobData.company) {
      return NextResponse.json(
        { 
          error: 'Could not extract job details from URL. Please enter them manually.',
          partialData: jobData 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ job: jobData });
  } catch (error) {
    console.error('Job scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape job details. Please enter them manually.' },
      { status: 500 }
    );
  }
}

