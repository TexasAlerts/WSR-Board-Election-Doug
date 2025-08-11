"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import EndorsementsCarousel from '../components/EndorsementsCarousel';
import {
  Music,
  AudioWaveform,
  Waves,
  Cross,
  Shield,
  PlaneLanding,
  Eye,
  MapPinned,
  Mountain,
  MountainSnow,
  Navigation,
  Building2,
  Home as HomeIcon,
  Compass,
  Link as LinkIcon,
  Megaphone,
  Users,
  PiggyBank,
} from 'lucide-react';

function HomeContent() {
  // Q&A list and endorsements fetched from backend
  const [questions, setQuestions] = useState([]);
  const [endorsements, setEndorsements] = useState([]);
  // Form state for question submission
  const [qForm, setQForm] = useState({ name: '', email: '', question: '' });
  const [qThanks, setQThanks] = useState(false);
  // Form state for get involved / endorsement
  const [mode, setMode] = useState('involved');
  const [formType, setFormType] = useState('updates');
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    // Load approved questions and endorsements
    async function loadData() {
      try {
        const qRes = await fetch('/api/questions', { cache: 'no-store' });
        const qData = await qRes.json();
        setQuestions(Array.isArray(qData.data) ? qData.data : []);
      } catch (err) {
        console.error('Error loading questions', err);
      }
      try {
        const eRes = await fetch('/api/endorsements', { cache: 'no-store' });
        const eData = await eRes.json();
        setEndorsements(Array.isArray(eData.data) ? eData.data : []);
      } catch (err) {
        console.error('Error loading endorsements', err);
      }
    }
    loadData();
  }, []);

  const searchParams = useSearchParams();
  useEffect(() => {
    const ft = searchParams.get('form');
    if (ft === 'endorsement') {
      setMode('endorsement');
    } else {
      setMode('involved');
      if (ft) setFormType(ft);
    }
  }, [searchParams]);

  async function submitQuestion(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qForm),
      });
      if (res.ok) {
        setQThanks(true);
        setQForm({ name: '', email: '', question: '' });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function submitGetInvolved(e) {
    e.preventDefault();
    setSubmitMsg('');
    try {
        if (mode === 'endorsement') {
          const res = await fetch('/api/endorsements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: form.name, email: form.email, message: form.message }),
          });
          if (res.ok) {
            setSubmitMsg('Thank you! Your endorsement has been received.');
            setForm({ name: '', email: '', phone: '', message: '' });
          }
        } else {
        const res = await fetch('/api/interest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: formType, name: form.name, email: form.email, phone: form.phone, message: form.message }),
        });
        if (res.ok) {
          setSubmitMsg('Thank you! We will be in touch.');
          setForm({ name: '', email: '', phone: '', message: '' });
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Neighborhood list to display as cards
  const neighborhoods = [
    { name: 'Anthem', icon: Music },
    { name: 'Cadence', icon: AudioWaveform },
    { name: 'Creekside', icon: Waves },
    { name: 'Crosswater', icon: Cross },
    { name: 'The Enclave', icon: Shield },
    { name: 'Lakeside', icon: Waves },
    { name: 'The Landing', icon: PlaneLanding },
    { name: 'The Overlook', icon: Eye },
    { name: 'The Peninsula', icon: MapPinned },
    { name: 'The Pinnacle', icon: Mountain },
    { name: 'The Point', icon: Navigation },
    { name: 'The Summit', icon: MountainSnow },
    { name: 'The Townhomes', icon: Building2 },
    { name: 'The Villas', icon: HomeIcon },
    { name: 'Northview', icon: Compass },
    { name: 'The Crossing', icon: LinkIcon },
  ];
  // Color palette for bespoke neighborhood icons; cycles through these values
  const neighborhoodColors = [
    'bg-coral',
    'bg-lagoon',
    'bg-lagoon-light',
  ];

  const formOptions = [
    { value: 'updates', label: 'Get Updates' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'host', label: 'Host a Home Meeting' },
    { value: 'meeting', label: 'Request a Meeting' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <Image
          src="/headshot.jpg"
          alt="Doug Charles headshot"
          width={200}
          height={200}
          sizes="(max-width: 400px) 100px, (max-width: 640px) 150px, 200px"
          className="mx-auto rounded-full w-[100px] sm:w-[150px] md:w-[200px]"
          priority
        />
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-lagoon leading-tight">Your Voice. Your Vote. Our Windsong.</h1>
        <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed">
          For the first time, homeowners will elect two representatives to our HOA Board—joining three developer-appointed members. These seats will set the tone for the transition to a fully homeowner-led board in the near future.
        </p>
        <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl">
          I’m <strong>Doug Charles</strong>—and I’m running to listen, advocate, and represent every neighborhood in Windsong Ranch with transparency, fiscal responsibility, and an open door for every neighbor.
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4">
          <Link
            href={{ pathname: '/', query: { form: 'endorsement' }, hash: 'get-involved' }}
            className="px-6 py-3 bg-coral text-white rounded-full hover:bg-coral/90"
          >
            Endorse Doug
          </Link>
          <Link
            href={{ pathname: '/', query: { form: 'updates' }, hash: 'get-involved' }}
            className="px-6 py-3 bg-lagoon-light text-lagoon rounded-full hover:bg-lagoon-light/90"
          >
            Get Involved
          </Link>
        </div>
      </section>

      {/* Promises */}
      <section className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 px-2 sm:px-0">
        <div className="card flex flex-col items-center text-center">
          <Eye className="w-12 h-12 text-lagoon mb-4" aria-hidden="true" />
          <h3 className="text-xl font-semibold mb-2">Ensure Transparency & Accountability</h3>
          <p>I will ensure every assessment, contract, and decision is clear and accessible to you. I’ll fight for open budgets, public explanations, and genuine two‑way dialogue.</p>
          <p className="quote mt-2 text-base sm:text-lg">“Transparent governance isn’t optional—it’s a promise I make to you.”</p>
        </div>
        <div className="card flex flex-col items-center text-center">
          <Megaphone className="w-12 h-12 text-lagoon mb-4" aria-hidden="true" />
          <h3 className="text-xl font-semibold mb-2">Empower Homeowners & Amplify Your Voice</h3>
          <p>Homeowners—not developers—should drive our policies. We’ll staff committees with Windsong’s talented, passionate, and expert residents—and I’ll always be available to listen and advocate for your concerns.</p>
          <p className="quote mt-2 text-base sm:text-lg">“Boards don’t own communities—homeowners do. Together we will build a board that serves you, not itself.”</p>
        </div>
        <div className="card flex flex-col items-center text-center">
          <Users className="w-12 h-12 text-lagoon mb-4" aria-hidden="true" />
        <h3 className="text-xl font-semibold mb-2">Unite Windsong</h3>
          <p>Townhomes, Villas, Peninsula, Crosswater, and every street—No neighborhood left behind. Our diversity is our strength. We are stronger together.</p>
          <p className="quote mt-2 text-base sm:text-lg">“Diverse in character, united in purpose—One Windsong, one voice.”</p>
        </div>
        <div className="card flex flex-col items-center text-center">
          <PiggyBank className="w-12 h-12 text-lagoon mb-4" aria-hidden="true" />
          <h3 className="text-xl font-semibold mb-2">Protect Our Lifestyle & Practice Fiscal Stewardship</h3>
          <p>I’ll safeguard our reserve fund, minimize unnecessary assessment increases, and ensure our contracts deliver real value. We’ll protect and enhance our amenities—The Lagoon, trails, parks, and green spaces—so Windsong stays vibrant and thriving.</p>
          <p className="quote mt-2 text-base sm:text-lg">“Our lifestyle is our legacy. I’ll ensure it’s preserved for all of us, today and tomorrow.”</p>
        </div>
      </section>

      {/* Meet Doug */}
      <section id="about">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Meet Doug</h2>
        <p className="mb-4">
          <strong>Doug Charles</strong> has proudly called Windsong Ranch home since 2015, living in both Crosswater and the Peninsula. As a long‑time resident, husband, and father, he believes leadership is an act of service—not a pursuit of status. With more than 25&nbsp;years of executive leadership in financial services, Doug currently serves as a Senior Vice President overseeing multi‑million‑dollar budgets, complex vendor contracts, and national compliance operations. Doug’s civic service runs deep: two terms on Prosper’s Planning &amp; Zoning Commission, membership on the Town Bond Committee, and previous roles on HOA boards. In every position, he has championed fair representation, strategic growth, and fiscal stewardship. Doug listens first, leads collaboratively, and believes every assessment, contract, and resource should reflect homeowners’ interests—not just a select few. As Windsong Ranch transitions toward full homeowner governance, he is committed to guiding the community with transparency, integrity, and a deep love for his neighbors.
        </p>
        <div className="quote text-base sm:text-lg">“Leadership isn’t about titles—it’s about service, stewardship, and listening to every voice.”</div>
      </section>

      {/* Endorsements display */}
      {endorsements.length > 0 && (
        <section>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Endorsements</h2>
          {/* Use auto-rotating carousel */}
          <EndorsementsCarousel endorsements={endorsements} />
        </section>
      )}

      {/* Lifestyle section */}
      <section>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Protect Our Community</h2>
        <p>
          From <strong>The Lagoon</strong> and miles of trails to parks, amphitheater events, and shared green spaces—Windsong is built for connection. Good governance keeps it thriving today and strong for tomorrow.
        </p>
      </section>

      {/* Neighborhood unity */}
      <section>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-center">One Windsong, Every Voice</h2>
        <p className="mb-4 text-center">From Anthem to the Villas, and every street in between—each neighborhood has its own character, but together, we are One Windsong.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {neighborhoods.map((item, idx) => {
            const color = neighborhoodColors[idx % neighborhoodColors.length];
            const IconComp = item.icon;
            return (
              <div key={item.name} className="flex flex-col items-center p-2 bg-white rounded shadow">
                <div className={`w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full mb-2 ${color}`}>
                  <IconComp className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-center text-charcoal">{item.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Submit a question */}
      <section id="qna">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Ask Doug a Question</h2>
        <p className="mb-4">Have a question for the Candidate Forum—or anytime? Send it here. I’ll answer and post them here, so check back soon.</p>
        {qThanks ? (
          <p className="text-lagoon font-semibold">Thank you for your question! I’ll post an answer here soon.</p>
        ) : (
          <form onSubmit={submitQuestion} className="space-y-3 max-w-xl w-full px-1">
            <div className="flex flex-col">
              <label htmlFor="qname" className="font-medium mb-1">Name*</label>
              <input id="qname" required type="text" value={qForm.name} onChange={(e) => setQForm({ ...qForm, name: e.target.value })} className="border p-2 rounded w-full min-h-[44px]" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="qemail" className="font-medium mb-1">Email*</label>
              <input id="qemail" required type="email" value={qForm.email} onChange={(e) => setQForm({ ...qForm, email: e.target.value })} className="border p-2 rounded w-full min-h-[44px]" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="question" className="font-medium mb-1">Your Question*</label>
              <textarea id="question" required rows={4} value={qForm.question} onChange={(e) => setQForm({ ...qForm, question: e.target.value })} className="border p-2 rounded w-full min-h-[44px]"></textarea>
            </div>
            <button type="submit" className="bg-coral text-white px-5 py-2 rounded hover:bg-coral/90 min-h-[44px]">Submit Question</button>
          </form>
        )}
      </section>

      {/* Q&A published answers */}
      {questions.length > 0 && (
        <section>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Questions & Answers</h2>
          <p className="mb-4">See recent questions answered, updated weekly.</p>
          <div className="space-y-6">
            {questions.map((q) => (
              <div key={q.id} className="border-l-4 border-lagoon pl-4 py-2">
                <p className="font-medium">Q: {q.question}</p>
                <p className="mt-1">A: {q.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Get involved section */}
      <section id="get-involved">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Join the Effort</h2>
        <p className="mb-4">Choose how you'd like to participate or submit an endorsement.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode('involved')}
            className={`px-4 py-2 rounded-full border ${
              mode === 'involved'
                ? 'bg-lagoon text-white border-lagoon'
                : 'bg-white text-lagoon border-lagoon hover:bg-lagoon/10'
            }`}
            aria-pressed={mode === 'involved'}
          >
            Get Involved
          </button>
          <button
            type="button"
            onClick={() => setMode('endorsement')}
            className={`px-4 py-2 rounded-full border ${
              mode === 'endorsement'
                ? 'bg-coral text-white border-coral'
                : 'bg-white text-coral border-coral hover:bg-coral/10'
            }`}
            aria-pressed={mode === 'endorsement'}
          >
            Endorse Doug
          </button>
        </div>
        <form onSubmit={submitGetInvolved} className="space-y-3 max-w-xl w-full px-1">
          {mode === 'involved' && (
            <>
              <div className="flex flex-col">
                <span className="font-medium mb-1">I'm interested in*</span>
                <div className="flex flex-wrap gap-2">
                  {formOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormType(opt.value)}
                      className={`px-4 py-2 rounded-full border ${
                        formType === opt.value
                          ? 'bg-lagoon text-white border-lagoon'
                          : 'bg-white text-lagoon border-lagoon hover:bg-lagoon/10'
                      }`}
                      aria-pressed={formType === opt.value}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="fname" className="font-medium mb-1">Name*</label>
                <input id="fname" required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 rounded w-full min-h-[44px]" />
              </div>
              <div className="flex flex-col">
                <label htmlFor="femail" className="font-medium mb-1">Email*</label>
                <input id="femail" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border p-2 rounded w-full min-h-[44px]" />
              </div>
              {(formType === 'updates' || formType === 'volunteer') && (
                <div className="flex flex-col">
                  <label htmlFor="fphone" className="font-medium mb-1">Mobile (optional)</label>
                  <input id="fphone" type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border p-2 rounded w-full min-h-[44px]" />
                </div>
              )}
              <div className="flex flex-col">
                <label htmlFor="fmessage" className="font-medium mb-1">Message (optional)</label>
                <textarea id="fmessage" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="border p-2 rounded w-full min-h-[44px]" />
              </div>
            </>
          )}
            {mode === 'endorsement' && (
              <>
                <div className="flex flex-col">
                  <label htmlFor="ename" className="font-medium mb-1">Name*</label>
                  <input
                    id="ename"
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="border p-2 rounded w-full min-h-[44px]"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="eemail" className="font-medium mb-1">Email*</label>
                  <input
                    id="eemail"
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="border p-2 rounded w-full min-h-[44px]"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="emessage" className="font-medium mb-1">Message (optional)</label>
                  <textarea
                    id="emessage"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="border p-2 rounded w-full min-h-[44px]"
                  />
                </div>
              </>
            )}
          <button type="submit" className="bg-lagoon text-white px-5 py-2 rounded hover:bg-lagoon/90 min-h-[44px]">Submit</button>
          {submitMsg && <p className="mt-2 text-lagoon font-semibold">{submitMsg}</p>}
        </form>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}