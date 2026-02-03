'use client';

import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, AlertCircle, CheckCircle, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password requirements
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isValidPassword = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  useEffect(() => {
    // Validate token on mount
    async function validateToken() {
      if (!token) {
        setTokenError('No reset token provided. Please request a new password reset.');
        setValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          setTokenError(data.error || 'Invalid or expired reset link');
        }
      } catch (err) {
        setTokenError('Failed to validate reset link');
      } finally {
        setValidating(false);
      }
    }

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidPassword) {
      setError('Password does not meet requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="space-y-0">
        <section className="hero-pattern hero-gradient text-center py-12 md:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-navy mb-4">Reset Password</h1>
        </section>
        <section className="py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <Loader2 className="w-8 h-8 animate-spin text-navy mx-auto" />
            <p className="text-gray-600 mt-4">Validating reset link...</p>
          </div>
        </section>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="space-y-0">
        <section className="hero-pattern hero-gradient text-center py-12 md:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-navy mb-4">Reset Password</h1>
        </section>
        <section className="py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-navy mb-2">Invalid Reset Link</h2>
              <p className="text-gray-600 mb-6">{tokenError}</p>
              <Link
                href="/auth/forgot-password"
                className="inline-block bg-prosper-red text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-0">
        <section className="hero-pattern hero-gradient text-center py-12 md:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-navy mb-4">Reset Password</h1>
        </section>
        <section className="py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-navy mb-2">Password Reset Successfully</h2>
              <p className="text-gray-600 mb-6">
                Your password has been updated. Redirecting to sign in...
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-navy font-medium hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Go to Sign In
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="hero-pattern hero-gradient text-center py-12 md:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-navy/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-prosper-red/5 rounded-full blur-3xl"></div>
        </div>
        <Image
          src="/campaign-logo.webp"
          alt=""
          aria-hidden="true"
          width={96}
          height={64}
          className="absolute top-4 right-4 w-20 sm:w-28 md:w-32 lg:w-36 h-auto opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy mb-4 animate-fade-in-down">
            Create New Password
          </h1>
          <p className="text-lg text-gray-600 animate-fade-in">Enter your new password below</p>
        </div>
      </section>

      <section className="py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertCircle
                  className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="reset-new-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="reset-new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  aria-describedby="password-requirements"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password requirements */}
            <div id="password-requirements" className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Password must have:</p>
              <ul className="space-y-1 text-sm">
                <li
                  className={`flex items-center gap-2 ${hasMinLength ? 'text-green-600' : 'text-gray-500'}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${hasMinLength ? 'bg-green-100' : 'bg-gray-200'}`}
                  >
                    {hasMinLength ? '✓' : '○'}
                  </span>
                  At least 8 characters
                </li>
                <li
                  className={`flex items-center gap-2 ${hasUppercase ? 'text-green-600' : 'text-gray-500'}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${hasUppercase ? 'bg-green-100' : 'bg-gray-200'}`}
                  >
                    {hasUppercase ? '✓' : '○'}
                  </span>
                  One uppercase letter
                </li>
                <li
                  className={`flex items-center gap-2 ${hasLowercase ? 'text-green-600' : 'text-gray-500'}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${hasLowercase ? 'bg-green-100' : 'bg-gray-200'}`}
                  >
                    {hasLowercase ? '✓' : '○'}
                  </span>
                  One lowercase letter
                </li>
                <li
                  className={`flex items-center gap-2 ${hasNumber ? 'text-green-600' : 'text-gray-500'}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${hasNumber ? 'bg-green-100' : 'bg-gray-200'}`}
                  >
                    {hasNumber ? '✓' : '○'}
                  </span>
                  One number
                </li>
              </ul>
            </div>

            <div>
              <label
                htmlFor="reset-confirm-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="reset-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy focus:border-navy ${
                    confirmPassword && !passwordsMatch ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  aria-describedby={
                    confirmPassword && !passwordsMatch ? 'password-mismatch-error' : undefined
                  }
                  aria-invalid={confirmPassword && !passwordsMatch ? 'true' : undefined}
                />
              </div>
              {confirmPassword && !passwordsMatch && (
                <p id="password-mismatch-error" role="alert" className="text-red-500 text-sm mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isValidPassword || !passwordsMatch}
              className="w-full bg-prosper-red text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
