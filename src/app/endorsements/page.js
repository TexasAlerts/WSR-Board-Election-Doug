"use client";
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
    <div className="space-y-8">
      <h1 className="text-3xl sm:text-4xl font-bold">Endorsements</h1>
      {endorsements.length === 0 ? (
        <p>No endorsements yet. Submit yours on the home page!</p>
      ) : (
        <div className="space-y-4">
          {endorsements.map((e) => (
            <div key={e.id} className="bg-white p-4 rounded shadow-sm">
              <p className="font-medium">{e.name}</p>
              {e.message && <p className="mt-1 italic">“{e.message}”</p>}
            </div>
          ))}
        </div>
      )}
      {/* Link to endorse */}
      <div className="mt-6">
        {/* Use Next.js Link with hash to ensure smooth internal navigation */}
        <Link
          href={{ pathname: '/', hash: 'get-involved' }}
          className="text-coral hover:underline font-medium"
        >
          Endorse Doug
        </Link>
      </div>
    </div>
  );
}