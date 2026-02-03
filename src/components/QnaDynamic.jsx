'use client';

import { useState, useEffect } from 'react';

export default function QnaDynamic() {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', question: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch('/api/questions', { cache: 'no-store' });
        const data = await res.json();
        setQuestions(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSubmitted(true);
        setForm({ name: '', email: '', question: '' });
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Ask a Question Form */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h2 className="text-xl font-bold text-navy mb-6">Ask Doug a Question</h2>

            {submitted ? (
              <div
                className="p-6 bg-green-50 border border-green-200 rounded-lg"
                role="status"
                aria-live="polite"
              >
                <p className="text-green-800 font-semibold">
                  Thank you for your question! I'll review it and post an answer soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="form-label">
                    Name *
                  </label>
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
                  <label htmlFor="email" className="form-label">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    aria-required="true"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="form-input"
                    autoComplete="email"
                    aria-describedby="email-hint"
                  />
                  <p id="email-hint" className="text-sm text-gray-500 mt-1">
                    Your email won't be published.
                  </p>
                </div>

                <div>
                  <label htmlFor="question" className="form-label">
                    Your Question *
                  </label>
                  <textarea
                    id="question"
                    required
                    aria-required="true"
                    rows={4}
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    className="form-input"
                    placeholder="What would you like to know about my positions, priorities, or plans for Prosper?"
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-secondary w-full min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Question'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Published Q&A */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-12">Published Answers</h2>

          {loading ? (
            <div className="text-center text-gray-500" role="status" aria-live="polite">
              Loading questions...
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="card">
                  <div className="mb-4">
                    <span className="badge badge-navy">Question</span>
                  </div>
                  <p className="text-lg font-medium text-gray-800 mb-4">{q.question}</p>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="mb-2">
                      <span className="badge badge-red">Doug's Answer</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{q.answer}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">— Asked by {q.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-8">
              <div className="text-4xl mb-4">&#10067;</div>
              <h3 className="text-lg font-bold text-navy mb-2">No Questions Yet</h3>
              <p className="text-gray-600">
                No questions yet—be the first to ask! I'll personally respond to questions submitted
                here.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
