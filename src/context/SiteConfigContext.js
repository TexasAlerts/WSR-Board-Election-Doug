'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const SiteConfigContext = createContext(null);

export function SiteConfigProvider({ children }) {
  const [donationsEnabled, setDonationsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.ok && data.settings) {
          const val = data.settings.donations_enabled;
          setDonationsEnabled(val === true || val === 'true');
        }
      } catch {
        // Default to false on error
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const refreshConfig = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.ok && data.settings) {
        const val = data.settings.donations_enabled;
        setDonationsEnabled(val === true || val === 'true');
      }
    } catch {
      // Silently fail
    }
  };

  return (
    <SiteConfigContext.Provider value={{ donationsEnabled, loading, refreshConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
}
