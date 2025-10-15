'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Briefcase, User, LogOut, Search, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import JobSearchForm from '@/components/JobSearchForm';
import ReferralResults from '@/components/ReferralResults';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchProfile();
      fetchSearchHistory();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();

      if (data.profile) {
        setProfile(data);
        if (!data.profileCompleted) {
          toast('Please complete your profile to start finding referrals', {
            icon: '📋',
          });
          router.push('/questionnaire');
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchSearchHistory = async () => {
    try {
      const response = await fetch('/api/referrals');
      const data = await response.json();
      setSearchHistory(data.searches || []);
    } catch (error) {
      console.error('Failed to fetch search history:', error);
    }
  };

  if (status === 'loading' || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Referral Finder</h1>
              <p className="text-sm text-gray-600">Welcome back, {session?.user?.name}</p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/questionnaire"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Profile</span>
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold text-gray-900">{searchHistory.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Referrals Found</p>
                <p className="text-2xl font-bold text-gray-900">
                  {searchHistory.reduce((acc, search) => acc + (search.referralMatches?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Profile Status</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile?.profileCompleted ? '✓ Complete' : 'Incomplete'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Search Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Search className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold">Find Referrals for a Job</h2>
              </div>
              <JobSearchForm onSuccess={fetchSearchHistory} />
            </div>
          </div>

          {/* Recent Searches */}
          <div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Recent Searches</h3>
              {searchHistory.length === 0 ? (
                <p className="text-gray-500 text-sm">No searches yet. Start by finding referrals for a job!</p>
              ) : (
                <div className="space-y-3">
                  {searchHistory.slice(0, 5).map((search) => (
                    <Link
                      key={search._id}
                      href={`/search/${search._id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <p className="font-medium text-gray-900 text-sm">{search.jobTitle}</p>
                      <p className="text-xs text-gray-600">{search.company}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {search.referralMatches?.length || 0} referrals found
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

