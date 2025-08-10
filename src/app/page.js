"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import EndorsementsCarousel from '../components/EndorsementsCarousel';

export default function Home() {
  // Q&A list and endorsements fetched from backend
  const [questions, setQuestions] = useState([]);
  const [endorsements, setEndorsements] = useState([]);
  // Form state for question submission
  const [qForm, setQForm] = useState({ name: '', email: '', question: '' });
  const [qThanks, setQThanks] = useState(false);
  // Form state for get involved / endorsement
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
      if (formType === 'endorsement') {
        const res = await fetch('/api/endorsements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, message: form.message }),
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
    'Anthem', 'Cadence', 'Creekside', 'Crosswater', 'The Enclave', 'Lakeside',
    'The Landing', 'The Overlook', 'The Peninsula', 'The Pinnacle', 'The Point',
    'The Summit', 'The Townhomes', 'The Villas', 'Northview', 'The Crossing'
  ];
  // Colour palette for bespoke neighbourhood icons; cycles through these values
  const neighbourhoodColours = [
    'bg-coral',
    'bg-lagoon',
    'bg-lagoon-light'
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
          sizes="(max-width: 640px) 150px, 200px"
          className="mx-auto rounded-full w-[150px] sm:w-[200px]"
          priority
        />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-lagoon">Your Voice. Your Vote. Our Windsong.</h1>
        <p className="max-w-3xl mx-auto text-lg sm:text-xl leading-relaxed">
          For the first time, homeowners will elect two representatives to our HOA Board—joining three developer-appointed members. These seats will set the tone for the transition to a fully homeowner-led board in the near future.
        </p>
        <p className="max-w-3xl mx-auto text-lg sm:text-xl">
          I’m <strong>Doug Charles</strong>, and I’m running for <strong>purpose</strong>—to listen, advocate, and represent every neighborhood in Windsong Ranch with transparency, fiscal responsibility, and an open door for every neighbor.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <a href="#get-involved" className="px-6 py-3 bg-coral text-white rounded-full hover:bg-coral/90">Endorse Doug</a>
          <a href="#get-involved" className="px-6 py-3 bg-lagoon-light text-lagoon rounded-full hover:bg-lagoon-light/90">Get Involved</a>
        </div>
      </section>

      {/* Promises */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <h3 className="text-xl font-semibold mb-2">Transparency & Accountability</h3>
          <p>Every assessment, contract, and decision should be clear and accessible to you. I’ll fight for open budgets, public explanations, and genuine two‑way dialogue.</p>
          <p className="quote mt-2">“Transparent governance isn’t optional—it’s a promise I make to you.”</p>
        </div>
        <div className="card">
          <h3 className="text-xl font-semibold mb-2">Empowered Homeowners & Active Voice</h3>
          <p>Homeowners—not developers—should drive our policies. We’ll staff committees with Windsong’s talented, passionate, and expert residents—and I’ll always be available to listen and advocate for your concerns.</p>
          <p className="quote mt-2">“Boards don’t own communities—homeowners do. Together we will build a board that serves you, not itself.”</p>
        </div>
        <div className="card">
          <h3 className="text-xl font-semibold mb-2">One Windsong</h3>
          <p>Townhomes, Villas, Peninsula, Crosswater, and every street—no neighborhood left behind. Our diversity is our strength, and we are stronger together.</p>
          <p className="quote mt-2">“Diverse in character, united in purpose—one Windsong, one voice.”</p>
        </div>
        <div className="card">
          <h3 className="text-xl font-semibold mb-2">Fiscal Stewardship & Lifestyle Preservation</h3>
          <p>I’ll safeguard our reserve fund, minimize unnecessary assessment increases, and ensure our contracts deliver real value. We’ll protect and enhance our amenities—The Lagoon, trails, parks, and green spaces—so Windsong stays vibrant and thriving.</p>
          <p className="quote mt-2">“Our lifestyle is our legacy. I’ll ensure it’s preserved for all of us, today and tomorrow.”</p>
        </div>
      </section>

      {/* Meet Doug */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Meet Doug</h2>
        <p className="mb-4">
          <strong>Doug Charles</strong> has proudly called Windsong Ranch home since 2015, living in both Crosswater and the Peninsula. As a long‑time resident, husband, and father, he believes leadership is an act of service—not a pursuit of status. With more than 25&nbsp;years of executive leadership in financial services, Doug currently serves as a Senior Vice President overseeing multi‑million‑dollar budgets, complex vendor contracts, and national compliance operations. Doug’s civic service runs deep: two terms on Prosper’s Planning &amp; Zoning Commission, membership on the Town Bond Committee, and previous roles on HOA boards. In every position, he has championed fair representation, strategic growth, and fiscal stewardship. Doug listens first, leads collaboratively, and believes every assessment, contract, and resource should reflect homeowners’ interests—not just a select few. As Windsong Ranch transitions toward full homeowner governance, he is committed to guiding the community with transparency, integrity, and a deep love for his neighbors.
        </p>
        <div className="quote">“Leadership isn’t about titles—it’s about service, stewardship, and listening to every voice.”</div>
      </section>

      {/* Endorsements display */}
      {endorsements.length > 0 && (
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Endorsements</h2>
          {/* Use auto-rotating carousel */}
          <EndorsementsCarousel endorsements={endorsements} />
        </section>
      )}

      {/* Lifestyle section */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">We Live in a Community Worth Protecting</h2>
        <p>
          From <strong>The Lagoon</strong> and miles of trails to parks, amphitheater events, and shared green spaces—Windsong is built for connection. Good governance keeps it thriving today and strong for tomorrow.
        </p>
      </section>

      {/* Neighborhood unity */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">One Windsong, Every Voice</h2>
        <p className="mb-4">From Anthem to the Villas and every street in between—each neighborhood has its own character, but together we’re One Windsong.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {neighborhoods.map((name, idx) => {
            const colour = neighbourhoodColours[idx % neighbourhoodColours.length];
            return (
              <div key={name} className="flex items-center space-x-3 bg-white rounded-lg p-3 shadow-sm">
                <div className={`w-9 h-9 flex items-center justify-center rounded-full text-white font-bold text-sm ${colour}`}>
                  {name.charAt(0)}
                </div>
                <span className="text-sm sm:text-base font-medium text-charcoal">{name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Submit a question */}
      <section id="qna">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ask Doug a Question</h2>
        <p className="mb-4">Have a question for the Candidate Forum—or anytime? Send it here. I’ll answer and post them on this page, so check back soon.</p>
        {qThanks ? (
          <p className="text-lagoon font-semibold">Thank you for your question! I’ll post an answer here soon.</p>
        ) : (
          <form onSubmit={submitQuestion} className="space-y-3 max-w-xl">
            <div className="flex flex-col">
              <label htmlFor="qname" className="font-medium mb-1">Name*</label>
              <input id="qname" required type="text" value={qForm.name} onChange={(e) => setQForm({ ...qForm, name: e.target.value })} className="border p-2 rounded" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="qemail" className="font-medium mb-1">Email*</label>
              <input id="qemail" required type="email" value={qForm.email} onChange={(e) => setQForm({ ...qForm, email: e.target.value })} className="border p-2 rounded" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="question" className="font-medium mb-1">Your Question*</label>
              <textarea id="question" required rows={4} value={qForm.question} onChange={(e) => setQForm({ ...qForm, question: e.target.value })} className="border p-2 rounded"></textarea>
            </div>
            <button type="submit" className="bg-coral text-white px-5 py-2 rounded hover:bg-coral/90">Submit Question</button>
          </form>
        )}
      </section>

      {/* Q&A published answers */}
      {questions.length > 0 && (
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Questions & Answers</h2>
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
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Join the Effort</h2>
        <p className="mb-4">Select how you'd like to participate—Get Updates, Volunteer, Host a Home Meeting, Request a Meeting, or Endorse Doug.</p>
        <form onSubmit={submitGetInvolved} className="space-y-3 max-w-xl">
          <div className="flex flex-col">
            <label htmlFor="ftype" className="font-medium mb-1">I'm interested in*</label>
            <select id="ftype" value={formType} onChange={(e) => setFormType(e.target.value)} className="border p-2 rounded">
              <option value="updates">Get Updates</option>
              <option value="volunteer">Volunteer</option>
              <option value="host">Host a Home Meeting</option>
              <option value="meeting">Request a Meeting</option>
              <option value="endorsement">Endorse Doug</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="fname" className="font-medium mb-1">Name*</label>
            <input id="fname" required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 rounded" />
          </div>
          {(formType !== 'endorsement') && (
            <div className="flex flex-col">
              <label htmlFor="femail" className="font-medium mb-1">Email*</label>
              <input id="femail" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border p-2 rounded" />
            </div>
          )}
          {(formType === 'updates' || formType === 'volunteer') && (
            <div className="flex flex-col">
              <label htmlFor="fphone" className="font-medium mb-1">Mobile (optional)</label>
              <input id="fphone" type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border p-2 rounded" />
            </div>
          )}
          <div className="flex flex-col">
            <label htmlFor="fmessage" className="font-medium mb-1">Message (optional)</label>
            <textarea id="fmessage" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="border p-2 rounded" />
          </div>
          <button type="submit" className="bg-lagoon text-white px-5 py-2 rounded hover:bg-lagoon/90">Submit</button>
          {submitMsg && <p className="mt-2 text-lagoon font-semibold">{submitMsg}</p>}
        </form>
      </section>
    </div>
  );
}