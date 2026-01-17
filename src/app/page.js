"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import EndorsementsCarousel from '../components/EndorsementsCarousel';
import DonateSection from '../components/DonateSection';
import {
  Ear,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react';

function HomeContent() {
  const [questions, setQuestions] = useState([]);
  const [endorsements, setEndorsements] = useState([]);
  const [qForm, setQForm] = useState({ name: '', email: '', question: '' });
  const [qThanks, setQThanks] = useState(false);
  const [mode, setMode] = useState('involved');
  const [formType, setFormType] = useState('updates');
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
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

  const formOptions = [
    { value: 'updates', label: 'Get Updates' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'yardsign', label: 'Request a Yard Sign' },
    { value: 'meeting', label: 'Request a Meeting' },
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center py-8 md:py-12">
        {/* Campaign logo */}
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
            <Link
              href={{ pathname: '/', query: { form: 'updates' }, hash: 'get-involved' }}
              className="btn-primary"
            >
              Get Involved
            </Link>
            <Link
              href={{ pathname: '/', hash: 'about' }}
              className="btn-outline"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section id="issues" className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
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
              <p className="text-gray-600">Good decisions start with hearing from residents—not as an afterthought, but from the beginning. Your voice should shape outcomes before votes are taken.</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="w-8 h-8 text-navy" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-navy">Plan</h3>
              <p className="text-gray-600">Build it right the first time. Right-size projects before we break ground. Think long-term so we're not fixing mistakes or asking for more money later.</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-navy" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-navy">Protect</h3>
              <p className="text-gray-600">Growth isn't the enemy—losing our community character is. New development must match our infrastructure, schools, and quality of life.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Doug */}
      <section id="about">
        <div className="text-center mb-12">
          <h2 className="section-title">About Doug</h2>
          <p className="section-subtitle">20 years of service to Prosper</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
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
            <p className="text-lg text-gray-700 leading-relaxed">
              I've called <strong className="text-navy">Prosper</strong> home for <strong>20 years</strong>. I've raised my family here, served on the Planning & Zoning Commission, worked on the 2020 Bond Committee, and volunteered in my neighborhood.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              I'm running for Town Council because <strong className="text-prosper-red">Prosper is at a crossroads</strong>. The decisions we make over the next few years will shape our community for decades. We need leaders who will listen to all residents, plan thoughtfully, and protect what makes this town special.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              <strong>This isn't about political agendas or party labels.</strong> It's about good governance for the place we all call home.
            </p>
          </div>
        </div>

        {/* Track Record */}
        <div className="mt-12 card">
          <h3 className="text-xl font-bold text-navy mb-6">Experience & Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-prosper-red rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-navy">20-Year Prosper Resident</p>
                <p className="text-gray-600 text-sm">Deep roots in this community</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-prosper-red rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-navy">Planning & Zoning Commissioner</p>
                <p className="text-gray-600 text-sm">2021-2023 · Reviewed hundreds of development applications</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-prosper-red rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-navy">2020 Bond Election Committee</p>
                <p className="text-gray-600 text-sm">Helped pass $210M bond, now 79%+ executed</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-prosper-red rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-navy">HOA Board Member</p>
                <p className="text-gray-600 text-sm">Current · Hands-on neighborhood leadership</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Endorsements display */}
      {endorsements.length > 0 && (
        <section>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-navy">Endorsements</h2>
          <EndorsementsCarousel endorsements={endorsements} />
        </section>
      )}

      {/* Why I'm Running */}
      <section className="bg-navy text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8">Why I'm Running</h2>
          <div className="space-y-6 text-lg leading-relaxed opacity-95">
            <p>Prosper is growing fast. That's not necessarily bad—but it means we need to be thoughtful about the decisions ahead.</p>
            <p>I've been in the room where these decisions get made. I've read the development applications, asked the hard questions, and seen what happens when we plan well—and when we don't.</p>
            <p>I'm running to bring that experience to the Town Council, and to make sure <strong>every resident's voice is heard</strong>.</p>
          </div>
          <div className="mt-10 p-6 bg-white/10 rounded-lg border border-white/20">
            <p className="text-xl font-semibold mb-2">Town Council isn't about party labels.</p>
            <p className="opacity-90">It's about potholes, parks, and planning. It's about whether the roads work, growth happens thoughtfully, and Prosper keeps its character.</p>
          </div>
        </div>
      </section>

      {/* Submit a question */}
      <section id="qna">
        <div className="max-w-2xl">
          <h2 className="section-title">Ask Doug a Question</h2>
          <p className="text-gray-600 mb-8">Have a question about my positions or priorities? Send it here, and I'll respond and post answers for everyone to see.</p>
          {qThanks ? (
            <div className="card bg-green-50 border-green-200">
              <p className="text-green-800 font-semibold">Thank you for your question! I'll post an answer soon.</p>
            </div>
          ) : (
            <form onSubmit={submitQuestion} className="space-y-5">
              <div>
                <label htmlFor="qname" className="form-label">Name *</label>
                <input id="qname" required type="text" value={qForm.name} onChange={(e) => setQForm({ ...qForm, name: e.target.value })} className="form-input" />
              </div>
              <div>
                <label htmlFor="qemail" className="form-label">Email *</label>
                <input id="qemail" required type="email" value={qForm.email} onChange={(e) => setQForm({ ...qForm, email: e.target.value })} className="form-input" />
              </div>
              <div>
                <label htmlFor="question" className="form-label">Your Question *</label>
                <textarea id="question" required rows={4} value={qForm.question} onChange={(e) => setQForm({ ...qForm, question: e.target.value })} className="form-input"></textarea>
              </div>
              <button type="submit" className="btn-secondary">Submit Question</button>
            </form>
          )}
        </div>
      </section>

      {/* Q&A published answers */}
      {questions.length > 0 && (
        <section>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-navy">Questions & Answers</h2>
          <div className="space-y-6">
            {questions.map((q) => (
              <div key={q.id} className="border-l-4 border-navy pl-4 py-2">
                <p className="font-medium">Q: {q.question}</p>
                <p className="mt-1">A: {q.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Donate Section */}
      <DonateSection />

      {/* Get involved section */}
      <section id="get-involved" className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="section-title">Get Involved</h2>
            <p className="section-subtitle">Join the movement for common sense leadership</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex justify-center gap-3 mb-8">
            <button
              type="button"
              onClick={() => setMode('involved')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                mode === 'involved'
                  ? 'bg-navy text-white shadow-md'
                  : 'bg-white text-navy border border-gray-200 hover:border-navy'
              }`}
              aria-pressed={mode === 'involved'}
            >
              Volunteer
            </button>
            <button
              type="button"
              onClick={() => setMode('endorsement')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                mode === 'endorsement'
                  ? 'bg-prosper-red text-white shadow-md'
                  : 'bg-white text-prosper-red border border-gray-200 hover:border-prosper-red'
              }`}
              aria-pressed={mode === 'endorsement'}
            >
              Endorse Doug
            </button>
          </div>

          <div className="card">
            <form onSubmit={submitGetInvolved} className="space-y-5">
              {mode === 'involved' && (
                <>
                  <div>
                    <label className="form-label">I'm interested in *</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormType(opt.value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            formType === opt.value
                              ? 'bg-navy text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          aria-pressed={formType === opt.value}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="fname" className="form-label">Name *</label>
                    <input id="fname" required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" />
                  </div>
                  <div>
                    <label htmlFor="femail" className="form-label">Email *</label>
                    <input id="femail" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-input" />
                  </div>
                  {(formType === 'updates' || formType === 'volunteer' || formType === 'yardsign') && (
                    <div>
                      <label htmlFor="fphone" className="form-label">Phone (optional)</label>
                      <input id="fphone" type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="form-input" />
                    </div>
                  )}
                  {formType === 'yardsign' && (
                    <div>
                      <label htmlFor="faddress" className="form-label">Delivery Address *</label>
                      <input id="faddress" required type="text" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="form-input" placeholder="Street address in Prosper" />
                    </div>
                  )}
                  {formType !== 'yardsign' && (
                    <div>
                      <label htmlFor="fmessage" className="form-label">Message (optional)</label>
                      <textarea id="fmessage" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="form-input" />
                    </div>
                  )}
                </>
              )}
              {mode === 'endorsement' && (
                <>
                  <div>
                    <label htmlFor="ename" className="form-label">Name *</label>
                    <input id="ename" required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" />
                  </div>
                  <div>
                    <label htmlFor="eemail" className="form-label">Email *</label>
                    <input id="eemail" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-input" />
                  </div>
                  <div>
                    <label htmlFor="emessage" className="form-label">Why I support Doug (optional)</label>
                    <textarea id="emessage" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="form-input" placeholder="Share why you're endorsing Doug for Town Council..." />
                  </div>
                </>
              )}
              <button type="submit" className="btn-primary w-full">
                {mode === 'endorsement' ? 'Submit Endorsement' : 'Submit'}
              </button>
              {submitMsg && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">{submitMsg}</p>
                </div>
              )}
            </form>
          </div>
        </div>
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
