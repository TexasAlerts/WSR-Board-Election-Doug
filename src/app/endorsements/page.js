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
    <div className="space-y-0">
      {/* Hero */}
      <section className="hero-pattern hero-gradient text-center py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Logo accent */}
        <img
          src="/wsr-logo.png"
          alt=""
          className="absolute top-4 right-4 w-16 sm:w-20 md:w-24 opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-4 animate-fade-in-down">
            Endorsements
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in animate-delay-200">
            Neighbors supporting common sense leadership for Prosper
          </p>
        </div>
      </section>

      {/* Endorsements List */}
      <section className="py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
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
      <div className="mt-8 text-center">
        <Link
          href="/get-involved?form=endorsement"
          className="btn-primary"
        >
          Endorse Doug
        </Link>
      </div>
        </div>
      </section>
    </div>
  );
}