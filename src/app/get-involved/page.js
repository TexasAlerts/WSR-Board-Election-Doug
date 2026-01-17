"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Reveal from '../../components/Reveal';
import { validatePhoneNumber } from '../../lib/phoneValidation';

const actionCards = [
  {
    id: 'updates',
    icon: '📬',
    title: 'Stay Informed',
    description: 'Get campaign news and updates delivered to your inbox',
  },
  {
    id: 'yardsign',
    icon: '🏠',
    title: 'Request a Yard Sign',
    description: 'Show your support in your neighborhood',
  },
  {
    id: 'volunteer',
    icon: '🤝',
    title: 'Volunteer Your Time',
    description: 'Help with door-knocking, calls, and events',
  },
  {
    id: 'meeting',
    icon: '☕',
    title: 'Meet with Doug',
    description: 'Schedule a conversation about Prosper\'s future',
  },
  {
    id: 'endorsement',
    icon: '✓',
    title: 'Endorse Doug',
    description: 'Add your name to the list of supporters',
  },
  {
    id: 'donate',
    icon: '💪',
    title: 'Make a Donation',
    description: 'Help us reach more voters',
    isLink: true,
    href: '/donate',
  },
];

function GetInvolvedContent() {
  const [selectedAction, setSelectedAction] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    consentEmail: false,
    consentSms: false,
  });
  const [submitMsg, setSubmitMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const ft = searchParams.get('form');
    if (ft && actionCards.find(c => c.id === ft && !c.isLink)) {
      setSelectedAction(ft);
    }
  }, [searchParams]);

  function handleCardClick(card) {
    if (card.isLink) return;
    setSelectedAction(selectedAction === card.id ? null : card.id);
    setSubmitMsg('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitMsg('');
    setIsSubmitting(true);

    // Validate phone if provided
    let validatedPhone = form.phone;
    if (form.phone && form.phone.trim()) {
      const { valid, formatted, error } = validatePhoneNumber(form.phone);
      if (!valid) {
        setSubmitMsg(error || 'Please enter a valid US phone number.');
        setIsSubmitting(false);
        return;
      }
      validatedPhone = formatted;
    }

    try {
      if (selectedAction === 'endorsement') {
        const res = await fetch('/api/endorsements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: validatedPhone || null,
            message: form.message,
            consentEmail: form.consentEmail,
            consentSms: form.consentSms,
          }),
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          setSubmitMsg('Thank you! Your endorsement has been received.');
          setForm({ name: '', email: '', phone: '', message: '', consentEmail: false, consentSms: false });
        } else {
          setSubmitMsg(data.error || 'Something went wrong. Please try again.');
        }
      } else {
        const res = await fetch('/api/interest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: selectedAction,
            name: form.name,
            email: form.email,
            phone: validatedPhone || null,
            message: form.message,
            consentEmail: form.consentEmail,
            consentSms: form.consentSms,
          }),
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          setSubmitMsg('Thank you! We will be in touch.');
          setForm({ name: '', email: '', phone: '', message: '', consentEmail: false, consentSms: false });
        } else {
          setSubmitMsg(data.error || 'Something went wrong. Please try again.');
        }
      }
    } catch (err) {
      console.error(err);
      setSubmitMsg('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function getFormTitle() {
    const card = actionCards.find(c => c.id === selectedAction);
    return card ? card.title : '';
  }

  function getFormIcon() {
    const card = actionCards.find(c => c.id === selectedAction);
    return card ? card.icon : '';
  }

  function getSubmitLabel() {
    switch (selectedAction) {
      case 'updates': return 'Subscribe';
      case 'yardsign': return 'Request Sign';
      case 'volunteer': return 'Sign Up';
      case 'meeting': return 'Request Meeting';
      case 'endorsement': return 'Submit Endorsement';
      default: return 'Submit';
    }
  }

  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="cta-gradient text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        {/* Logo accent */}
        <img
          src="/wsr-logo.png"
          alt=""
          className="absolute top-4 right-4 w-16 sm:w-20 md:w-24 opacity-40 pointer-events-none brightness-200"
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in-down">
            Get Involved
          </h1>
          <p className="text-xl text-white/90 animate-fade-in animate-delay-200">
            Join the movement for common sense leadership in Prosper
          </p>
        </div>
      </section>

      {/* Action Cards */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="section-title text-center mb-4">Choose How You'd Like to Help</h2>
            <p className="section-subtitle text-center mb-12">Every action makes a difference</p>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {actionCards.map((card, idx) => (
              <Reveal key={card.id} delay={idx * 50}>
                {card.isLink ? (
                  <Link
                    href={card.href}
                    className="card h-full text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-navy-lg border-2 border-transparent"
                  >
                    <div className="icon-container mx-auto mb-4">
                      <span className="text-2xl">{card.icon}</span>
                    </div>
                    <h3 className="text-lg font-bold text-navy mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCardClick(card)}
                    className={`card h-full w-full text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-navy-lg border-2 ${
                      selectedAction === card.id
                        ? 'border-navy bg-navy/5'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="icon-container mx-auto mb-4">
                      <span className="text-2xl">{card.icon}</span>
                    </div>
                    <h3 className="text-lg font-bold text-navy mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </button>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      {selectedAction && (
        <section className="pb-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Reveal>
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFormIcon()}</span>
                    <h2 className="text-xl font-bold text-navy">{getFormTitle()}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAction(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                    aria-label="Close form"
                  >
                    ×
                  </button>
                </div>

                {submitMsg && submitMsg.includes('Thank you') ? (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-semibold">{submitMsg}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitMsg('');
                        setSelectedAction(null);
                      }}
                      className="mt-4 text-navy font-medium hover:underline"
                    >
                      ← Back to options
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
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

                    <div>
                      <label htmlFor="phone" className="form-label">
                        Phone {selectedAction === 'meeting' ? '*' : '(optional)'}
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required={selectedAction === 'meeting'}
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="form-input"
                        placeholder="(555) 555-5555"
                      />
                    </div>

                    {selectedAction === 'yardsign' && (
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

                    {selectedAction === 'endorsement' && (
                      <div>
                        <label htmlFor="message" className="form-label">Why I support Doug (optional)</label>
                        <textarea
                          id="message"
                          rows={3}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="form-input"
                          placeholder="Share why you're endorsing Doug for Town Council..."
                        />
                      </div>
                    )}

                    {(selectedAction === 'volunteer' || selectedAction === 'meeting') && (
                      <div>
                        <label htmlFor="message" className="form-label">
                          {selectedAction === 'meeting' ? 'Preferred time or message' : 'Message (optional)'}
                        </label>
                        <textarea
                          id="message"
                          rows={3}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="form-input"
                          placeholder={selectedAction === 'meeting' ? 'Let us know your availability...' : ''}
                        />
                      </div>
                    )}

                    {/* Consent checkboxes */}
                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.consentEmail}
                          onChange={(e) => setForm({ ...form, consentEmail: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-navy focus:ring-navy"
                        />
                        <span className="text-sm text-gray-600">
                          I agree to receive campaign updates via email. You can unsubscribe at any time.
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.consentSms}
                          onChange={(e) => setForm({ ...form, consentSms: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-navy focus:ring-navy"
                        />
                        <span className="text-sm text-gray-600">
                          I agree to receive campaign updates via text message. Msg & data rates may apply. Reply STOP to opt out.
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : getSubmitLabel()}
                    </button>

                    {submitMsg && !submitMsg.includes('Thank you') && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 font-medium">{submitMsg}</p>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}
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
