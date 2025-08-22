# Referral Finder

A simple web application that helps users find relevant LinkedIn connections for job referrals using Grok's AI API.

## Features

- Upload PDF resume or paste resume text
- Input LinkedIn profile and personal interests
- Paste job description or job posting link
- AI-powered search for relevant LinkedIn profiles
- Generated personalized outreach messages
- Copy-to-clipboard functionality for messages

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   - Copy `env_example.txt` to `.env`
   - Add your Grok API key:
     ```
     GROK_API_KEY=your_actual_grok_api_key_here
     ```

3. **Run the application:**
   ```bash
   python app.py
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5001`

## Usage

1. **Fill in your profile:**
   - Upload a PDF resume OR paste resume text
   - Add your LinkedIn profile URL
   - Include personal interests or extra context

2. **Add job details:**
   - Paste the job description (required)
   - Optionally add the job posting link

3. **Find referrals:**
   - Click "Find Referral Candidates"
   - The app will use Grok's API to find relevant LinkedIn profiles
   - Results show 4 candidates with personalized outreach messages

4. **Use the results:**
   - Click on LinkedIn profiles to view them
   - Use the "Copy Message" button to copy outreach messages
   - Reach out to candidates for referrals

## API Requirements

- **Grok API Key**: Required for AI-powered profile search
- **API Endpoint**: Uses Grok's chat completions API
- **Model**: Uses `grok-beta` model for profile generation

## Technical Details

- **Backend**: Flask (Python)
- **Frontend**: HTML/CSS/JavaScript
- **File Processing**: PDF text extraction with PyPDF2
- **API Integration**: HTTP requests to Grok API
- **Error Handling**: Fallback to mock data if API fails

## Notes

- The application always returns exactly 4 profiles
- Messages are 80-700 characters as requested
- LinkedIn URLs are validated to ensure they're real LinkedIn profiles
- If the Grok API fails, the app falls back to sample data for demonstration
