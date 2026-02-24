'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function SettingsTab({ csrfToken }) {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.ok) {
        setSettings(data.data || []);
      }
    } catch {
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function toggleSetting(settingKey, currentValue) {
    setSaving(true);
    setMessage('');

    const newValue = !(currentValue === true || currentValue === 'true');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          setting_key: settingKey,
          setting_value: newValue,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setMessage('Setting updated successfully');
        await fetchSettings();
      } else {
        setMessage(data.error || 'Failed to update setting');
      }
    } catch {
      setMessage('Failed to update setting');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-navy mb-6">Site Settings</h2>

      {message && (
        <div
          className={`p-3 rounded-lg mb-4 ${
            message.includes('success')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <div className="space-y-4">
        {settings.map((setting) => {
          const isEnabled = setting.setting_value === true || setting.setting_value === 'true';

          return (
            <div
              key={setting.id}
              className="card flex items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-semibold text-navy">
                  {setting.setting_key === 'donations_enabled'
                    ? 'Donations Enabled'
                    : setting.setting_key}
                </h3>
                <p className="text-sm text-gray-600">
                  {setting.description || 'No description'}
                </p>
                {setting.updated_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated: {new Date(setting.updated_at).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => toggleSetting(setting.setting_key, setting.setting_value)}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2 ${
                  isEnabled ? 'bg-navy' : 'bg-gray-300'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                role="switch"
                aria-checked={isEnabled}
                aria-label={`Toggle ${setting.setting_key}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
