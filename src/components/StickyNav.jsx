"use client";

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  ThumbsUp,
  HelpCircle,
  User,
  Menu,
  X,
  Home as HomeIcon,
  Briefcase,
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

  // Close menu on outside click (mobile)
  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <nav
      ref={navRef}
      className="bg-white shadow-sm py-3 px-4 sticky [top:var(--banner-offset)] z-40"
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-lagoon flex items-center">
          <span className="sm:inline hidden">Home</span>
          <span className="sm:hidden"><HomeIcon className="h-7 w-7" /></span>
        </Link>
        <button
          className="sm:hidden p-2 text-lagoon"
          onClick={toggle}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        {/* Desktop nav */}
        <div className="hidden sm:flex flex-row items-center gap-4 text-base">
          <Link href="/voting" className="flex items-center gap-1 hover:underline">
            <FileText className="h-4 w-4" /> Voting Info
          </Link>
          <Link href="/endorsements" className="flex items-center gap-1 hover:underline">
            <ThumbsUp className="h-4 w-4" /> Endorsements
          </Link>
          <Link href="/qna" className="flex items-center gap-1 hover:underline">
            <HelpCircle className="h-4 w-4" /> Q&amp;A
          </Link>
          <Link href="/board-role" className="flex items-center gap-1 hover:underline" title="Role of a Board Member">
            <Briefcase className="h-4 w-4" />
            <span className="hidden md:inline">Role of a Board Member</span>
            <span className="inline md:hidden">Board Role</span>
          </Link>
          <Link href={{ pathname: '/', hash: 'about' }} className="flex items-center gap-1 hover:underline">
            <User className="h-4 w-4" /> About Doug
          </Link>
        </div>
        {/* Mobile nav dropdown */}
        <div
          className={`sm:hidden absolute left-0 top-full w-full bg-white border-t mt-2 p-4 flex-col gap-4 text-base shadow-lg transition-all duration-200 z-50 ${open ? 'flex' : 'hidden'}`}
        >
          <Link href="/voting" className="flex items-center gap-2 py-2 hover:underline" onClick={() => setOpen(false)}>
            <FileText className="h-5 w-5" /> Voting Info
          </Link>
          <Link href="/endorsements" className="flex items-center gap-2 py-2 hover:underline" onClick={() => setOpen(false)}>
            <ThumbsUp className="h-5 w-5" /> Endorsements
          </Link>
          <Link href="/qna" className="flex items-center gap-2 py-2 hover:underline" onClick={() => setOpen(false)}>
            <HelpCircle className="h-5 w-5" /> Q&amp;A
          </Link>
          <Link href="/board-role" className="flex items-center gap-2 py-2 hover:underline" title="Role of a Board Member" onClick={() => setOpen(false)}>
            <Briefcase className="h-5 w-5" />
            <span>Board Role</span>
          </Link>
          <Link href={{ pathname: '/', hash: 'about' }} className="flex items-center gap-2 py-2 hover:underline" onClick={() => setOpen(false)}>
            <User className="h-5 w-5" /> About Doug
          </Link>
        </div>
      </div>
    </nav>
  );
}
