'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ReferralResults from '@/components/ReferralResults';

export default function SearchDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [search, setSearch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSearchDetails();
  }, [params.id]);

  const fetchSearchDetails = async () => {
    try {
      const response = await fetch(`/api/referrals/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setSearch(data.search);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch search:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!search) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="card mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{search.jobTitle}</h1>
          <p className="text-lg text-gray-600 mb-4">{search.company}</p>
          {search.jobUrl && (
            <a
              href={search.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              View original job posting →
            </a>
          )}
        </div>

        <ReferralResults
          results={{
            matches: search.referralMatches,
            searchId: search._id,
          }}
        />
      </div>
    </div>
  );
}

