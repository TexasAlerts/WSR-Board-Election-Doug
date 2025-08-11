"use client";

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ThumbsUp, HelpCircle, User, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function StickyNav() {
  const navRef = useRef(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const toggle = () => setOpen((o) => !o);
  const linkProps = open ? { onClick: () => setOpen(false) } : {};

  return (
    <nav
      ref={navRef}
      className="bg-white shadow-sm py-3 px-4 sticky [top:var(--banner-offset)] z-40"
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-lagoon" {...linkProps}>
          Home
        </Link>
        <button
          className="sm:hidden p-2 text-lagoon"
          onClick={toggle}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <div
          className={`${open ? 'flex' : 'hidden'} flex-col sm:flex sm:flex-row sm:items-center gap-4 text-sm sm:text-base`}
        >
          <Link href="/voting" className="flex items-center gap-1 hover:underline" {...linkProps}>
            <FileText className="h-4 w-4" />
            Voting Info
          </Link>
          <Link href="/endorsements" className="flex items-center gap-1 hover:underline" {...linkProps}>
            <ThumbsUp className="h-4 w-4" />
            Endorsements
          </Link>
          <Link href="/qna" className="flex items-center gap-1 hover:underline" {...linkProps}>
            <HelpCircle className="h-4 w-4" />
            Q&amp;A
          </Link>
          <Link
            href={{ pathname: '/', hash: 'about' }}
            className="flex items-center gap-1 hover:underline"
            {...linkProps}
          >
            <User className="h-4 w-4" />
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}

