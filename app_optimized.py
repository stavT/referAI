from flask import Flask, render_template, request, jsonify
import requests
import os
import PyPDF2
import io
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

XAI_API_KEY = os.getenv('XAI_API_KEY')
GROK_API_URL = "https://api.x.ai/v1/chat/completions"

def extract_text_from_pdf(pdf_file):
    """Extract text content from uploaded PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file.read()))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

def search_linkedin_profiles(job_description, user_profile):
    """Use Grok API to search for relevant LinkedIn profiles"""
    prompt = f"""Find 4 LinkedIn profiles of people who work at the company in this job description. They must be real employees who could provide referrals.

Job: {job_description}
User: {user_profile}

Return JSON array with objects containing: name, linkedin_url, relevance, message
- name: real person's name
- linkedin_url: valid LinkedIn URL of someone at that company
- relevance: their role and why they'd be a good referral source
- message: personalized outreach (80-700 chars, polite, clear ask for referral)

Only return profiles of people who actually work at the target company."""

    headers = {
        "Authorization": f"Bearer {XAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "grok-4",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 1500,
        "temperature": 0.7
    }
    
    try:
        response = requests.post(GROK_API_URL, headers=headers, json=data, timeout=120)
        response.raise_for_status()
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        # Try to extract JSON from the response
        import json
        try:
            # Look for JSON content in the response
            start_idx = content.find('[')
            end_idx = content.rfind(']') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = content[start_idx:end_idx]
                profiles = json.loads(json_str)
                
                # Ensure we have exactly 4 profiles with valid LinkedIn URLs
                valid_profiles = []
                for profile in profiles:
                    if (profile.get('linkedin_url') and 
                        'linkedin.com' in profile['linkedin_url'] and
                        profile.get('name') and
                        profile.get('relevance') and
                        profile.get('message')):
                        valid_profiles.append(profile)
                
                if len(valid_profiles) >= 4:
                    return valid_profiles[:4]  # Return exactly 4 profiles
                else:
                    raise Exception(f"Could only find {len(valid_profiles)} valid profiles, need 4")
                
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse Grok API response: {str(e)}")
        
        raise Exception("No valid profiles found in Grok API response")
        
    except Exception as e:
        print(f"Error calling Grok API: {str(e)}")
        # NEVER return mock data - always raise an error
        raise Exception(f"Grok API failed: {str(e)}. Please check your API key and try again.")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/find_referrals', methods=['POST'])
def find_referrals():
    try:
        # Get form data
        resume_text = ""
        if 'resume_file' in request.files and request.files['resume_file'].filename:
            resume_file = request.files['resume_file']
            if resume_file.filename.lower().endswith('.pdf'):
                resume_text = extract_text_from_pdf(resume_file)
            else:
                return jsonify({"error": "Only PDF files are supported"}), 400
        else:
            resume_text = request.form.get('resume_text', '')
        
        linkedin_profile = request.form.get('linkedin_profile', '')
        interests = request.form.get('interests', '')
        job_description = request.form.get('job_description', '')
        job_link = request.form.get('job_link', '')
        
        # Combine all user profile information
        user_profile = f"Resume: {resume_text}\nLinkedIn: {linkedin_profile}\nInterests/Context: {interests}"
        
        # Combine job information
        full_job_description = f"Job Description: {job_description}\nJob Link: {job_link}"
        
        # Search for LinkedIn profiles using Grok API only
        profiles = search_linkedin_profiles(full_job_description, user_profile)
        
        return jsonify({"profiles": profiles})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
