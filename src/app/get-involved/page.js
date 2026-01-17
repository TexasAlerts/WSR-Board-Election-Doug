"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function GetInvolvedContent() {
  const [mode, setMode] = useState('volunteer');
  const [formType, setFormType] = useState('updates');
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitMsg, setSubmitMsg] = useState('');

  const searchParams = useSearchParams();

  useEffect(() => {
    const ft = searchParams.get('form');
    if (ft === 'endorsement') {
      setMode('endorsement');
    } else if (ft) {
      setFormType(ft);
    }
  }, [searchParams]);

  async function handleSubmit(e) {
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
      {/* Hero */}
      <section className="text-center py-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy mb-4">
          Get Involved
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Join the movement for common sense leadership in Prosper
        </p>
      </section>

      {/* Mode Toggle */}
      <section className="max-w-2xl mx-auto">
        <div className="flex justify-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => setMode('volunteer')}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
              mode === 'volunteer'
                ? 'bg-navy text-white shadow-lg'
                : 'bg-gray-100 text-navy hover:bg-gray-200'
            }`}
          >
            Volunteer
          </button>
          <button
            type="button"
            onClick={() => setMode('endorsement')}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
              mode === 'endorsement'
                ? 'bg-prosper-red text-white shadow-lg'
                : 'bg-gray-100 text-prosper-red hover:bg-gray-200'
            }`}
          >
            Endorse Doug
          </button>
        </div>

        {/* Form */}
        <div className="card">
          <h2 className="text-xl font-bold text-navy mb-6">
            {mode === 'endorsement' ? 'Submit Your Endorsement' : 'How Can You Help?'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'volunteer' && (
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
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="form-label">Name *</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="form-input"
                  />
                </div>

                {(formType === 'updates' || formType === 'volunteer' || formType === 'yardsign') && (
                  <div>
                    <label htmlFor="phone" className="form-label">Phone (optional)</label>
                    <input
                      id="phone"
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                )}

                {formType === 'yardsign' && (
                  <div>
                    <label htmlFor="address" className="form-label">Delivery Address *</label>
                    <input
                      id="address"
                      type="text"
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="form-input"
                      placeholder="Street address in Prosper"
                    />
                  </div>
                )}

                {formType !== 'yardsign' && (
                  <div>
                    <label htmlFor="message" className="form-label">Message (optional)</label>
                    <textarea
                      id="message"
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="form-input"
                    />
                  </div>
                )}
              </>
            )}

            {mode === 'endorsement' && (
              <>
                <div>
                  <label htmlFor="ename" className="form-label">Name *</label>
                  <input
                    id="ename"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="eemail" className="form-label">Email *</label>
                  <input
                    id="eemail"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="emessage" className="form-label">Why I support Doug (optional)</label>
                  <textarea
                    id="emessage"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="form-input"
                    placeholder="Share why you're endorsing Doug for Town Council..."
                  />
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
      </section>

      {/* Ways to Help */}
      <section className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-12">Ways to Support the Campaign</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="card">
              <h3 className="text-xl font-bold text-navy mb-3">Display a Yard Sign</h3>
              <p className="text-gray-600 mb-4">
                Show your support and help spread the word in your neighborhood.
              </p>
              <button
                onClick={() => {
                  setMode('volunteer');
                  setFormType('yardsign');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-navy font-semibold hover:underline"
              >
                Request a sign →
              </button>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-navy mb-3">Volunteer Your Time</h3>
              <p className="text-gray-600 mb-4">
                Help with door-knocking, phone calls, events, or other campaign activities.
              </p>
              <button
                onClick={() => {
                  setMode('volunteer');
                  setFormType('volunteer');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-navy font-semibold hover:underline"
              >
                Sign up to volunteer →
              </button>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-navy mb-3">Spread the Word</h3>
              <p className="text-gray-600 mb-4">
                Share this website with friends and neighbors. Personal recommendations matter.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-navy mb-3">Make a Donation</h3>
              <p className="text-gray-600 mb-4">
                Every contribution helps us reach more voters across Prosper.
              </p>
              <Link href="/donate" className="text-prosper-red font-semibold hover:underline">
                Donate now →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function GetInvolvedPage() {
  return (
    <Suspense fallback={null}>
      <GetInvolvedContent />
    </Suspense>
  );
}
