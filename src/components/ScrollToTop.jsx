'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * ScrollToTop component
 * Reliably scrolls to top of page on route changes in Next.js App Router
 *
 * Handles:
 * - Browser scroll restoration conflicts
 * - CSS smooth-scroll override
 * - Layout timing issues with sticky elements
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  // Disable browser's automatic scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Scroll to top on pathname change
  useIsomorphicLayoutEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Bypasses CSS smooth scroll
      });
    };

    // Use requestAnimationFrame for proper timing
    requestAnimationFrame(() => {
      scrollToTop();
      // Fallback for layout shifts
      setTimeout(scrollToTop, 50);
    });
  }, [pathname]);

  return null;
}
