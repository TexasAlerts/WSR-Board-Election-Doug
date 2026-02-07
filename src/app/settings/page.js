'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
  Bell,
  MessageSquare,
  Vote,
  Lightbulb,
  Save,
  Pencil,
  X,
} from 'lucide-react';
import { logApiError } from '@/lib/clientErrorLogger';
import { useCSRF } from '../../hooks/useCSRF';

const NOTIFICATION_TYPES = [
  { label: 'New Polls', emailKey: 'email_on_new_poll', smsKey: 'sms_on_new_poll' },
  {
    label: 'Comments & Replies',
    emailKey: 'email_on_new_comment',
    smsKey: 'sms_on_comment_activity',
    linkedEmailKeys: ['email_on_new_reply', 'email_on_comment_moderation'],
  },
  { label: 'New Ideas', emailKey: 'email_on_weekly_digest', smsKey: 'sms_on_new_idea' },
  { label: 'Campaign Broadcasts', emailKey: 'email_on_broadcast', smsKey: 'sms_on_broadcast' },
  { label: 'System Messages', emailKey: 'email_on_system', smsKey: 'sms_on_system' },
];

const ACTIVITY_TABS = [
  { key: 'votes', label: 'My Votes', icon: Vote },
  { key: 'ideas', label: 'My Ideas', icon: Lightbulb },
  { key: 'comments', label: 'My Comments', icon: MessageSquare },
];

export default function SettingsPage() {
  const { supporter, isAuthenticated, loading: authLoading, refreshAuth } = useAuth();
  const router = useRouter();
  const { token: csrfToken, refreshToken } = useCSRF();

  // Profile state
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Edit mode toggles
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);

  // Phone state
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [phoneMsg, setPhoneMsg] = useState({ type: '', text: '' });
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Notification prefs state
  const [prefs, setPrefs] = useState(null);
  const [prefsMsg, setPrefsMsg] = useState({ type: '', text: '' });
  const [prefsLoading, setPrefsLoading] = useState(false);

  // Activity state
  const [activeTab, setActiveTab] = useState('votes');
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (supporter) {
      setProfile({
        firstName: supporter.first_name || '',
        lastName: supporter.last_name || '',
        streetAddress: supporter.street_address || '',
        city: supporter.city || '',
        state: supporter.state || '',
        zipCode: supporter.zip_code || '',
      });
      setPhone(supporter.phone || '');
    }
  }, [supporter]);

  // Load notification preferences
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/notifications/preferences')
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setPrefs(d.data);
      })
      .catch((err) => {
        logApiError('/api/notifications/preferences', 'GET', err.status || 500, err.message, { context: 'loadPrefs' });
      });
  }, [isAuthenticated]);

  // Load activity
  const loadActivity = useCallback(async (tab) => {
    setActivityLoading(true);
    try {
      const res = await fetch(`/api/auth/my-activity?type=${tab}&limit=20`);
      const data = await res.json();
      if (data.ok) setActivity(data.data || []);
    } catch (err) {
      await logApiError('/api/auth/my-activity', 'GET', err.status || 500, err.message, { context: 'loadActivity', tab });
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadActivity(activeTab);
  }, [activeTab, isAuthenticated, loadActivity]);

  // Profile save
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setProfileLoading(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      await refreshToken();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      await refreshAuth();
      setEditingProfile(false);
    } catch (err) {
      await logApiError('/api/auth/update-profile', 'PATCH', err.status || 500, err.message, { context: 'profileSave' });
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  // Phone update
  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    setPhoneMsg({ type: '', text: '' });
    setPhoneLoading(true);
    try {
      const res = await fetch('/api/auth/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update phone');
      await refreshToken();
      setShowPhoneVerify(true);
      setPhoneMsg({
        type: 'success',
        text: data.smsSent ? 'Verification code sent to your phone!' : data.message,
      });
    } catch (err) {
      await logApiError('/api/auth/update-phone', 'POST', err.status || 500, err.message, { context: 'phoneUpdate' });
      setPhoneMsg({ type: 'error', text: err.message });
    } finally {
      setPhoneLoading(false);
    }
  };

  // Phone verify
  const handlePhoneVerify = async (e) => {
    e.preventDefault();
    setPhoneMsg({ type: '', text: '' });
    setPhoneLoading(true);
    try {
      const res = await fetch('/api/auth/verify-phone-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ code: smsCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      await refreshToken();
      setShowPhoneVerify(false);
      setEditingPhone(false);
      setSmsCode('');
      await refreshAuth();
      setPhoneMsg({ type: 'success', text: 'Phone number verified successfully! SMS notifications are now available.' });
    } catch (err) {
      await logApiError('/api/auth/verify-phone-update', 'POST', err.status || 500, err.message, { context: 'phoneVerify' });
      setPhoneMsg({ type: 'error', text: err.message });
    } finally {
      setPhoneLoading(false);
    }
  };

  // Notification prefs save
  const handlePrefsSave = async () => {
    setPrefsMsg({ type: '', text: '' });
    setPrefsLoading(true);
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify(prefs),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save preferences');
      await refreshToken();
      setPrefsMsg({ type: 'success', text: 'Notification preferences saved!' });
    } catch (err) {
      await logApiError('/api/notifications/preferences', 'PATCH', err.status || 500, err.message, { context: 'prefsSave' });
      setPrefsMsg({ type: 'error', text: err.message });
    } finally {
      setPrefsLoading(false);
    }
  };

  const togglePref = (key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  // Toggle grouped email keys for Comments & Replies
  const toggleEmailGroup = (type, value) => {
    const updates = { [type.emailKey]: value };
    if (type.linkedEmailKeys) {
      type.linkedEmailKeys.forEach((k) => {
        updates[k] = value;
      });
    }
    setPrefs((prev) => ({ ...prev, ...updates }));
  };

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-navy mx-auto" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const phoneVerified = supporter?.phone_verified;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your profile, phone, and notification preferences</p>
      </div>

      {/* Section 1: Profile */}
      <section className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </h2>
          {!editingProfile && (
            <button
              type="button"
              onClick={() => setEditingProfile(true)}
              className="text-navy text-sm font-medium hover:underline flex items-center gap-1"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}
        </div>

        <StatusMessage msg={profileMsg} />

        {!editingProfile ? (
          /* Display mode */
          <div className="space-y-4">
            <div>
              <span className="form-label flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </span>
              <div className="flex items-center gap-2">
                <p className="text-gray-900">{supporter?.email}</p>
                {supporter?.email_verified_at && (
                  <span className="text-xs text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="form-label">Name</span>
              <p className="text-gray-900">
                {supporter?.first_name} {supporter?.last_name}
              </p>
            </div>
            <div>
              <span className="form-label flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Address
              </span>
              <p className="text-gray-900">{supporter?.street_address}</p>
              <p className="text-gray-900">
                {supporter?.city}, {supporter?.state} {supporter?.zip_code}
              </p>
            </div>
          </div>
        ) : (
          /* Edit mode */
          <form onSubmit={handleProfileSave} className="space-y-4">
            {/* Email (always read-only) */}
            <div>
              <span className="form-label flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </span>
              <div className="flex items-center gap-2">
                <p className="text-gray-900 py-2">{supporter?.email}</p>
                {supporter?.email_verified_at && (
                  <span className="text-xs text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="settings-firstName" className="form-label">
                  First Name
                </label>
                <input
                  id="settings-firstName"
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  required
                  aria-required="true"
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="settings-lastName" className="form-label">
                  Last Name
                </label>
                <input
                  id="settings-lastName"
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  required
                  aria-required="true"
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="settings-address" className="form-label flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Street Address
              </label>
              <input
                id="settings-address"
                type="text"
                value={profile.streetAddress}
                onChange={(e) => setProfile({ ...profile, streetAddress: e.target.value })}
                required
                aria-required="true"
                className="form-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
              <div className="col-span-1 sm:col-span-3">
                <label htmlFor="settings-city" className="form-label">
                  City
                </label>
                <input
                  id="settings-city"
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  required
                  aria-required="true"
                  className="form-input"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="settings-state" className="form-label">
                  State
                </label>
                <input
                  id="settings-state"
                  type="text"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  maxLength={2}
                  className="form-input"
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label htmlFor="settings-zip" className="form-label">
                  ZIP Code
                </label>
                <input
                  id="settings-zip"
                  type="text"
                  value={profile.zipCode}
                  onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={profileLoading}
                className="btn-primary flex items-center gap-2"
              >
                {profileLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingProfile(false);
                  setProfileMsg({ type: '', text: '' });
                  if (supporter) {
                    setProfile({
                      firstName: supporter.first_name || '',
                      lastName: supporter.last_name || '',
                      streetAddress: supporter.street_address || '',
                      city: supporter.city || '',
                      state: supporter.state || '',
                      zipCode: supporter.zip_code || '',
                    });
                  }
                }}
                className="btn-outline flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Section 2: Phone */}
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Cell Phone Number
          </h2>
          {!editingPhone && !showPhoneVerify && (
            <button
              type="button"
              onClick={() => setEditingPhone(true)}
              className="text-navy text-sm font-medium hover:underline flex items-center gap-1"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}
        </div>

        {!phoneVerified && !editingPhone && !showPhoneVerify && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm font-medium">
              Your phone is not verified. Update to a cell phone number and verify it to receive
              text message alerts.
            </p>
          </div>
        )}

        <StatusMessage msg={phoneMsg} />

        {!editingPhone && !showPhoneVerify ? (
          /* Display mode */
          <div>
            <div className="flex items-center gap-2">
              <p className="text-gray-900">{supporter?.phone || 'No phone number on file'}</p>
              {phoneVerified ? (
                <span className="text-xs text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              ) : supporter?.phone ? (
                <span className="text-xs text-yellow-600 flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3 h-3" /> Not Verified
                </span>
              ) : null}
            </div>
          </div>
        ) : showPhoneVerify ? (
          <form onSubmit={handlePhoneVerify} className="space-y-4">
            <div>
              <label htmlFor="settings-sms-code" className="form-label">
                Verification Code
              </label>
              <input
                id="settings-sms-code"
                type="text"
                inputMode="numeric"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="form-input text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                autoComplete="one-time-code"
              />
              <p className="text-xs text-gray-700 mt-1 text-center">
                Enter the 6-digit code sent to your phone
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPhoneVerify(false);
                  setEditingPhone(false);
                  setSmsCode('');
                  setPhoneMsg({ type: '', text: '' });
                }}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={phoneLoading || smsCode.length !== 6}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                {phoneLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Verify Code
              </button>
            </div>
          </form>
        ) : (
          /* Edit mode */
          <form onSubmit={handlePhoneUpdate} className="space-y-4">
            <div>
              <label htmlFor="settings-phone" className="form-label">
                Cell Phone Number
              </label>
              <input
                id="settings-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="form-input"
                placeholder="(972) 555-1234"
                autoComplete="tel"
              />
              <p className="text-xs text-gray-700 mt-1">
                Must be a cell phone that can receive text messages.
              </p>
              <p className="text-xs text-gray-700 mt-2">
                By updating your phone number, you consent to receive SMS verification codes,
                campaign updates, and donation solicitations from Doug Charles for Prosper Town
                Council. Message frequency may vary. Msg &amp; data rates may apply. Reply STOP to
                opt out. Reply HELP for help. Consent is not a condition of purchase or
                registration.{' '}
                <Link href="/privacy" className="text-navy underline">
                  Privacy Policy
                </Link>{' '}
                &{' '}
                <Link href="/terms" className="text-navy underline">
                  Terms
                </Link>
                .
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={phoneLoading}
                className="btn-secondary flex items-center gap-2"
              >
                {phoneLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
                Update & Verify Phone
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingPhone(false);
                  setPhoneMsg({ type: '', text: '' });
                  setPhone(supporter?.phone || '');
                }}
                className="btn-outline flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Section 3: Notification Preferences */}
      <section className="card">
        <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Choose how you want to be notified for each type of activity.
        </p>

        <StatusMessage msg={prefsMsg} />

        {prefs ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center text-sm font-semibold text-gray-700 border-b pb-2">
              <span>Type</span>
              <span className="w-16 text-center">Email</span>
              <span className="w-16 text-center">Text</span>
            </div>

            {NOTIFICATION_TYPES.map((type) => {
              const emailOn = type.linkedEmailKeys
                ? prefs[type.emailKey] !== false
                : prefs[type.emailKey] !== false;
              const smsOn = prefs[type.smsKey] !== false;

              return (
                <div
                  key={type.label}
                  className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-2 border-b border-gray-100"
                >
                  <span className="text-sm font-medium text-gray-700">{type.label}</span>
                  <div className="w-16 flex justify-center">
                    <ToggleSwitch
                      checked={emailOn}
                      onChange={(v) =>
                        type.linkedEmailKeys
                          ? toggleEmailGroup(type, v)
                          : togglePref(type.emailKey, v)
                      }
                      label={`${type.label} email notifications`}
                    />
                  </div>
                  <div className="w-16 flex justify-center">
                    {phoneVerified ? (
                      <ToggleSwitch
                        checked={smsOn}
                        onChange={(v) => togglePref(type.smsKey, v)}
                        label={`${type.label} text notifications`}
                      />
                    ) : (
                      <span
                        className="text-xs text-gray-700"
                        title="Verify your phone to enable text notifications"
                      >
                        —
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {!phoneVerified && (
              <p className="text-xs text-gray-700 mt-2">
                Text message notifications require a verified cell phone number.{' '}
                <button
                  type="button"
                  onClick={() => document.getElementById('settings-phone')?.focus()}
                  className="text-navy underline hover:text-navy-dark"
                >
                  Update your phone above
                </button>{' '}
                to enable them.
              </p>
            )}

            <button
              onClick={handlePrefsSave}
              disabled={prefsLoading}
              className="btn-primary flex items-center gap-2 mt-4"
            >
              {prefsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Preferences
            </button>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-700">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        )}
      </section>

      {/* Section 4: My Activity */}
      <section className="card">
        <h2 className="text-xl font-bold text-navy mb-4">My Activity</h2>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
          {ACTIVITY_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                aria-pressed={activeTab === tab.key}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Activity content */}
        {activityLoading ? (
          <div className="text-center py-8" role="status" aria-live="polite">
            <Loader2 className="w-6 h-6 animate-spin text-navy mx-auto" />
          </div>
        ) : activity.length === 0 ? (
          <div className="text-center py-8 text-gray-700">
            <p>No {activeTab} yet.</p>
            {activeTab === 'votes' && (
              <Link href="/polls" className="text-navy underline text-sm mt-2 inline-block">
                View polls
              </Link>
            )}
            {activeTab === 'ideas' && (
              <Link href="/ideas" className="text-navy underline text-sm mt-2 inline-block">
                Submit an idea
              </Link>
            )}
            {activeTab === 'comments' && (
              <Link href="/polls" className="text-navy underline text-sm mt-2 inline-block">
                Join a discussion
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {activity.map((item) => (
              <ActivityItem key={item.id} item={item} type={activeTab} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusMessage({ msg }) {
  if (!msg.text) return null;
  const isError = msg.type === 'error';
  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live="polite"
      className={`p-4 rounded-lg flex items-start gap-3 mb-4 ${isError ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}
    >
      {isError ? (
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      ) : (
        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
      )}
      <p className={`text-sm ${isError ? 'text-red-700' : 'text-green-700'}`}>{msg.text}</p>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors min-w-[44px] min-h-[44px] justify-center ${checked ? 'bg-navy' : 'bg-gray-300'}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform absolute ${checked ? 'translate-x-2.5' : '-translate-x-2.5'}`}
      />
    </button>
  );
}

function ActivityItem({ item, type }) {
  if (type === 'votes') {
    const poll = item.polls;
    return (
      <Link
        href="/polls"
        className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <p className="font-medium text-navy text-sm">{poll?.title || 'Poll'}</p>
        <p className="text-xs text-gray-700 mt-1">
          Voted {new Date(item.created_at).toLocaleDateString()}
          {item.other_text && <span> — &quot;{item.other_text}&quot;</span>}
        </p>
      </Link>
    );
  }

  if (type === 'ideas') {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      under_review: 'bg-blue-100 text-blue-800',
      planned: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
    };
    return (
      <Link
        href="/ideas"
        className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-navy text-sm">{item.title}</p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${statusColors[item.status] || 'bg-gray-100 text-gray-600'}`}
          >
            {item.status}
          </span>
        </div>
        <p className="text-xs text-gray-700 mt-1">
          Submitted {new Date(item.created_at).toLocaleDateString()}
          {item.upvotes > 0 && (
            <span>
              {' '}
              — {item.upvotes} upvote{item.upvotes !== 1 ? 's' : ''}
            </span>
          )}
        </p>
      </Link>
    );
  }

  if (type === 'comments') {
    const target = item.polls?.title || item.ideas?.title || 'Discussion';
    const isReply = !!item.parent_id;
    return (
      <Link
        href={item.poll_id ? '/polls' : '/ideas'}
        className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <p className="text-xs text-gray-700 mb-1">
          {isReply ? 'Reply' : 'Comment'} on <span className="font-medium text-navy">{target}</span>
        </p>
        <p className="text-sm text-gray-700 line-clamp-2">{item.content}</p>
        <p className="text-xs text-gray-700 mt-1">
          {new Date(item.created_at).toLocaleDateString()}
          <span
            className={`ml-2 ${item.status === 'approved' ? 'text-green-600' : item.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}
          >
            {item.status}
          </span>
        </p>
      </Link>
    );
  }

  return null;
}
