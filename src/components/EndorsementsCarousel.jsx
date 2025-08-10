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

  // Render nothing if no endorsements yet
  if (!endorsements || endorsements.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* Wrapper for all slides; translate based on index */}
      <div
        className="flex transition-transform duration-700"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {endorsements.map((e) => (
          <div
            key={e.id}
            className="w-full flex-shrink-0 px-2"
          >
            <div className="bg-white p-4 rounded shadow-sm h-full flex flex-col justify-between">
              <div>
                <p className="font-medium text-lg text-lagoon">{e.name}</p>
                {e.message && <p className="mt-2 italic text-gray-700">“{e.message}”</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}