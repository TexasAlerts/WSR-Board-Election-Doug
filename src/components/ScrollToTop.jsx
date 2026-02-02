'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollToTop component
 * Reliably scrolls to top of page on route changes in Next.js App Router
 *
 * Uses multiple techniques to ensure scroll works:
 * 1. Disables browser scroll restoration
 * 2. Uses both window.scrollTo and documentElement.scrollTop
 * 3. RAF callback after browser paint
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  // Disable browser's automatic scroll restoration on mount
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Scroll to top on pathname change
  useEffect(() => {
    // Skip on first mount - page loads at correct position
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const scrollToTop = () => {
      // Method 1: Standard scrollTo with instant behavior
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });

      // Method 2: Direct DOM manipulation as fallback
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0; // For Safari
    };

    // Immediate scroll
    scrollToTop();

    // RAF scroll - after browser paint
    requestAnimationFrame(scrollToTop);
  }, [pathname]);

  return null;
}
