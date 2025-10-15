'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReferralMatch {
  name: string;
  linkedinUrl: string;
  relevance: string;
  commonalities: string[];
  suggestedMessage: string;
  connectionDegree?: string;
}

interface ReferralResultsProps {
  results: {
    matches: ReferralMatch[];
    searchId: string;
  };
}

export default function ReferralResults({ results }: ReferralResultsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Message copied to clipboard!');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-primary-900">
              Found {results.matches.length} potential referrers!
            </h3>
            <p className="text-sm text-primary-700 mt-1">
              Review each profile and copy the personalized message to send via LinkedIn.
              <strong> Remember: You must send messages manually - do not automate this.</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {results.matches.map((match, index) => (
          <div key={index} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{match.name}</h4>
                    {match.connectionDegree && (
                      <span className="text-xs text-gray-500">{match.connectionDegree}</span>
                    )}
                  </div>
                </div>
              </div>

              <a
                href={match.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View Profile
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Why they're relevant:</p>
                <p className="text-sm text-gray-600">{match.relevance}</p>
              </div>

              {match.commonalities && match.commonalities.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    What you have in common:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {match.commonalities.map((commonality, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {commonality}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Suggested message:</p>
                  <button
                    onClick={() => copyToClipboard(match.suggestedMessage, index)}
                    className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {match.suggestedMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> These messages are suggestions. Feel free to personalize them further
          before sending. Always be genuine and respectful in your outreach.
        </p>
      </div>
    </div>
  );
}

