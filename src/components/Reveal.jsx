"use client";

import { useEffect, useRef, useState } from 'react';

export default function Reveal({
  children,
  delay = 0,
  direction = 'up', // 'up', 'down', 'left', 'right', 'scale'
  className = '',
  once = true,
}) {
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsRevealed(false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once]);

  // Use clip-path instead of transform to avoid creating stacking contexts
  // that interfere with sticky positioning (z-index only works within same stacking context)
  const clipPaths = {
    up: 'inset(0 0 100% 0)',      // Hidden at bottom, reveals upward
    down: 'inset(100% 0 0 0)',    // Hidden at top, reveals downward
    left: 'inset(0 100% 0 0)',    // Hidden at right, reveals from left
    right: 'inset(0 0 0 100%)',   // Hidden at left, reveals from right
    scale: 'inset(5% 5% 5% 5%)',  // Slightly inset, reveals outward
    none: 'inset(0 0 0 0)',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isRevealed ? 1 : 0,
        clipPath: isRevealed ? 'inset(0 0 0 0)' : clipPaths[direction],
        transition: `opacity 0.6s ease-out ${delay}ms, clip-path 0.6s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
