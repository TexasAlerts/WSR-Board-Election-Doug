'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Phone, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: 'Prosper',
    state: 'TX',
    zipCode: '',
    emailConsent: true,
    smsConsent: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-800 mb-2">Check Your Email!</h1>
          <p className="text-green-700 mb-4">
            We&apos;ve sent a verification link to <strong>{formData.email}</strong>.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm font-medium">
              ⚠️ <strong>Check your spam/junk folder!</strong> Verification emails sometimes get filtered. If you don&apos;t see it in your inbox, look in your junk or spam folder.
            </p>
          </div>
          <p className="text-green-600 text-sm">
            Click the link in your email to verify your address and create your password.
            The link expires in 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Become a Supporter</h1>
        <p className="text-gray-600">
          Join our community to vote on polls, share ideas, and stay informed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        {error && (
          <div role="alert" aria-live="polite" className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="reg-firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input
                id="reg-firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                placeholder="John"
                autoComplete="given-name"
              />
            </div>
          </div>
          <div>
            <label htmlFor="reg-lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              id="reg-lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
              placeholder="Doe"
              autoComplete="family-name"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              id="reg-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
              placeholder="john@example.com"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-700 mb-1">
            Cell Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              id="reg-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
              placeholder="(972) 555-1234"
              autoComplete="tel"
              aria-describedby="phone-verification-hint"
            />
          </div>
          <p id="phone-verification-hint" className="text-xs text-gray-500 mt-1">
            Please provide a cell phone that can receive text messages for verification.
          </p>
        </div>

        {/* Address */}
        <fieldset className="space-y-4">
          <legend className="sr-only">Address</legend>
          <div>
            <label htmlFor="reg-streetAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input
                id="reg-streetAddress"
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                placeholder="123 Main Street"
                autoComplete="street-address"
              />
            </div>
          </div>
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-3">
              <label htmlFor="reg-city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                id="reg-city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                autoComplete="address-level2"
              />
            </div>
            <div className="col-span-1">
              <label htmlFor="reg-state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                id="reg-state"
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                maxLength={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                autoComplete="address-level1"
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="reg-zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                id="reg-zipCode"
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                placeholder="75078"
                autoComplete="postal-code"
              />
            </div>
          </div>
        </fieldset>

        {/* Consent */}
        <fieldset className="space-y-3 pt-4 border-t">
          <legend className="text-sm font-medium text-gray-700">Communication Preferences</legend>
          <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              name="emailConsent"
              checked={formData.emailConsent}
              onChange={handleChange}
              className="mt-0.5 w-5 h-5 min-w-[20px] text-navy rounded focus:ring-navy focus:ring-2"
            />
            <span className="text-sm text-gray-600">
              I agree to receive campaign updates and news via email
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              name="smsConsent"
              checked={formData.smsConsent}
              onChange={handleChange}
              className="mt-0.5 w-5 h-5 min-w-[20px] text-navy rounded focus:ring-navy focus:ring-2"
            />
            <span className="text-sm text-gray-600">
              I agree to receive text message alerts (standard rates may apply)
            </span>
          </label>
        </fieldset>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-prosper-red text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-navy font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
