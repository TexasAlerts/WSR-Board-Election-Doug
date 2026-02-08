'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, MessageCircle } from 'lucide-react';
import { validatePhoneNumber } from '../lib/phoneValidation';
import { useRecaptcha } from '../hooks/useRecaptcha';
import { logApiError } from '@/lib/clientErrorLogger';
import ActionCards from './ActionCards';
import GetInvolvedForm from './GetInvolvedForm';

const SHARE_MESSAGE =
  "I'm supporting Doug Charles for Prosper Town Council Place 5! Learn more about his Common Sense leadership for ALL of Prosper at www.dougcharles.com";
const SHARE_SUBJECT = 'Check out Doug Charles for Prosper Town Council';

function GetInvolvedDynamicContent() {
  const { getToken, isReady } = useRecaptcha();
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
    if (ft) {
      setSelectedAction(ft);
    }
  }, [searchParams]);

  function handleCardClick(card) {
    const isSelecting = selectedAction !== card.id;
    setSelectedAction(isSelecting ? card.id : null);
    setSubmitMsg('');

    if (isSelecting) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  function handleCloseForm() {
    setSubmitMsg('');
    setSelectedAction(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitMsg('');
    setIsSubmitting(true);

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

    // Define endpoint outside try block so it's accessible in catch block for error logging
    const endpoint = selectedAction === 'endorsement' ? '/api/endorsements' : '/api/interest';

    try {
      // Get reCAPTCHA token
      const action = selectedAction === 'endorsement' ? 'submit_endorsement' : 'submit_interest';
      const recaptchaToken = await getToken(action);
      const body =
        selectedAction === 'endorsement'
          ? {
              name: form.name,
              email: form.email,
              phone: validatedPhone || null,
              message: form.message,
              consentEmail: form.consentEmail,
              consentSms: form.consentSms,
              recaptchaToken,
            }
          : {
              type: selectedAction,
              name: form.name,
              email: form.email,
              phone: validatedPhone || null,
              message: form.message,
              consentEmail: form.consentEmail,
              consentSms: form.consentSms,
              recaptchaToken,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setSubmitMsg(
          selectedAction === 'endorsement'
            ? 'Thank you! Your endorsement has been received.'
            : 'Thank you! We will be in touch.'
        );
        setForm({
          name: '',
          email: '',
          phone: '',
          message: '',
          consentEmail: false,
          consentSms: false,
        });
      } else {
        setSubmitMsg(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      await logApiError(endpoint, 'POST', err.status || 500, err.message, {
        userAgent: navigator.userAgent,
      });
      setSubmitMsg('Something went wrong. Our team has been notified.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Action Cards */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-4">Choose How You'd Like to Help</h2>
          <p className="section-subtitle text-center mb-12">Every action makes a difference</p>

          <ActionCards selectedAction={selectedAction} onCardClick={handleCardClick} />
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
                <p className="text-xs sm:text-sm text-gray-700 mt-2 sm:mt-3">
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
                <p className="text-xs sm:text-sm text-gray-700 mt-2 sm:mt-3">
                  Opens your messaging app with a pre-written text
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-gray-700 mt-6">
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
          <GetInvolvedForm
            selectedAction={selectedAction}
            form={form}
            setForm={setForm}
            submitMsg={submitMsg}
            onSubmit={handleSubmit}
            onClose={handleCloseForm}
            isSubmitting={isSubmitting}
          />
        </div>
      </section>
    </>
  );
}

function GetInvolvedSkeleton() {
  return (
    <>
      {/* Action Cards Skeleton */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-5 w-48 bg-gray-200 rounded mx-auto mb-12 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-full text-center p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 rounded-full mx-auto mb-3 sm:mb-4 animate-pulse" />
                <div className="h-5 w-24 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spread the Word Skeleton */}
      <section className="pb-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="card bg-gradient-to-br from-navy/5 to-prosper-red/5 min-h-[280px]" />
        </div>
      </section>
    </>
  );
}

export default function GetInvolvedDynamic() {
  return (
    <Suspense fallback={<GetInvolvedSkeleton />}>
      <GetInvolvedDynamicContent />
    </Suspense>
  );
}
