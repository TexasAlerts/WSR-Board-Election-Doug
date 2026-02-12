'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

function VerifySubmissionContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [linkedCounts, setLinkedCounts] = useState({ interests: 0, questions: 0 });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus('error');
        setErrorMessage('No verification token provided.');
        return;
      }

      try {
        const res = await fetch('/api/verified-voters/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (data.ok) {
          setLinkedCounts(data.linked || { interests: 0, questions: 0 });
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(data.error || 'Verification failed. Please try again.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {status === 'verifying' && (
          <div className="card text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prosper-blue mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-navy mb-2">Verifying your email...</h1>
            <p className="text-gray-600">Please wait while we confirm your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-navy mb-4">Email Verified!</h1>
            <p className="text-gray-700 mb-6">
              Thank you for verifying your email address. You'll now receive notifications about:
            </p>

            {(linkedCounts.interests > 0 || linkedCounts.questions > 0) && (
              <div className="bg-prosper-blue-light bg-opacity-10 rounded-lg p-4 mb-6 text-left">
                <h2 className="font-semibold text-navy mb-2">Your Linked Submissions:</h2>
                {linkedCounts.interests > 0 && (
                  <p className="text-gray-700 mb-1">
                    ✓ {linkedCounts.interests} volunteer interest
                    {linkedCounts.interests > 1 ? 's' : ''}
                  </p>
                )}
                {linkedCounts.questions > 0 && (
                  <p className="text-gray-700">
                    ✓ {linkedCounts.questions} question{linkedCounts.questions > 1 ? 's' : ''}{' '}
                    (you'll be notified when answered)
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full btn-primary text-center"
              >
                Return to Homepage
              </Link>
              <Link
                href="/get-involved"
                className="block w-full btn-outline text-center"
              >
                Get More Involved
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="card text-center">
            <div className="w-16 h-16 bg-prosper-red bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-prosper-red"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-prosper-red mb-4">Verification Failed</h1>
            <p className="text-gray-700 mb-2">{errorMessage}</p>
            <p className="text-gray-600 text-sm mb-6">
              Verification links expire after 24 hours. Please submit your interest or question
              again to receive a new verification link.
            </p>

            <div className="space-y-3">
              <Link
                href="/get-involved"
                className="block w-full btn-primary text-center"
              >
                Get Involved
              </Link>
              <Link
                href="/qna"
                className="block w-full btn-outline text-center"
              >
                Ask a Question
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifySubmissionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prosper-blue"></div>
        </div>
      }
    >
      <VerifySubmissionContent />
    </Suspense>
  );
}
