"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Ear,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react';

export default function Home() {
  const [endorsements, setEndorsements] = useState([]);

  useEffect(() => {
    async function loadEndorsements() {
      try {
        const res = await fetch('/api/endorsements', { cache: 'no-store' });
        const data = await res.json();
        setEndorsements(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error('Error loading endorsements', err);
      }
    }
    loadEndorsements();
  }, []);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center py-8 md:py-12">
        <img
          src="/wsr-logo.png"
          alt="Doug Charles for Town Council Place 5"
          className="mx-auto w-[180px] sm:w-[240px] md:w-[320px] mb-8"
          onError={(e) => { e.target.style.display = 'none'; }}
        />

        <div className="space-y-6 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            <span className="text-navy">DOUG</span>{' '}
            <span className="text-prosper-red">CHARLES</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 font-medium">
            For Prosper Town Council · Place 5
          </p>

          <div className="flex items-center justify-center gap-4 py-4">
            <span className="h-px w-12 bg-gray-300"></span>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-navy tracking-wide">
              Listen. Plan. Protect.
            </p>
            <span className="h-px w-12 bg-gray-300"></span>
          </div>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            A common sense leader committed to thoughtful growth, fiscal responsibility,
            and preserving what makes Prosper special.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <Link href="/get-involved" className="btn-primary">
              Get Involved
            </Link>
            <Link href="/about" className="btn-outline">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Three Pillars Preview */}
      <section className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">My Priorities</h2>
            <p className="section-subtitle">Common sense leadership for Prosper</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="card text-center">
              <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Ear className="w-8 h-8 text-navy" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-navy">Listen</h3>
              <p className="text-gray-600">Good decisions start with hearing from residents—not as an afterthought, but from the beginning.</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="w-8 h-8 text-navy" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-navy">Plan</h3>
              <p className="text-gray-600">Build it right the first time. Right-size projects before we break ground.</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-navy" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-navy">Protect</h3>
              <p className="text-gray-600">Growth isn't the enemy—losing our community character is.</p>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link href="/priorities" className="btn-outline">
              Learn More About My Priorities
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section>
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-1">
            <Image
              src="/headshot.jpg"
              alt="Doug Charles"
              width={300}
              height={375}
              className="rounded-lg shadow-lg mx-auto w-full max-w-[280px]"
            />
          </div>
          <div className="md:col-span-2 space-y-5">
            <h2 className="section-title">About Doug</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              I've called <strong className="text-navy">Prosper</strong> home for <strong>20 years</strong>. I've served on the Planning & Zoning Commission, worked on the 2020 Bond Committee, and volunteered in my neighborhood.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              I'm running because <strong className="text-prosper-red">Prosper is at a crossroads</strong>. The decisions we make now will shape our community for decades.
            </p>
            <Link href="/about" className="btn-outline inline-block">
              Read More
            </Link>
          </div>
        </div>
      </section>

      {/* Endorsements Preview */}
      {endorsements.length > 0 && (
        <section className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="section-title text-center mb-8">Community Support</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {endorsements.slice(0, 4).map((e) => (
                <div key={e.id} className="card">
                  <p className="text-gray-600 italic mb-3">"{e.message}"</p>
                  <p className="font-semibold text-navy">— {e.name}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/endorsements" className="btn-outline">
                View All Endorsements
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-navy text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
            Join the Campaign
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Together, we can ensure Prosper's growth is managed wisely and every resident's voice is heard.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/get-involved" className="bg-white text-navy px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all">
              Get Involved
            </Link>
            <Link href="/donate" className="bg-prosper-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-dark transition-all">
              Donate
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
