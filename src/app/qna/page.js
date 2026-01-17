"use client";

import { useState, useEffect } from 'react';

export default function QnAPage() {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', question: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch('/api/questions', { cache: 'no-store' });
        const data = await res.json();
        setQuestions(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error('Error loading questions', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
        setForm({ name: '', email: '', question: '' });
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy mb-4">
          Questions & Answers
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Have a question about my positions or priorities? Ask here and I'll respond publicly.
        </p>
      </section>

      {/* Ask a Question Form */}
      <section className="max-w-2xl mx-auto">
        <div className="card">
          <h2 className="text-xl font-bold text-navy mb-6">Ask Doug a Question</h2>

          {submitted ? (
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold">
                Thank you for your question! I'll review it and post an answer soon.
              </p>
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
                <p className="text-sm text-gray-500 mt-1">Your email won't be published.</p>
              </div>

              <div>
                <label htmlFor="question" className="form-label">Your Question *</label>
                <textarea
                  id="question"
                  required
                  rows={4}
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="form-input"
                  placeholder="What would you like to know about my positions, priorities, or plans for Prosper?"
                />
              </div>

              <button type="submit" className="btn-secondary w-full">
                Submit Question
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Published Q&A */}
      <section className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-12">Published Answers</h2>

          {loading ? (
            <div className="text-center text-gray-500">Loading questions...</div>
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
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center">
              <p className="text-gray-600">
                No questions have been answered yet. Be the first to ask!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
