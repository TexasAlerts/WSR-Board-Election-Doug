"use client";

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  Home as HomeIcon,
  User,
  LogOut,
  Settings,
} from 'lucide-react';

export default function StickyNav() {
  const navRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { supporter, isAuthenticated, isAdmin, logout, loading } = useAuth();

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
    if (!open && !userMenuOpen) return;
    function handle(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false);
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, userMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setOpen(false);
  };

  return (
    <nav
      ref={navRef}
      className="bg-white border-b border-gray-100 py-4 px-4 sticky [top:var(--banner-offset)] z-40"
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-navy flex items-center">
          <span className="sm:inline hidden">Home</span>
          <span className="sm:hidden"><HomeIcon className="h-7 w-7" /></span>
        </Link>
        <button
          className="sm:hidden p-2 text-navy"
          onClick={toggle}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        {/* Desktop nav */}
        <div className="hidden sm:flex flex-row items-center gap-6 text-sm font-medium">
          <Link href="/priorities" className="text-gray-600 hover:text-navy transition-colors">
            Priorities
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-navy transition-colors">
            About
          </Link>
          <Link href="/why" className="text-gray-600 hover:text-navy transition-colors">
            Why I'm Running
          </Link>
          <Link href="/polls" className="text-gray-600 hover:text-navy transition-colors">
            Polls
          </Link>
          <Link href="/ideas" className="text-gray-600 hover:text-navy transition-colors">
            Ideas
          </Link>
          <Link href="/qna" className="text-gray-600 hover:text-navy transition-colors">
            Q&A
          </Link>
          <Link href="/endorsements" className="text-gray-600 hover:text-navy transition-colors">
            Endorsements
          </Link>
          <Link href="/get-involved" className="text-gray-600 hover:text-navy transition-colors">
            Get Involved
          </Link>

          {/* Auth section */}
          {!loading && (
            isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-gray-600 hover:text-navy transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>{supporter?.firstName}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="text-gray-600 hover:text-navy transition-colors">
                Sign In
              </Link>
            )
          )}

          <Link href="/donate" className="bg-prosper-red text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-dark transition-colors">
            Donate
          </Link>
        </div>
        {/* Mobile nav dropdown */}
        <div
          className={`sm:hidden absolute left-0 top-full w-full bg-white border-t border-gray-100 p-6 flex-col gap-1 text-base shadow-lg transition-all duration-200 z-50 ${open ? 'flex' : 'hidden'}`}
        >
          <Link href="/priorities" className="py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setOpen(false)}>
            Priorities
          </Link>
          <Link href="/about" className="py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setOpen(false)}>
            About Doug
          </Link>
          <Link href="/why" className="py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setOpen(false)}>
            Why I'm Running
          </Link>
          <Link href="/polls" className="py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setOpen(false)}>
            Polls
          </Link>
          <Link href="/ideas" className="py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setOpen(false)}>
            Ideas
          </Link>
          <Link href="/qna" className="py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setOpen(false)}>
            Q&A
          </Link>
          <Link href="/endorsements" className="py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setOpen(false)}>
            Endorsements
          </Link>
          <Link href="/get-involved" className="py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setOpen(false)}>
            Get Involved
          </Link>

          {/* Auth section - Mobile */}
          <div className="pt-4 mt-2 border-t border-gray-100 space-y-2">
            {!loading && (
              isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-500">
                    Signed in as {supporter?.firstName} {supporter?.lastName}
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                      onClick={() => setOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full py-3 px-4 text-left text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/auth/login"
                    className="flex-1 py-3 bg-navy text-white text-center rounded-lg font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex-1 py-3 border border-navy text-navy text-center rounded-lg font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )
            )}
            <Link href="/donate" className="block py-3 bg-prosper-red text-white text-center rounded-lg font-semibold" onClick={() => setOpen(false)}>
              Donate
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
