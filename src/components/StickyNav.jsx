'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Home as HomeIcon, User, LogOut, Settings, ChevronDown } from 'lucide-react';

export default function StickyNav() {
  const navRef = useRef(null);
  const mobileMenuBtnRef = useRef(null);
  const aboutBtnRef = useRef(null);
  const userBtnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [aboutMenuOpen, setAboutMenuOpen] = useState(false);
  const { supporter, isAuthenticated, isAdmin, logout, loading } = useAuth();
  const pathname = usePathname();

  // Helper to check if a path is current
  const isCurrentPage = (path) => pathname === path;
  const isAboutSection = ['/about', '/why', '/priorities', '/track-record'].includes(pathname);

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

  const closeAllMenus = useCallback(() => {
    setOpen(false);
    setUserMenuOpen(false);
    setAboutMenuOpen(false);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!open && !userMenuOpen && !aboutMenuOpen) return;
    function handle(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        closeAllMenus();
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, userMenuOpen, aboutMenuOpen, closeAllMenus]);

  // Close menus on Escape key
  useEffect(() => {
    if (!open && !userMenuOpen && !aboutMenuOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (aboutMenuOpen) {
          setAboutMenuOpen(false);
          aboutBtnRef.current?.focus();
        } else if (userMenuOpen) {
          setUserMenuOpen(false);
          userBtnRef.current?.focus();
        } else if (open) {
          setOpen(false);
          mobileMenuBtnRef.current?.focus();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, userMenuOpen, aboutMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setOpen(false);
  };

  return (
    <nav
      ref={navRef}
      aria-label="Main navigation"
      className="bg-white border-b border-gray-100 py-4 px-4 sticky [top:var(--banner-offset)] z-40"
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-navy flex items-center" aria-label="Home">
          <span className="sm:inline hidden">Home</span>
          <span className="sm:hidden" aria-hidden="true">
            <HomeIcon className="h-7 w-7" />
          </span>
        </Link>
        <button
          ref={mobileMenuBtnRef}
          className="sm:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-navy"
          onClick={toggle}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          aria-controls="mobile-nav-menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        {/* Desktop nav */}
        <div className="hidden sm:flex flex-row items-center gap-6 text-sm font-medium">
          {/* About dropdown */}
          <div className="relative">
            <button
              ref={aboutBtnRef}
              onClick={() => setAboutMenuOpen(!aboutMenuOpen)}
              onKeyDown={(e) => {
                if (aboutMenuOpen) {
                  const items = document.querySelectorAll(
                    '#about-dropdown-menu [role="menuitem"]'
                  );
                  const currentIndex = Array.from(items).indexOf(document.activeElement);
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    items[currentIndex === -1 ? 0 : (currentIndex + 1) % items.length]?.focus();
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    items[
                      currentIndex === -1
                        ? items.length - 1
                        : (currentIndex - 1 + items.length) % items.length
                    ]?.focus();
                  }
                }
              }}
              className={`flex items-center gap-1 transition-colors ${isAboutSection ? 'text-navy font-semibold' : 'text-gray-700 hover:text-navy'}`}
              aria-expanded={aboutMenuOpen}
              aria-haspopup="true"
              aria-controls="about-dropdown-menu"
            >
              About
              <ChevronDown
                className={`w-4 h-4 transition-transform ${aboutMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {aboutMenuOpen && (
              <div
                id="about-dropdown-menu"
                role="menu"
                className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
              >
                <Link
                  href="/about"
                  role="menuitem"
                  aria-current={isCurrentPage('/about') ? 'page' : undefined}
                  className={`flex items-center px-4 py-3 min-h-[44px] hover:bg-gray-50 ${isCurrentPage('/about') ? 'text-navy font-semibold bg-navy/5' : 'text-gray-700'}`}
                  onClick={() => setAboutMenuOpen(false)}
                >
                  About Doug
                </Link>
                <Link
                  href="/why"
                  role="menuitem"
                  aria-current={isCurrentPage('/why') ? 'page' : undefined}
                  className={`flex items-center px-4 py-3 min-h-[44px] hover:bg-gray-50 ${isCurrentPage('/why') ? 'text-navy font-semibold bg-navy/5' : 'text-gray-700'}`}
                  onClick={() => setAboutMenuOpen(false)}
                >
                  Why I'm Running
                </Link>
                <Link
                  href="/priorities"
                  role="menuitem"
                  aria-current={isCurrentPage('/priorities') ? 'page' : undefined}
                  className={`flex items-center px-4 py-3 min-h-[44px] hover:bg-gray-50 ${isCurrentPage('/priorities') ? 'text-navy font-semibold bg-navy/5' : 'text-gray-700'}`}
                  onClick={() => setAboutMenuOpen(false)}
                >
                  Priorities
                </Link>
                <Link
                  href="/track-record"
                  role="menuitem"
                  aria-current={isCurrentPage('/track-record') ? 'page' : undefined}
                  className={`flex items-center px-4 py-3 min-h-[44px] hover:bg-gray-50 ${isCurrentPage('/track-record') ? 'text-navy font-semibold bg-navy/5' : 'text-gray-700'}`}
                  onClick={() => setAboutMenuOpen(false)}
                >
                  Track Record
                </Link>
              </div>
            )}
          </div>
          <Link
            href="/polls"
            aria-current={isCurrentPage('/polls') ? 'page' : undefined}
            className={`px-3 py-2 rounded-lg transition-colors ${isCurrentPage('/polls') ? 'text-navy font-semibold bg-navy/5' : 'text-gray-700 hover:text-navy hover:bg-gray-100'}`}
          >
            Polls
          </Link>
          <Link
            href="/ideas"
            aria-current={isCurrentPage('/ideas') ? 'page' : undefined}
            className={`px-3 py-2 rounded-lg transition-colors ${isCurrentPage('/ideas') ? 'text-navy font-semibold bg-navy/5' : 'text-gray-700 hover:text-navy hover:bg-gray-100'}`}
          >
            Ideas
          </Link>
          <Link
            href="/qna"
            aria-current={isCurrentPage('/qna') ? 'page' : undefined}
            className={`px-3 py-2 rounded-lg transition-colors ${isCurrentPage('/qna') ? 'text-navy font-semibold bg-navy/5' : 'text-gray-700 hover:text-navy hover:bg-gray-100'}`}
          >
            Q&A
          </Link>
          <Link
            href="/endorsements"
            aria-current={isCurrentPage('/endorsements') ? 'page' : undefined}
            className={`px-3 py-2 rounded-lg transition-colors ${isCurrentPage('/endorsements') ? 'text-navy font-semibold bg-navy/5' : 'text-gray-700 hover:text-navy hover:bg-gray-100'}`}
          >
            Endorsements
          </Link>
          <Link
            href="/get-involved"
            aria-current={isCurrentPage('/get-involved') ? 'page' : undefined}
            className={`px-3 py-2 rounded-lg transition-colors ${isCurrentPage('/get-involved') ? 'text-navy font-semibold bg-navy/5' : 'text-gray-700 hover:text-navy hover:bg-gray-100'}`}
          >
            Get Involved
          </Link>

          {/* Auth section */}
          {!loading &&
            (isAuthenticated ? (
              <div className="relative">
                <button
                  ref={userBtnRef}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onKeyDown={(e) => {
                    if (userMenuOpen) {
                      const items = document.querySelectorAll(
                        '#user-dropdown-menu [role="menuitem"]'
                      );
                      const currentIndex = Array.from(items).indexOf(document.activeElement);
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        items[currentIndex === -1 ? 0 : (currentIndex + 1) % items.length]?.focus();
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        items[
                          currentIndex === -1
                            ? items.length - 1
                            : (currentIndex - 1 + items.length) % items.length
                        ]?.focus();
                      }
                    }
                  }}
                  className="flex items-center gap-2 text-gray-700 hover:text-navy transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-controls="user-dropdown-menu"
                >
                  <User className="w-5 h-5" />
                  <span>{supporter?.first_name}</span>
                </button>
                {userMenuOpen && (
                  <div
                    id="user-dropdown-menu"
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
                  >
                    <Link
                      href="/settings"
                      role="menuitem"
                      className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        role="menuitem"
                        className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      role="menuitem"
                      className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-gray-700 hover:bg-gray-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="text-gray-700 hover:text-navy transition-colors">
                Sign In
              </Link>
            ))}

          <Link
            href="/donate"
            className="bg-prosper-red text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-dark transition-colors"
          >
            Donate
          </Link>
        </div>
        {/* Mobile nav dropdown */}
        <div
          id="mobile-nav-menu"
          className={`sm:hidden absolute left-0 top-full w-full bg-white border-t border-gray-100 px-4 py-5 flex-col gap-0.5 text-base shadow-xl transition-all duration-200 z-50 max-h-[calc(100vh-120px)] overflow-y-auto ${open ? 'flex' : 'hidden'}`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          {/* About section */}
          <div className="py-2 px-3 text-xs font-bold text-navy uppercase tracking-wider">
            About Doug
          </div>
          <Link
            href="/about"
            aria-current={isCurrentPage('/about') ? 'page' : undefined}
            className={`py-3.5 px-4 hover:bg-navy/5 active:bg-navy/10 rounded-xl font-medium flex items-center min-h-[48px] ${isCurrentPage('/about') ? 'text-navy bg-navy/5 font-semibold' : 'text-gray-700'}`}
            onClick={() => setOpen(false)}
          >
            About Doug
          </Link>
          <Link
            href="/why"
            aria-current={isCurrentPage('/why') ? 'page' : undefined}
            className={`py-3.5 px-4 hover:bg-navy/5 active:bg-navy/10 rounded-xl font-medium flex items-center min-h-[48px] ${isCurrentPage('/why') ? 'text-navy bg-navy/5 font-semibold' : 'text-gray-700'}`}
            onClick={() => setOpen(false)}
          >
            Why I'm Running
          </Link>
          <Link
            href="/priorities"
            aria-current={isCurrentPage('/priorities') ? 'page' : undefined}
            className={`py-3.5 px-4 hover:bg-navy/5 active:bg-navy/10 rounded-xl font-medium flex items-center min-h-[48px] ${isCurrentPage('/priorities') ? 'text-navy bg-navy/5 font-semibold' : 'text-gray-700'}`}
            onClick={() => setOpen(false)}
          >
            Priorities
          </Link>
          <Link
            href="/track-record"
            aria-current={isCurrentPage('/track-record') ? 'page' : undefined}
            className={`py-3.5 px-4 hover:bg-navy/5 active:bg-navy/10 rounded-xl font-medium flex items-center min-h-[48px] ${isCurrentPage('/track-record') ? 'text-navy bg-navy/5 font-semibold' : 'text-gray-700'}`}
            onClick={() => setOpen(false)}
          >
            Track Record
          </Link>

          {/* Engage section */}
          <div className="py-2 px-3 text-xs font-bold text-navy uppercase tracking-wider mt-3">
            Get Involved
          </div>
          <Link
            href="/polls"
            aria-current={isCurrentPage('/polls') ? 'page' : undefined}
            className={`py-3.5 px-4 hover:bg-navy/5 active:bg-navy/10 rounded-xl font-medium flex items-center min-h-[48px] ${isCurrentPage('/polls') ? 'text-navy bg-navy/5 font-semibold' : 'text-gray-700'}`}
            onClick={() => setOpen(false)}
          >
            Polls
          </Link>
          <Link
            href="/ideas"
            aria-current={isCurrentPage('/ideas') ? 'page' : undefined}
            className={`py-3.5 px-4 hover:bg-navy/5 active:bg-navy/10 rounded-xl font-medium flex items-center min-h-[48px] ${isCurrentPage('/ideas') ? 'text-navy bg-navy/5 font-semibold' : 'text-gray-700'}`}
            onClick={() => setOpen(false)}
          >
            Ideas
          </Link>
          <Link
            href="/qna"
            aria-current={isCurrentPage('/qna') ? 'page' : undefined}
            className={`py-3.5 px-4 hover:bg-navy/5 active:bg-navy/10 rounded-xl font-medium flex items-center min-h-[48px] ${isCurrentPage('/qna') ? 'text-navy bg-navy/5 font-semibold' : 'text-gray-700'}`}
            onClick={() => setOpen(false)}
          >
            Q&A
          </Link>
          <Link
            href="/endorsements"
            aria-current={isCurrentPage('/endorsements') ? 'page' : undefined}
            className={`py-3.5 px-4 hover:bg-navy/5 active:bg-navy/10 rounded-xl font-medium flex items-center min-h-[48px] ${isCurrentPage('/endorsements') ? 'text-navy bg-navy/5 font-semibold' : 'text-gray-700'}`}
            onClick={() => setOpen(false)}
          >
            Endorsements
          </Link>
          <Link
            href="/get-involved"
            aria-current={isCurrentPage('/get-involved') ? 'page' : undefined}
            className={`py-3.5 px-4 hover:bg-navy/5 active:bg-navy/10 rounded-xl font-medium flex items-center min-h-[48px] ${isCurrentPage('/get-involved') ? 'text-navy bg-navy/5 font-semibold' : 'text-gray-700'}`}
            onClick={() => setOpen(false)}
          >
            Get Involved
          </Link>

          {/* Auth section - Mobile */}
          <div className="pt-4 mt-3 border-t border-gray-200 space-y-3">
            {!loading &&
              (isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
                    Signed in as{' '}
                    <span className="font-medium text-navy">
                      {supporter?.first_name} {supporter?.last_name}
                    </span>
                  </div>
                  <Link
                    href="/settings"
                    className="block py-3.5 px-4 text-gray-700 hover:bg-navy/5 active:bg-navy/10 rounded-xl font-medium min-h-[48px] flex items-center"
                    onClick={() => setOpen(false)}
                  >
                    Settings
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="block py-3.5 px-4 text-gray-700 hover:bg-navy/5 active:bg-navy/10 rounded-xl font-medium min-h-[48px] flex items-center"
                      onClick={() => setOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full py-3.5 px-4 text-left text-gray-700 hover:bg-navy/5 active:bg-navy/10 rounded-xl font-medium min-h-[48px]"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/auth/login"
                    className="flex-1 py-3.5 bg-navy text-white text-center rounded-xl font-semibold min-h-[48px] flex items-center justify-center active:bg-navy-dark"
                    onClick={() => setOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex-1 py-3.5 border-2 border-navy text-navy text-center rounded-xl font-semibold min-h-[48px] flex items-center justify-center active:bg-navy/5"
                    onClick={() => setOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              ))}
            <Link
              href="/donate"
              className="block py-3.5 bg-prosper-red text-white text-center rounded-xl font-semibold min-h-[48px] flex items-center justify-center active:bg-prosper-red-dark shadow-md"
              onClick={() => setOpen(false)}
            >
              Donate to the Campaign
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
