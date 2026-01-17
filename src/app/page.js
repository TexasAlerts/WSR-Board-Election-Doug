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
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        {/* Campaign logo - displays if logo file exists */}
        <img
          src="/wsr-logo.png"
          alt="Doug Charles for Town Council Place 5 - A Common Sense Leader for All of Prosper"
          className="mx-auto w-[200px] sm:w-[300px] md:w-[400px]"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
          <span className="text-navy">Doug Charles</span>
          <br />
          <span className="text-prosper-red">for Town Council</span>
          <br />
          <span className="text-navy text-xl sm:text-2xl md:text-3xl">Place 5</span>
        </h1>
        <p className="text-xl sm:text-2xl font-semibold text-navy">Listen. Plan. Protect.</p>
        <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed">
          Twenty years ago, my family chose this community. We saw the kind of place where neighbors knew each other, kids played outside, and growth happened thoughtfully.
        </p>
        <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl">
          I'm <strong>Doug Charles</strong>—and I'm running for <strong>Town Council Place 5</strong> to make sure the next chapter of Prosper is written as carefully as the last one.
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4">
          <Link
            href={{ pathname: '/', query: { form: 'endorsement' }, hash: 'get-involved' }}
            className="px-6 py-3 bg-prosper-red text-white rounded-full hover:bg-prosper-red-light transition-colors"
          >
            Endorse Doug
          </Link>
          <Link
            href={{ pathname: '/', query: { form: 'updates' }, hash: 'get-involved' }}
            className="px-6 py-3 bg-navy text-white rounded-full hover:bg-navy-light transition-colors"
          >
            Get Involved
          </Link>
        </div>
      </section>

      {/* Three Pillars */}
      <section id="issues">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-center text-navy">Listen. Plan. Protect.</h2>
        <p className="text-center text-lg mb-6 text-charcoal">Common Sense for Prosper</p>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 px-2 sm:px-0">
          <div className="card flex flex-col items-center text-center">
            <Ear className="w-12 h-12 text-navy mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold mb-2 text-navy">Listen</h3>
            <p>Good decisions start with hearing from residents—not as an afterthought, but from the beginning. I'll make sure your voice is part of the conversation before votes are taken.</p>
          </div>
          <div className="card flex flex-col items-center text-center">
            <ClipboardList className="w-12 h-12 text-navy mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold mb-2 text-navy">Plan</h3>
            <p>Build it right the first time. Right-size projects before we break ground. Think long-term so we're not fixing mistakes or asking for more money later.</p>
          </div>
          <div className="card flex flex-col items-center text-center">
            <ShieldCheck className="w-12 h-12 text-navy mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold mb-2 text-navy">Protect</h3>
            <p>Growth isn't the enemy—losing our community character is. I'll work to ensure new development matches our infrastructure, schools, and the quality of life that brought us all here.</p>
          </div>
        </div>
      </section>

      {/* Meet Doug */}
      <section id="about">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-navy">Meet Doug</h2>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Image
            src="/headshot.jpg"
            alt="Doug Charles"
            width={250}
            height={250}
            className="rounded-lg shadow-md mx-auto md:mx-0"
          />
          <div className="space-y-4 text-base sm:text-lg md:text-xl">
            <p>I've called <span className="text-navy font-semibold">Prosper</span> home for <strong>20 years</strong>. I've raised my family here, served on the <strong>Planning &amp; Zoning Commission</strong>, worked on the <strong>2020 Bond Committee</strong>, and volunteered in my neighborhood.</p>
            <p>I'm running for Town Council because <span className="text-prosper-red font-semibold">Prosper is at a crossroads</span>. The decisions we make over the next few years will shape our community for decades. We need leaders who will listen to all residents, plan thoughtfully, and protect what makes this town special.</p>
            <p><strong>This isn't about political agendas or party labels.</strong> It's about good governance for the place we all call home.</p>
          </div>
        </div>
        {/* Track Record */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-navy mb-4">A Track Record of Service</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-base">
            <li className="flex items-start gap-2"><span className="text-prosper-red font-bold">•</span> <span><strong>20-Year Prosper Resident</strong> — Deep roots in this community</span></li>
            <li className="flex items-start gap-2"><span className="text-prosper-red font-bold">•</span> <span><strong>Planning &amp; Zoning Commissioner (2021-2023)</strong> — Reviewed hundreds of development applications</span></li>
            <li className="flex items-start gap-2"><span className="text-prosper-red font-bold">•</span> <span><strong>2020 Bond Election Committee</strong> — Helped pass $210M bond, now 79%+ executed</span></li>
            <li className="flex items-start gap-2"><span className="text-prosper-red font-bold">•</span> <span><strong>HOA Board Member (Current)</strong> — Hands-on neighborhood leadership</span></li>
          </ul>
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
      <section className="bg-white rounded-xl shadow-md p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-navy text-center">Why I'm Running</h2>
        <div className="max-w-3xl mx-auto space-y-4 text-base sm:text-lg">
          <p>Prosper is growing fast. That's not necessarily bad—but it means we need to be thoughtful about the decisions ahead.</p>
          <p>I've been in the room where these decisions get made. I've read the development applications, asked the hard questions, and seen what happens when we plan well—and when we don't.</p>
          <p>I'm running to bring that experience to the Town Council, and to make sure <strong>every resident's voice is heard</strong>.</p>
          <p className="text-center mt-6 p-4 bg-cream rounded-lg">
            <span className="text-navy font-semibold text-lg">Town Council isn't about party labels.</span><br />
            <span className="text-charcoal">It's about potholes, parks, and planning. It's about whether the roads work, growth happens thoughtfully, and Prosper keeps its character.</span>
          </p>
        </div>
      </section>

      {/* Submit a question */}
      <section id="qna">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-navy">Ask Doug a Question</h2>
        <p className="mb-4">Have a question about my positions or priorities? Send it here, and I'll respond and post answers for everyone to see.</p>
        {qThanks ? (
          <p className="text-navy font-semibold">Thank you for your question! I'll post an answer soon.</p>
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
            <button type="submit" className="bg-prosper-red text-white px-5 py-2 rounded hover:bg-prosper-red-light transition-colors min-h-[44px]">Submit Question</button>
          </form>
        )}
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
      <section id="get-involved">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-navy">Join the Campaign</h2>
        <p className="mb-4">Choose how you'd like to get involved or submit an endorsement.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode('involved')}
            className={`px-4 py-2 rounded-full border transition-colors ${
              mode === 'involved'
                ? 'bg-navy text-white border-navy'
                : 'bg-white text-navy border-navy hover:bg-navy/10'
            }`}
            aria-pressed={mode === 'involved'}
          >
            Get Involved
          </button>
          <button
            type="button"
            onClick={() => setMode('endorsement')}
            className={`px-4 py-2 rounded-full border transition-colors ${
              mode === 'endorsement'
                ? 'bg-prosper-red text-white border-prosper-red'
                : 'bg-white text-prosper-red border-prosper-red hover:bg-prosper-red/10'
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
                      className={`px-4 py-2 rounded-full border transition-colors ${
                        formType === opt.value
                          ? 'bg-navy text-white border-navy'
                          : 'bg-white text-navy border-navy hover:bg-navy/10'
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
              {(formType === 'updates' || formType === 'volunteer' || formType === 'yardsign') && (
                <div className="flex flex-col">
                  <label htmlFor="fphone" className="font-medium mb-1">Mobile (optional)</label>
                  <input id="fphone" type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border p-2 rounded w-full min-h-[44px]" />
                </div>
              )}
              {formType === 'yardsign' && (
                <div className="flex flex-col">
                  <label htmlFor="faddress" className="font-medium mb-1">Address for yard sign delivery*</label>
                  <input id="faddress" required type="text" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="border p-2 rounded w-full min-h-[44px]" placeholder="Street address in Prosper" />
                </div>
              )}
              {formType !== 'yardsign' && (
                <div className="flex flex-col">
                  <label htmlFor="fmessage" className="font-medium mb-1">Message (optional)</label>
                  <textarea id="fmessage" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="border p-2 rounded w-full min-h-[44px]" />
                </div>
              )}
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
                <label htmlFor="emessage" className="font-medium mb-1">Why I support Doug (optional)</label>
                <textarea
                  id="emessage"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="border p-2 rounded w-full min-h-[44px]"
                  placeholder="Share why you're endorsing Doug for Town Council..."
                />
              </div>
            </>
          )}
          <button type="submit" className="bg-navy text-white px-5 py-2 rounded hover:bg-navy-light transition-colors min-h-[44px]">Submit</button>
          {submitMsg && <p className="mt-2 text-navy font-semibold">{submitMsg}</p>}
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
