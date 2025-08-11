"use client";

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Home,
  FileText,
  ThumbsUp,
  HelpCircle,
  User,
  Menu,
  X,
} from 'lucide-react';

export default function StickyNav() {
  const navRef = useRef(null);
  const [open, setOpen] = useState(false);

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

  const toggle = () => setOpen((o) => !o);

  return (
    <nav
      ref={navRef}
      className="bg-white shadow-sm py-3 px-4 sticky [top:var(--banner-offset)] z-40"
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center relative">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-lagoon">
          <Home className="h-6 w-6" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <button
          className="sm:hidden p-2 text-lagoon"
          onClick={toggle}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <div
          className={`${open ? 'flex' : 'hidden'} absolute left-0 top-full w-full bg-white border-t mt-2 p-4 flex-col sm:static sm:w-auto sm:bg-transparent sm:border-0 sm:mt-0 sm:p-0 sm:flex sm:flex-row sm:items-center gap-4 text-sm sm:text-base`}
        >
          <Link href="/voting" className="flex items-center gap-1 hover:underline">
            <FileText className="h-4 w-4" />
            Voting Info
          </Link>
          <Link href="/endorsements" className="flex items-center gap-1 hover:underline">
            <ThumbsUp className="h-4 w-4" />
            Endorsements
          </Link>
          <Link href="/qna" className="flex items-center gap-1 hover:underline">
            <HelpCircle className="h-4 w-4" />
            Q&amp;A
          </Link>
          <Link
            href={{ pathname: '/', hash: 'about' }}
            className="flex items-center gap-1 hover:underline"
          >
            <User className="h-4 w-4" />
            About Doug
          </Link>
        </div>
      </div>
    </nav>
  );
}
