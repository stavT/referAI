'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Loader2, Link as LinkIcon, FileText } from 'lucide-react';
import ReferralResults from './ReferralResults';

interface JobSearchFormData {
  jobUrl?: string;
  jobTitle?: string;
  company?: string;
  jobDescription?: string;
}

interface JobSearchFormProps {
  onSuccess?: () => void;
}

export default function JobSearchForm({ onSuccess }: JobSearchFormProps) {
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [isFindingReferrals, setIsFindingReferrals] = useState(false);
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [referralResults, setReferralResults] = useState<any>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<JobSearchFormData>();

  const jobUrl = watch('jobUrl');

  const handleScrapeUrl = async () => {
    if (!jobUrl) {
      toast.error('Please enter a job URL');
      return;
    }

    setIsScrapingUrl(true);

    try {
      const response = await fetch('/api/jobs/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to scrape job details');
        setUseManualEntry(true);
        return;
      }

      setValue('jobTitle', data.job.title);
      setValue('company', data.job.company);
      setValue('jobDescription', data.job.description);
      toast.success('Job details loaded!');
    } catch (error) {
      toast.error('Failed to load job details. Please enter manually.');
      setUseManualEntry(true);
    } finally {
      setIsScrapingUrl(false);
    }
  };

  const onSubmit = async (data: JobSearchFormData) => {
    if (!data.jobTitle || !data.company || !data.jobDescription) {
      toast.error('Please fill in all job details');
      return;
    }

    setIsFindingReferrals(true);

    try {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: data.jobTitle,
          company: data.company,
          jobDescription: data.jobDescription,
          jobUrl: data.jobUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to find referrals');
        return;
      }

      setReferralResults(result);
      toast.success(`Found ${result.matches.length} potential referrers!`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to find referrals');
    } finally {
      setIsFindingReferrals(false);
    }
  };

  if (referralResults) {
    return (
      <div>
        <button
          onClick={() => setReferralResults(null)}
          className="mb-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          ← Search for another job
        </button>
        <ReferralResults results={referralResults} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* URL Input with Scrape Button */}
      <div>
        <label className="label flex items-center gap-2">
          <LinkIcon className="w-4 h-4" />
          Job URL (LinkedIn, Indeed, etc.)
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            {...register('jobUrl')}
            className="input-field"
            placeholder="https://linkedin.com/jobs/view/..."
            disabled={useManualEntry}
          />
          <button
            type="button"
            onClick={handleScrapeUrl}
            disabled={isScrapingUrl || useManualEntry || !jobUrl}
            className="btn-primary whitespace-nowrap"
          >
            {isScrapingUrl ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Load Job'
            )}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setUseManualEntry(!useManualEntry)}
          className="text-sm text-primary-600 hover:text-primary-700 mt-2"
        >
          {useManualEntry ? 'Use URL instead' : 'Enter details manually'}
        </button>
      </div>

      {/* Manual Entry Fields */}
      {(useManualEntry || watch('jobTitle')) && (
        <>
          <div>
            <label className="label">Job Title *</label>
            <input
              type="text"
              {...register('jobTitle', { required: 'Job title is required' })}
              className="input-field"
              placeholder="e.g., Senior Software Engineer"
            />
            {errors.jobTitle && <p className="error-text">{errors.jobTitle.message}</p>}
          </div>

          <div>
            <label className="label">Company *</label>
            <input
              type="text"
              {...register('company', { required: 'Company is required' })}
              className="input-field"
              placeholder="e.g., Google"
            />
            {errors.company && <p className="error-text">{errors.company.message}</p>}
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Job Description *
            </label>
            <textarea
              {...register('jobDescription', { required: 'Job description is required' })}
              className="input-field"
              rows={6}
              placeholder="Paste the job description here..."
            />
            {errors.jobDescription && <p className="error-text">{errors.jobDescription.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isFindingReferrals}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {isFindingReferrals ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Finding referrals...
              </>
            ) : (
              'Find Referrals'
            )}
          </button>
        </>
      )}
    </form>
  );
}

