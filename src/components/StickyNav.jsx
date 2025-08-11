"use client";

import { useRef, useEffect } from 'react';
import Link from 'next/link';

export default function StickyNav() {
  const navRef = useRef(null);

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;
    const banner = navEl.previousElementSibling;
    if (!banner) return;

    const updateOffset = () => {
      navEl.style.setProperty('--banner-offset', `${banner.offsetHeight}px`);
    };
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  return (
    <nav
      ref={navRef}
      className="bg-white shadow-sm py-3 px-4 sticky [top:var(--banner-offset)] z-40"
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-lagoon">
          Home
        </Link>
        <div className="flex gap-4 text-sm sm:text-base">
          <Link href="/voting" className="hover:underline">
            Voting Info
          </Link>
          <Link
            href={{ pathname: '/', hash: 'about' }}
            className="hover:underline"
          >
            About Doug
          </Link>
        </div>
      </div>
    </nav>
  );
}
