"use client";

import { useState, useEffect } from 'react';
import Reveal from '../../components/Reveal';

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
    <div className="space-y-0">
      {/* Hero */}
      <section className="hero-pattern hero-gradient text-center py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-navy/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-prosper-red/5 rounded-full blur-3xl"></div>
        </div>
        {/* Logo accent */}
        <img
          src="/wsr-logo.png"
          alt=""
          className="absolute top-4 right-4 w-16 sm:w-20 md:w-24 opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-4 animate-fade-in-down">
            Questions & Answers
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in animate-delay-200">
            Have a question about my positions or priorities? Ask here and I'll respond publicly.
          </p>
        </div>
      </section>

      {/* Ask a Question Form */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Reveal>
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
          </Reveal>
        </div>
      </section>

      {/* Published Q&A */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="section-title text-center mb-12">Published Answers</h2>
          </Reveal>

          {loading ? (
            <div className="text-center text-gray-500">Loading questions...</div>
          ) : questions.length > 0 ? (
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <Reveal key={q.id} delay={idx * 100}>
                  <div className="card">
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
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <div className="card text-center py-8">
                <div className="text-4xl mb-4">❓</div>
                <h3 className="text-lg font-bold text-navy mb-2">No Questions Yet</h3>
                <p className="text-gray-600">
                  No questions yet—be the first to ask! I'll personally respond to questions submitted here.
                </p>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </div>
  );
}
