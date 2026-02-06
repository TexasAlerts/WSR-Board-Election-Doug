'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyVoterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-navy">Loading...</h1>
          </div>
        </div>
      }
    >
      <VerifyVoterContent />
    </Suspense>
  );
}

function VerifyVoterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [error, setError] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    fetch('/api/verified-voters/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setStatus('success');
          setTimeout(() => router.push('/polls'), 3000);
        } else if (data.expired) {
          setStatus('expired');
          setError(data.error);
        } else {
          setStatus('error');
          setError(data.error || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setError('An unexpected error occurred.');
      });
  }, [token, router]);

  async function handleResend() {
    if (!resendEmail) return;
    setResending(true);
    try {
      const res = await fetch('/api/verified-voters/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus('error');
        setError('A new verification link has been sent to your email.');
      }
    } catch {
      setError('Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-navy">Verifying your email...</h1>
            <p className="text-gray-700 mt-2">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <div aria-live="polite">
            <div className="text-green-500 text-5xl mb-4">&#10003;</div>
            <h1 className="text-xl font-semibold text-navy">Email Verified!</h1>
            <p className="text-gray-600 mt-2">
              Your email has been verified. You can now vote on community polls.
            </p>
            <p className="text-gray-700 text-sm mt-4">Redirecting to polls...</p>
          </div>
        )}

        {status === 'expired' && (
          <>
            <div className="text-yellow-500 text-5xl mb-4">&#9888;</div>
            <h1 className="text-xl font-semibold text-navy">Link Expired</h1>
            <p className="text-gray-600 mt-2">{error}</p>
            <div className="mt-6">
              <label htmlFor="resend-email" className="sr-only">
                Email address
              </label>
              <input
                id="resend-email"
                type="email"
                placeholder="Enter your email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
              />
              <button
                onClick={handleResend}
                disabled={resending || !resendEmail}
                className="w-full bg-prosper-red text-white py-2 px-4 rounded-md hover:bg-red-dark disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          </>
        )}

        {status === 'no-token' && (
          <>
            <div className="text-navy text-5xl mb-4">&#9993;</div>
            <h1 className="text-xl font-semibold text-navy">Email Verification</h1>
            <p className="text-gray-600 mt-2">
              To vote on community polls, you need to verify your email address. Visit the{' '}
              <Link href="/polls" className="text-navy font-medium hover:underline">
                Polls page
              </Link>{' '}
              and click on a poll to start the verification process.
            </p>
          </>
        )}

        {status === 'error' && token && (
          <>
            <div className="text-red-500 text-5xl mb-4">&#10007;</div>
            <h1 className="text-xl font-semibold text-navy">Verification Failed</h1>
            <p className="text-gray-600 mt-2">{error}</p>
          </>
        )}
      </div>
    </div>
  );
}
