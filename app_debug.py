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

Return a JSON array with exactly 4 objects. Each object must have:
- "name": real person's full name
- "linkedin_url": valid LinkedIn URL (must contain linkedin.com)
- "relevance": brief explanation of their role and why they'd be a good referral source
- "message": personalized outreach message (80-700 characters, polite, clear ask for referral)

Example format:
[
  {{
    "name": "John Smith",
    "linkedin_url": "https://linkedin.com/in/johnsmith",
    "relevance": "Senior Engineer at the company with 8+ years experience",
    "message": "Hi John, I'm interested in the role at your company..."
  }}
]

Only return profiles of people who actually work at the target company. Return valid JSON only."""

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
        "max_tokens": 2000,
        "temperature": 0.7
    }
    
    try:
        response = requests.post(GROK_API_URL, headers=headers, json=data, timeout=120)
        response.raise_for_status()
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        # Debug: Print the actual response content
        print(f"DEBUG: Grok API response content: {content[:500]}...")
        
        # Try to extract JSON from the response
        import json
        try:
            # First, try to parse the entire content as JSON
            try:
                profiles = json.loads(content)
                if isinstance(profiles, list):
                    print(f"DEBUG: Successfully parsed JSON array with {len(profiles)} profiles")
                else:
                    raise Exception("Response is not a JSON array")
            except json.JSONDecodeError:
                # If that fails, try to extract JSON from within the content
                print("DEBUG: Direct JSON parsing failed, trying to extract JSON from content")
                start_idx = content.find('[')
                end_idx = content.rfind(']') + 1
                
                if start_idx != -1 and end_idx != -1:
                    json_str = content[start_idx:end_idx]
                    print(f"DEBUG: Extracted JSON string: {json_str[:200]}...")
                    profiles = json.loads(json_str)
                else:
                    # Try to find JSON objects
                    import re
                    json_pattern = r'\{[^{}]*"name"[^{}]*"linkedin_url"[^{}]*\}'
                    matches = re.findall(json_pattern, content)
                    if matches:
                        print(f"DEBUG: Found {len(matches)} JSON objects using regex")
                        profiles = []
                        for match in matches:
                            try:
                                profile = json.loads(match)
                                profiles.append(profile)
                            except:
                                continue
                    else:
                        raise Exception("No JSON content found in response")
            
            # Validate profiles
            valid_profiles = []
            for profile in profiles:
                if (profile.get('linkedin_url') and 
                    'linkedin.com' in profile['linkedin_url'] and
                    profile.get('name') and
                    profile.get('relevance') and
                    profile.get('message')):
                    valid_profiles.append(profile)
                    print(f"DEBUG: Valid profile found: {profile['name']}")
                else:
                    print(f"DEBUG: Invalid profile: {profile}")
            
            if len(valid_profiles) >= 4:
                print(f"DEBUG: Returning {len(valid_profiles)} valid profiles")
                return valid_profiles[:4]
            else:
                raise Exception(f"Could only find {len(valid_profiles)} valid profiles, need 4")
                
        except json.JSONDecodeError as e:
            print(f"DEBUG: JSON decode error: {str(e)}")
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
