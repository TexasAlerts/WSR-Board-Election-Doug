"use client";
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EndorsementsPage() {
  const [endorsements, setEndorsements] = useState([]);
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/endorsements', { cache: 'no-store' });
        const data = await res.json();
        setEndorsements(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);
  return (
    <div className="space-y-8 px-2 w-full">
      <h1 className="text-xl sm:text-3xl font-bold">Endorsements</h1>
      {endorsements.length === 0 ? (
        <p>No endorsements yet. Submit yours on the home page!</p>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {endorsements.map((e) => (
            <div key={e.id} className="bg-white p-3 sm:p-4 rounded shadow-sm">
              <p className="font-medium text-base sm:text-lg">{e.name}</p>
              {e.message && <p className="mt-1 italic text-sm sm:text-base">“{e.message}”</p>}
            </div>
          ))}
        </div>
      )}
      {/* Link to endorse */}
      <div className="mt-6">
        {/* Use Next.js Link with hash to ensure smooth internal navigation */}
        <Link
          href={{ pathname: '/', query: { form: 'endorsement' }, hash: 'get-involved' }}
          className="text-coral hover:underline font-medium"
        >
          Endorse Doug
        </Link>
      </div>
    </div>
  );
}