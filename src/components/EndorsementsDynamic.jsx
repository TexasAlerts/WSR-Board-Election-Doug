"use client";
import { useEffect, useState, useRef } from 'react';

export default function EndorsementsDynamic() {
  const [endorsements, setEndorsements] = useState([]);
  const [showForm, setShowForm] = useState(false);
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
  const formRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/endorsements', { cache: 'no-store' });
        const data = await res.json();
        setEndorsements(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
      }
    }
    load();
  }, []);

  function handleEndorseClick() {
    setShowForm(true);
    setSubmitMsg('');
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/endorsements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
          consentEmail: form.consentEmail,
          consentSms: form.consentSms,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSubmitMsg('Thank you! Your endorsement has been received.');
        setForm({ name: '', email: '', phone: '', message: '', consentEmail: false, consentSms: false });
        // Reload endorsements to show the new one
        const reloadRes = await fetch('/api/endorsements', { cache: 'no-store' });
        const reloadData = await reloadRes.json();
        setEndorsements(Array.isArray(reloadData.data) ? reloadData.data : []);
      } else {
        setSubmitMsg(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setSubmitMsg('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Endorse CTA */}
      <section className="py-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-700 mb-4">Want to add your voice?</p>
          <button
            type="button"
            onClick={handleEndorseClick}
            className="btn-primary"
          >
            Endorse Doug
          </button>
        </div>
      </section>

      {/* Endorsement Form */}
      {showForm && (
        <section ref={formRef} className="py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✓</span>
                    <h2 className="text-xl font-bold text-navy">Endorse Doug</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl font-bold min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                {submitMsg && submitMsg.includes('Thank you') ? (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-lg" role="status" aria-live="polite">
                    <p className="text-green-800 font-semibold">{submitMsg}</p>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="mt-4 text-navy font-medium hover:underline"
                    >
                      ← Back to endorsements
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="endorsement-name" className="form-label">Name *</label>
                      <input
                        id="endorsement-name"
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
                      <label htmlFor="endorsement-email" className="form-label">Email *</label>
                      <input
                        id="endorsement-email"
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
                      <label htmlFor="endorsement-phone" className="form-label">Phone (optional)</label>
                      <input
                        id="endorsement-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="form-input"
                        placeholder="(555) 555-5555"
                        autoComplete="tel"
                        aria-describedby="endorsement-phone-hint"
                      />
                      <p id="endorsement-phone-hint" className="text-sm text-gray-500 mt-1">US phone numbers only</p>
                    </div>

                    <div>
                      <label htmlFor="endorsement-message" className="form-label">Why I support Doug (optional)</label>
                      <textarea
                        id="endorsement-message"
                        rows={3}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="form-input"
                        placeholder="Share why you're endorsing Doug for Town Council..."
                      />
                    </div>

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
                      {isSubmitting ? 'Submitting...' : 'Submit Endorsement'}
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
      )}

      {/* Endorsements List */}
      <section className="py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {endorsements.length === 0 ? (
            <p className="text-center text-gray-600">No endorsements yet. Be the first to show your support!</p>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {endorsements.map((e) => (
                <div key={e.id} className="bg-white p-3 sm:p-4 rounded shadow-sm">
                  <p className="font-medium text-base sm:text-lg">{e.name}</p>
                  {e.message && <p className="mt-1 italic text-sm sm:text-base">"{e.message}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
