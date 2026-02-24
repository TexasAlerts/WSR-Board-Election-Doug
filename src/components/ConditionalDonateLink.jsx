'use client';

import Link from 'next/link';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function ConditionalDonateLink({ className, children }) {
  const { donationsEnabled } = useSiteConfig();

  if (!donationsEnabled) return null;

  return (
    <Link href="/donate" className={className}>
      {children}
    </Link>
  );
}
