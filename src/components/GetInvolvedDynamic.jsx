"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, MessageCircle } from 'lucide-react';
import { validatePhoneNumber } from '../lib/phoneValidation';

const SHARE_MESSAGE = "I'm supporting Doug Charles for Prosper Town Council Place 5! Learn more about his Common Sense leadership for ALL of Prosper at www.dougcharles.com";
const SHARE_SUBJECT = "Check out Doug Charles for Prosper Town Council";

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

function GetInvolvedDynamicContent() {
  const [selectedAction, setSelectedAction] = useState(null);
  const formRef = useRef(null);
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
    const isSelecting = selectedAction !== card.id;
    setSelectedAction(isSelecting ? card.id : null);
    setSubmitMsg('');

    // Scroll to form on mobile when selecting an action
    if (isSelecting) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
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
    <>
      {/* Action Cards */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-4">Choose How You'd Like to Help</h2>
          <p className="section-subtitle text-center mb-12">Every action makes a difference</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {actionCards.map((card) => (
              card.isLink ? (
                <Link
                  key={card.id}
                  href={card.href}
                  className="card h-full text-center cursor-pointer transition-all duration-300 hover:shadow-navy-lg active:scale-[0.98] border-2 border-transparent p-4 sm:p-6"
                >
                  <div className="icon-container mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14">
                    <span className="text-xl sm:text-2xl">{card.icon}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-navy mb-1 sm:mb-2">{card.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-snug">{card.description}</p>
                </Link>
              ) : (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(card)}
                  className={`card h-full w-full text-center cursor-pointer transition-all duration-300 hover:shadow-navy-lg active:scale-[0.98] border-2 p-4 sm:p-6 ${
                    selectedAction === card.id
                      ? 'border-navy bg-navy/5 shadow-navy-md'
                      : 'border-transparent'
                  }`}
                >
                  <div className="icon-container mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14">
                    <span className="text-xl sm:text-2xl">{card.icon}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-navy mb-1 sm:mb-2">{card.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-snug">{card.description}</p>
                </button>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Spread the Word Section */}
      <section className="pb-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="card bg-gradient-to-br from-navy/5 to-prosper-red/5">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-navy mb-2">Spread the Word</h2>
              <p className="text-gray-600">
                Help us reach more Prosper residents by sharing with friends and neighbors
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Email Share */}
              <div className="text-center">
                <a
                  href={`mailto:?subject=${encodeURIComponent(SHARE_SUBJECT)}&body=${encodeURIComponent(SHARE_MESSAGE)}`}
                  className="inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-navy text-white font-semibold rounded-xl hover:bg-navy/90 active:scale-[0.98] transition-all min-h-[56px] shadow-md"
                >
                  <Mail className="w-5 h-5" />
                  Share via Email
                </a>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                  Opens your email app with a pre-written message
                </p>
              </div>

              {/* Text Share */}
              <div className="text-center">
                <a
                  href={`sms:?&body=${encodeURIComponent(SHARE_MESSAGE)}`}
                  className="inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-prosper-red text-white font-semibold rounded-xl hover:bg-prosper-red/90 active:scale-[0.98] transition-all min-h-[56px] shadow-md"
                >
                  <MessageCircle className="w-5 h-5" />
                  Share via Text
                </a>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                  Opens your messaging app with a pre-written text
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              Personal recommendations are the most powerful way to reach voters!
            </p>
          </div>
        </div>
      </section>

      {/* Form Section - Always rendered but hidden when no action selected to prevent CLS */}
      <section
        ref={formRef}
        className={`pb-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 scroll-mt-4 transition-all duration-300 ${
          selectedAction ? 'opacity-100' : 'hidden'
        }`}
      >
        <div className="max-w-2xl mx-auto">
          <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFormIcon()}</span>
                    {getFormTitle() && <h2 className="text-xl font-bold text-navy">{getFormTitle()}</h2>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAction(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl font-bold min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Close form"
                  >
                    ×
                  </button>
                </div>

                {submitMsg && submitMsg.includes('Thank you') ? (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-lg" role="status" aria-live="polite">
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
                        aria-required="true"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="form-input"
                        autoComplete="name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="form-label">Email *</label>
                      <input
                        id="email"
                        type="email"
                        required
                        aria-required="true"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="form-input"
                        autoComplete="email"
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
                        aria-describedby="phone-hint"
                        autoComplete="tel"
                      />
                      <p id="phone-hint" className="text-sm text-gray-500 mt-1">US phone numbers only</p>
                    </div>

                    {selectedAction === 'yardsign' && (
                      <div>
                        <label htmlFor="address" className="form-label">Delivery Address *</label>
                        <input
                          id="address"
                          type="text"
                          required
                          aria-required="true"
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
                    <fieldset className="space-y-3 pt-2">
                      <legend className="sr-only">Communication preferences</legend>
                      <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
                        <input
                          type="checkbox"
                          checked={form.consentEmail}
                          onChange={(e) => setForm({ ...form, consentEmail: e.target.checked })}
                          className="mt-0.5 h-5 w-5 min-w-[20px] rounded border-gray-300 text-navy focus:ring-navy focus:ring-2"
                        />
                        <span className="text-sm text-gray-600">
                          I agree to receive campaign updates via email. You can unsubscribe at any time.
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
                        <input
                          type="checkbox"
                          checked={form.consentSms}
                          onChange={(e) => setForm({ ...form, consentSms: e.target.checked })}
                          className="mt-0.5 h-5 w-5 min-w-[20px] rounded border-gray-300 text-navy focus:ring-navy focus:ring-2"
                        />
                        <span className="text-sm text-gray-600">
                          I agree to receive campaign updates via text message. Msg & data rates may apply. Reply STOP to opt out.
                        </span>
                      </label>
                    </fieldset>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : getSubmitLabel()}
                    </button>

                    {submitMsg && !submitMsg.includes('Thank you') && (
                      <div role="alert" aria-live="polite" className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 font-medium">{submitMsg}</p>
                      </div>
                    )}
                  </form>
                )}
            </div>
          </div>
        </section>
    </>
  );
}

export default function GetInvolvedDynamic() {
  return (
    <Suspense fallback={null}>
      <GetInvolvedDynamicContent />
    </Suspense>
  );
}
