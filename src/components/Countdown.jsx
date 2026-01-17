"use client";

import { useState, useEffect } from 'react';

function getCountdown(now, open, close) {
  const openDate = new Date(open);
  const closeDate = new Date(close);
  if (now < openDate) {
    const days = Math.ceil((openDate - now) / (1000 * 60 * 60 * 24));
    return { phase: 'pre', days };
  }
  if (now >= openDate && now <= closeDate) {
    const days = Math.ceil((closeDate - now) / (1000 * 60 * 60 * 24));
    return { phase: 'open', days };
  }
  return { phase: 'post', days: 0 };
}

export default function Countdown({ open, close }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  const { phase, days } = getCountdown(now, new Date(open), new Date(close));
  if (phase === 'post') return null;

  const label = phase === 'pre' ? 'Voting opens in' : 'Voting closes in';

  return (
    <div className="w-full text-center sm:text-right">
      <span className="font-semibold text-coral whitespace-nowrap uppercase">
        {`${label} ${days} day${days === 1 ? '' : 's'}`}
      </span>
    </div>
  );
}
