"use client";

import { useState, useEffect, useRef } from 'react';

/**
 * EndorsementsCarousel displays a list of endorsement cards in an auto‑rotating carousel.
 * It renders one endorsement at a time and shifts to the next every few seconds.
 * If there is only one endorsement, the carousel will simply show it without rotation.
 */
export default function EndorsementsCarousel({ endorsements }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  // Rotate through endorsements every 5 seconds. Reset when list length changes.
  useEffect(() => {
    // Clear any existing interval when endorsements change or component unmounts
    if (timerRef.current) clearInterval(timerRef.current);
    if (!endorsements || endorsements.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % endorsements.length);
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [endorsements]);


  // Touch swipe support for mobile
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipe = 50;
  const onTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  const onTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > minSwipe) {
        // swipe left
        setIndex((prev) => (prev + 1) % endorsements.length);
      } else if (diff < -minSwipe) {
        // swipe right
        setIndex((prev) => (prev - 1 + endorsements.length) % endorsements.length);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Render nothing if no endorsements yet
  if (!endorsements || endorsements.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Wrapper for all slides; translate based on index */}
      <div
        className="flex transition-transform duration-700"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {endorsements.map((e) => (
          <div
            key={e.id}
            className="w-full flex-shrink-0 px-1 sm:px-2"
          >
            <div className="bg-white p-4 rounded shadow-sm h-full flex flex-col justify-between min-h-[120px]">
              <div>
                <p className="font-medium text-base sm:text-lg text-lagoon break-words">{e.name}</p>
                {e.message && <p className="mt-2 italic text-gray-700 break-words text-sm sm:text-base">“{e.message}”</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}