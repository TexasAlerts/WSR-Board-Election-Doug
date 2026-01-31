'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Phone, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [step, setStep] = useState('loading'); // loading, password, sms, success, error
  const [supporter, setSupporter] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStep('error');
      setError('No verification token provided.');
      return;
    }

    // Validate token
    fetch(`/api/auth/verify?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setSupporter(data.supporter);
          if (data.supporter.status === 'pending_phone') {
            setStep('sms');
          } else {
            setStep('password');
          }
        } else {
          setStep('error');
          setError(data.error || 'Invalid verification link');
        }
      })
      .catch(() => {
        setStep('error');
        setError('Failed to validate verification link');
      });
  }, [token]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      if (data.requiresPhoneVerification) {
        setSupporter({ ...supporter, id: data.supporterId });
        setStep('sms');
      } else {
        setStep('success');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSmsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supporterId: supporter.id, code: smsCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setStep('success');
      // Redirect after short delay
      setTimeout(() => {
        router.push('/polls');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPhone = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/skip-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supporterId: supporter.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to skip verification');
      }

      setStep('success');
      setTimeout(() => {
        router.push('/polls');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendSmsCode = async () => {
    setResending(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-sms-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supporterId: supporter.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      setError(''); // Clear any previous errors
      alert('New code sent!');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  if (step === 'loading') {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-navy mx-auto mb-4" />
        <p className="text-gray-600">Validating verification link...</p>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-800 mb-2">Verification Failed</h1>
          <p className="text-red-700 mb-6">{error}</p>
          <Link
            href="/auth/register"
            className="inline-block bg-navy text-white px-6 py-2 rounded-lg hover:bg-navy/90"
          >
            Register Again
          </Link>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-800 mb-2">Welcome Aboard!</h1>
          <p className="text-green-700 mb-4">
            Your account has been verified. You&apos;re now an official supporter!
          </p>
          <p className="text-green-600 text-sm mb-6">Redirecting to polls...</p>
          <Link
            href="/polls"
            className="inline-block bg-prosper-red text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            View Polls Now
          </Link>
        </div>
      </div>
    );
  }

  if (step === 'password') {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Create Your Password</h1>
          <p className="text-gray-600">
            Welcome, {supporter?.first_name}! Set a secure password for your account.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {error && (
            <div role="alert" aria-live="polite" className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="verify-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input
                id="verify-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                placeholder="Enter password"
                autoComplete="new-password"
                aria-describedby="verify-password-hint"
              />
            </div>
            <p id="verify-password-hint" className="text-xs text-gray-500 mt-1">
              At least 8 characters with uppercase, lowercase, and a number
            </p>
          </div>

          <div>
            <label htmlFor="verify-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input
                id="verify-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                placeholder="Confirm password"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-prosper-red text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Password...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </form>
      </div>
    );
  }

  if (step === 'sms') {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Verify Your Phone</h1>
          <p className="text-gray-600">
            We&apos;ve sent a 6-digit code to your phone. Enter it below.
          </p>
        </div>

        <form onSubmit={handleSmsSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {error && (
            <div role="alert" aria-live="polite" className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="sms-verification-code" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input
                id="sms-verification-code"
                type="text"
                inputMode="numeric"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                pattern="\d{6}"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                autoComplete="one-time-code"
                aria-describedby="sms-code-hint"
              />
            </div>
            <p id="sms-code-hint" className="text-xs text-gray-500 mt-1 text-center">
              Code expires in 10 minutes
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || smsCode.length !== 6}
            className="w-full bg-prosper-red text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Phone'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={resendSmsCode}
              disabled={resending}
              className="text-navy hover:underline text-sm flex items-center justify-center gap-2 mx-auto"
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend Code
                </>
              )}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Don&apos;t have a cell phone or can&apos;t receive texts?
            </p>
            <button
              type="button"
              onClick={handleSkipPhone}
              disabled={loading}
              className="text-sm text-gray-500 hover:text-navy underline"
            >
              Skip phone verification for now
            </button>
            <p className="text-xs text-gray-400 mt-1">
              You can add a cell phone later in your account settings.
            </p>
          </div>
        </form>
      </div>
    );
  }

  return null;
}

function VerifyLoading() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <Loader2 className="w-12 h-12 animate-spin text-navy mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyContent />
    </Suspense>
  );
}
