'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const profileSchema = z.object({
  age: z.number().min(16).max(100).optional(),
  gender: z.string().optional(),
  ethnicity: z.string().optional(),
  race: z.string().optional(),
  nationality: z.string().optional(),
  currentLocation: z.string().optional(),
  childhoodLocation: z.string().optional(),
  familyStructure: z.string().optional(),
  keyLifeEvents: z.array(z.string()).optional(),
  educationHistory: z.array(z.object({
    school: z.string(),
    degree: z.string(),
    major: z.string(),
    graduationYear: z.number().optional(),
  })).optional(),
  workExperience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    duration: z.string(),
    skills: z.array(z.string()),
    achievements: z.array(z.string()),
  })).optional(),
  romanticStatus: z.string().optional(),
  hobbies: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  personalityTraits: z.object({
    introvertExtrovert: z.string().optional(),
    values: z.array(z.string()).optional(),
    goals: z.array(z.string()).optional(),
    strengths: z.array(z.string()).optional(),
    weaknesses: z.array(z.string()).optional(),
  }).optional(),
  languages: z.array(z.string()).optional(),
  travelExperiences: z.array(z.string()).optional(),
  volunteerWork: z.array(z.string()).optional(),
  uniqueAspects: z.object({
    awards: z.array(z.string()).optional(),
    publications: z.array(z.string()).optional(),
    sideProjects: z.array(z.string()).optional(),
  }).optional(),
  linkedinUrl: z.string().url().regex(/linkedin\.com/, 'Must be a valid LinkedIn URL'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const steps = [
  { id: 1, title: 'Basic Information', fields: ['age', 'gender', 'ethnicity', 'race', 'nationality', 'currentLocation'] },
  { id: 2, title: 'Background', fields: ['childhoodLocation', 'familyStructure', 'keyLifeEvents'] },
  { id: 3, title: 'Education', fields: ['educationHistory'] },
  { id: 4, title: 'Work Experience', fields: ['workExperience'] },
  { id: 5, title: 'Personal Life', fields: ['romanticStatus', 'hobbies', 'interests'] },
  { id: 6, title: 'Personality & Goals', fields: ['personalityTraits'] },
  { id: 7, title: 'Additional Details', fields: ['languages', 'travelExperiences', 'volunteerWork', 'uniqueAspects'] },
  { id: 8, title: 'LinkedIn Profile', fields: ['linkedinUrl'] },
];

export default function QuestionnairePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      toast.success('Profile saved successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="mt-2 text-gray-600">
            Help us understand you better to find the perfect referrals
          </p>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Step {currentStep} of {steps.length}
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
          <h2 className="text-xl font-semibold mb-6">{steps[currentStep - 1].title}</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Age</label>
                    <input
                      type="number"
                      {...register('age', { valueAsNumber: true })}
                      className="input-field"
                    />
                    {errors.age && <p className="error-text">{errors.age.message}</p>}
                  </div>

                  <div>
                    <label className="label">Gender</label>
                    <select {...register('gender')} className="input-field">
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Ethnicity</label>
                  <input type="text" {...register('ethnicity')} className="input-field" />
                </div>

                <div>
                  <label className="label">Race</label>
                  <input type="text" {...register('race')} className="input-field" />
                </div>

                <div>
                  <label className="label">Nationality</label>
                  <input type="text" {...register('nationality')} className="input-field" />
                </div>

                <div>
                  <label className="label">Current Location (City, Country)</label>
                  <input type="text" {...register('currentLocation')} className="input-field" />
                </div>
              </div>
            )}

            {/* Step 2: Background */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="label">Where did you grow up?</label>
                  <input type="text" {...register('childhoodLocation')} className="input-field" />
                </div>

                <div>
                  <label className="label">Family Structure</label>
                  <textarea
                    {...register('familyStructure')}
                    className="input-field"
                    rows={3}
                    placeholder="e.g., Nuclear family, single parent, etc."
                  />
                </div>

                <div>
                  <label className="label">Key Life Events (one per line)</label>
                  <textarea
                    {...register('keyLifeEvents')}
                    className="input-field"
                    rows={4}
                    placeholder="Major events that shaped who you are today..."
                    onChange={(e) => {
                      const events = e.target.value.split('\n').filter(e => e.trim());
                      setValue('keyLifeEvents', events);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Education - Simplified */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="label">School/University</label>
                  <input
                    type="text"
                    {...register('educationHistory.0.school')}
                    className="input-field"
                    placeholder="e.g., Stanford University"
                  />
                </div>

                <div>
                  <label className="label">Degree</label>
                  <input
                    type="text"
                    {...register('educationHistory.0.degree')}
                    className="input-field"
                    placeholder="e.g., Bachelor's, Master's, PhD"
                  />
                </div>

                <div>
                  <label className="label">Major/Field of Study</label>
                  <input
                    type="text"
                    {...register('educationHistory.0.major')}
                    className="input-field"
                    placeholder="e.g., Computer Science"
                  />
                </div>

                <div>
                  <label className="label">Graduation Year</label>
                  <input
                    type="number"
                    {...register('educationHistory.0.graduationYear', { valueAsNumber: true })}
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Work Experience - Simplified */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="label">Most Recent Company</label>
                  <input
                    type="text"
                    {...register('workExperience.0.company')}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Position/Title</label>
                  <input
                    type="text"
                    {...register('workExperience.0.position')}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Duration</label>
                  <input
                    type="text"
                    {...register('workExperience.0.duration')}
                    className="input-field"
                    placeholder="e.g., 2 years, 2020-2022"
                  />
                </div>

                <div>
                  <label className="label">Key Skills (comma-separated)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., Python, React, Leadership"
                    onChange={(e) => {
                      const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                      setValue('workExperience.0.skills', skills);
                    }}
                  />
                </div>

                <div>
                  <label className="label">Key Achievements (one per line)</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    onChange={(e) => {
                      const achievements = e.target.value.split('\n').filter(a => a.trim());
                      setValue('workExperience.0.achievements', achievements);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Personal Life */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <label className="label">Relationship Status</label>
                  <select {...register('romanticStatus')} className="input-field">
                    <option value="">Select...</option>
                    <option value="single">Single</option>
                    <option value="in-relationship">In a relationship</option>
                    <option value="married">Married</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="label">Hobbies (comma-separated)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., Reading, Hiking, Photography"
                    onChange={(e) => {
                      const hobbies = e.target.value.split(',').map(h => h.trim()).filter(h => h);
                      setValue('hobbies', hobbies);
                    }}
                  />
                </div>

                <div>
                  <label className="label">Interests (comma-separated)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., AI, Sustainability, Music"
                    onChange={(e) => {
                      const interests = e.target.value.split(',').map(i => i.trim()).filter(i => i);
                      setValue('interests', interests);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 6: Personality & Goals */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div>
                  <label className="label">Personality Type</label>
                  <select {...register('personalityTraits.introvertExtrovert')} className="input-field">
                    <option value="">Select...</option>
                    <option value="introvert">Introvert</option>
                    <option value="extrovert">Extrovert</option>
                    <option value="ambivert">Ambivert</option>
                  </select>
                </div>

                <div>
                  <label className="label">Core Values (comma-separated)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., Integrity, Innovation, Community"
                    onChange={(e) => {
                      const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                      setValue('personalityTraits.values', values);
                    }}
                  />
                </div>

                <div>
                  <label className="label">Career Goals (one per line)</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    onChange={(e) => {
                      const goals = e.target.value.split('\n').filter(g => g.trim());
                      setValue('personalityTraits.goals', goals);
                    }}
                  />
                </div>

                <div>
                  <label className="label">Key Strengths (comma-separated)</label>
                  <input
                    type="text"
                    className="input-field"
                    onChange={(e) => {
                      const strengths = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                      setValue('personalityTraits.strengths', strengths);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 7: Additional Details */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <div>
                  <label className="label">Languages Spoken (comma-separated)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., English, Spanish, Mandarin"
                    onChange={(e) => {
                      const languages = e.target.value.split(',').map(l => l.trim()).filter(l => l);
                      setValue('languages', languages);
                    }}
                  />
                </div>

                <div>
                  <label className="label">Travel Experiences (one per line)</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Countries or cities you've visited..."
                    onChange={(e) => {
                      const experiences = e.target.value.split('\n').filter(e => e.trim());
                      setValue('travelExperiences', experiences);
                    }}
                  />
                </div>

                <div>
                  <label className="label">Volunteer Work (one per line)</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    onChange={(e) => {
                      const volunteer = e.target.value.split('\n').filter(v => v.trim());
                      setValue('volunteerWork', volunteer);
                    }}
                  />
                </div>

                <div>
                  <label className="label">Awards & Achievements (comma-separated)</label>
                  <input
                    type="text"
                    className="input-field"
                    onChange={(e) => {
                      const awards = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                      setValue('uniqueAspects.awards', awards);
                    }}
                  />
                </div>

                <div>
                  <label className="label">Side Projects (comma-separated)</label>
                  <input
                    type="text"
                    className="input-field"
                    onChange={(e) => {
                      const projects = e.target.value.split(',').map(p => p.trim()).filter(p => p);
                      setValue('uniqueAspects.sideProjects', projects);
                    }}
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
                    type="url"
                    {...register('linkedinUrl')}
                    className="input-field"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  {errors.linkedinUrl && <p className="error-text">{errors.linkedinUrl.message}</p>}
                  <p className="text-sm text-gray-500 mt-1">
                    This is required to help us find the best referrals for you
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
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

              {currentStep < steps.length ? (
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

