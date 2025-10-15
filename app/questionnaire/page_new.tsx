'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function QuestionnairePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple state object for all form data
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    age: '',
    gender: '',
    ethnicity: '',
    race: '',
    nationality: '',
    currentLocation: '',
    
    // Step 2: Background
    childhoodLocation: '',
    familyStructure: '',
    keyLifeEvents: '',
    
    // Step 3: Education
    school: '',
    degree: '',
    major: '',
    graduationYear: '',
    
    // Step 4: Work Experience
    company: '',
    position: '',
    duration: '',
    skills: '',
    achievements: '',
    
    // Step 5: Personal Life
    romanticStatus: '',
    hobbies: '',
    interests: '',
    
    // Step 6: Personality
    personalityType: '',
    values: '',
    goals: '',
    strengths: '',
    
    // Step 7: Additional
    languages: '',
    travelExperiences: '',
    volunteerWork: '',
    awards: '',
    sideProjects: '',
    
    // Step 8: LinkedIn
    linkedinUrl: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // Load saved data from localStorage
    const saved = localStorage.getItem('questionnaireData');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setFormData(parsedData);
        toast.success('Restored your previous progress!');
      } catch (e) {
        console.error('Failed to restore data:', e);
      }
    }
  }, [status, router]);

  // Save to localStorage whenever formData changes
  useEffect(() => {
    if (Object.values(formData).some(v => v !== '')) {
      localStorage.setItem('questionnaireData', JSON.stringify(formData));
    }
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate LinkedIn URL
    if (!formData.linkedinUrl || !formData.linkedinUrl.includes('linkedin.com')) {
      toast.error('Please enter a valid LinkedIn URL');
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting profile data:', formData);

    try {
      // Transform data to match API schema
      const profileData = {
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
        ethnicity: formData.ethnicity || undefined,
        race: formData.race || undefined,
        nationality: formData.nationality || undefined,
        currentLocation: formData.currentLocation || undefined,
        childhoodLocation: formData.childhoodLocation || undefined,
        familyStructure: formData.familyStructure || undefined,
        keyLifeEvents: formData.keyLifeEvents ? formData.keyLifeEvents.split('\n').filter(e => e.trim()) : undefined,
        educationHistory: formData.school ? [{
          school: formData.school,
          degree: formData.degree,
          major: formData.major,
          graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined
        }] : undefined,
        workExperience: formData.company ? [{
          company: formData.company,
          position: formData.position,
          duration: formData.duration,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
          achievements: formData.achievements ? formData.achievements.split('\n').filter(a => a.trim()) : []
        }] : undefined,
        romanticStatus: formData.romanticStatus || undefined,
        hobbies: formData.hobbies ? formData.hobbies.split(',').map(h => h.trim()).filter(h => h) : undefined,
        interests: formData.interests ? formData.interests.split(',').map(i => i.trim()).filter(i => i) : undefined,
        personalityTraits: {
          introvertExtrovert: formData.personalityType || undefined,
          values: formData.values ? formData.values.split(',').map(v => v.trim()).filter(v => v) : undefined,
          goals: formData.goals ? formData.goals.split('\n').filter(g => g.trim()) : undefined,
          strengths: formData.strengths ? formData.strengths.split(',').map(s => s.trim()).filter(s => s) : undefined,
        },
        languages: formData.languages ? formData.languages.split(',').map(l => l.trim()).filter(l => l) : undefined,
        travelExperiences: formData.travelExperiences ? formData.travelExperiences.split('\n').filter(t => t.trim()) : undefined,
        volunteerWork: formData.volunteerWork ? formData.volunteerWork.split('\n').filter(v => v.trim()) : undefined,
        uniqueAspects: {
          awards: formData.awards ? formData.awards.split(',').map(a => a.trim()).filter(a => a) : undefined,
          sideProjects: formData.sideProjects ? formData.sideProjects.split(',').map(p => p.trim()).filter(p => p) : undefined,
        },
        linkedinUrl: formData.linkedinUrl
      };

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();
      console.log('API response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save profile');
      }

      toast.success('Profile saved successfully!');
      localStorage.removeItem('questionnaireData');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 8) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const progress = (currentStep / 8) * 100;
  const steps = [
    'Basic Information',
    'Background',
    'Education',
    'Work Experience',
    'Personal Life',
    'Personality & Goals',
    'Additional Details',
    'LinkedIn Profile'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="mt-2 text-gray-600">
            Help us understand you better to find the perfect referrals
          </p>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Step {currentStep} of 8: {steps[currentStep - 1]}
              </span>
              <span className="text-sm text-gray-600">{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">{steps[currentStep - 1]}</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleChange('age', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Ethnicity</label>
                  <input
                    type="text"
                    value={formData.ethnicity}
                    onChange={(e) => handleChange('ethnicity', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Race</label>
                  <input
                    type="text"
                    value={formData.race}
                    onChange={(e) => handleChange('race', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Nationality</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => handleChange('nationality', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Current Location</label>
                  <input
                    type="text"
                    value={formData.currentLocation}
                    onChange={(e) => handleChange('currentLocation', e.target.value)}
                    className="input-field"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Background */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="label">Where did you grow up?</label>
                  <input
                    type="text"
                    value={formData.childhoodLocation}
                    onChange={(e) => handleChange('childhoodLocation', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Family Structure</label>
                  <textarea
                    value={formData.familyStructure}
                    onChange={(e) => handleChange('familyStructure', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="e.g., Nuclear family, single parent, etc."
                  />
                </div>
                <div>
                  <label className="label">Key Life Events (one per line)</label>
                  <textarea
                    value={formData.keyLifeEvents}
                    onChange={(e) => handleChange('keyLifeEvents', e.target.value)}
                    className="input-field"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Education */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="label">School/University</label>
                  <input
                    type="text"
                    value={formData.school}
                    onChange={(e) => handleChange('school', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Degree</label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => handleChange('degree', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Major</label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => handleChange('major', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Graduation Year</label>
                  <input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => handleChange('graduationYear', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Work */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="label">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    className="input-field"
                    placeholder="e.g., 2 years, 2020-2022"
                  />
                </div>
                <div>
                  <label className="label">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => handleChange('skills', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Achievements (one per line)</label>
                  <textarea
                    value={formData.achievements}
                    onChange={(e) => handleChange('achievements', e.target.value)}
                    className="input-field"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Personal */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <label className="label">Relationship Status</label>
                  <select
                    value={formData.romanticStatus}
                    onChange={(e) => handleChange('romanticStatus', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select...</option>
                    <option value="single">Single</option>
                    <option value="in-relationship">In a relationship</option>
                    <option value="married">Married</option>
                  </select>
                </div>
                <div>
                  <label className="label">Hobbies (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.hobbies}
                    onChange={(e) => handleChange('hobbies', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Interests (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.interests}
                    onChange={(e) => handleChange('interests', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Personality */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div>
                  <label className="label">Personality Type</label>
                  <select
                    value={formData.personalityType}
                    onChange={(e) => handleChange('personalityType', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select...</option>
                    <option value="introvert">Introvert</option>
                    <option value="extrovert">Extrovert</option>
                    <option value="ambivert">Ambivert</option>
                  </select>
                </div>
                <div>
                  <label className="label">Values (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.values}
                    onChange={(e) => handleChange('values', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Goals (one per line)</label>
                  <textarea
                    value={formData.goals}
                    onChange={(e) => handleChange('goals', e.target.value)}
                    className="input-field"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="label">Strengths (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.strengths}
                    onChange={(e) => handleChange('strengths', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {/* Step 7: Additional */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <div>
                  <label className="label">Languages (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.languages}
                    onChange={(e) => handleChange('languages', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Travel Experiences (one per line)</label>
                  <textarea
                    value={formData.travelExperiences}
                    onChange={(e) => handleChange('travelExperiences', e.target.value)}
                    className="input-field"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="label">Volunteer Work (one per line)</label>
                  <textarea
                    value={formData.volunteerWork}
                    onChange={(e) => handleChange('volunteerWork', e.target.value)}
                    className="input-field"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="label">Awards (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.awards}
                    onChange={(e) => handleChange('awards', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Side Projects (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.sideProjects}
                    onChange={(e) => handleChange('sideProjects', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {/* Step 8: LinkedIn */}
            {currentStep === 8 && (
              <div className="space-y-4">
                <div>
                  <label className="label">LinkedIn Profile URL *</label>
                  <input
                    type="text"
                    value={formData.linkedinUrl}
                    onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                    className="input-field"
                    placeholder="https://linkedin.com/in/yourprofile"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Required to find the best referrals for you
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Almost done!</strong> Click "Complete Profile" to save and start finding referrals.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {currentStep < 8 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : 'Complete Profile'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

