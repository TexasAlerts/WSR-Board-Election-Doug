"use client";

import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'all', label: 'All Ideas', icon: '💡' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🛣️' },
  { value: 'community', label: 'Community', icon: '🏘️' },
  { value: 'safety', label: 'Safety', icon: '🛡️' },
  { value: 'environment', label: 'Environment', icon: '🌳' },
  { value: 'general', label: 'General', icon: '📝' },
  { value: 'question', label: 'Questions', icon: '❓' },
];

const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700',
  under_review: 'bg-blue-100 text-blue-700',
  planned: 'bg-purple-100 text-purple-700',
  completed: 'bg-navy/10 text-navy',
  declined: 'bg-red-100 text-red-700',
};

export default function IdeasPage() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [supportedIdeas, setSupportedIdeas] = useState({});
  const [submitForm, setSubmitForm] = useState({
    name: '',
    email: '',
    category: 'general',
    title: '',
    content: '',
    is_public: true,
  });
  const [submitMsg, setSubmitMsg] = useState('');
  // Support modal state
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportIdeaId, setSupportIdeaId] = useState(null);
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMsg, setSupportMsg] = useState('');
  const submitModalRef = useRef(null);
  const supportModalRef = useRef(null);

  // Escape key and focus trap for modals
  useEffect(() => {
    const isOpen = showSubmitForm || showSupportModal;
    if (!isOpen) return;
    const modalRef = showSubmitForm ? submitModalRef : supportModalRef;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (showSupportModal) setShowSupportModal(false);
        else if (showSubmitForm) setShowSubmitForm(false);
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSubmitForm, showSupportModal]);

  const loadIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const url = category === 'all' ? '/api/ideas' : `/api/ideas?category=${category}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) {
        setIdeas(data.data || []);
      }
    } catch (err) {
      console.error('Error loading ideas:', err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadIdeas();
    // Load supported ideas from localStorage
    try {
      const supported = JSON.parse(localStorage.getItem('supportedIdeas') || '{}');
      setSupportedIdeas(supported);
    } catch {
      setSupportedIdeas({});
    }
  }, [loadIdeas]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitMsg('');

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitForm),
      });
      const result = await res.json();

      if (result.ok) {
        setSubmitMsg('Thank you! Your idea has been submitted for review.');
        setSubmitForm({
          name: '',
          email: '',
          category: 'general',
          title: '',
          content: '',
          is_public: true,
        });
        setTimeout(() => setShowSubmitForm(false), 2000);
      } else {
        setSubmitMsg(result.error || 'Error submitting idea');
      }
    } catch (err) {
      setSubmitMsg('Error submitting idea');
    }
  }

  async function handleSupport(ideaId) {
    const email = supportedIdeas[ideaId];

    if (email) {
      // Already supported, unsupport
      try {
        const res = await fetch(`/api/ideas/${ideaId}/support`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const result = await res.json();
        if (result.ok) {
          const newSupported = { ...supportedIdeas };
          delete newSupported[ideaId];
          setSupportedIdeas(newSupported);
          localStorage.setItem('supportedIdeas', JSON.stringify(newSupported));
          loadIdeas();
        }
      } catch (err) {
        console.error('Error removing support:', err);
      }
    } else {
      // Show support modal instead of prompt
      setSupportIdeaId(ideaId);
      setSupportEmail('');
      setSupportMsg('');
      setShowSupportModal(true);
    }
  }

  async function submitSupport(e) {
    e.preventDefault();
    if (!supportEmail || !supportIdeaId) return;

    setSupportMsg('');
    try {
      const res = await fetch(`/api/ideas/${supportIdeaId}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: supportEmail }),
      });
      const result = await res.json();
      if (result.ok) {
        const newSupported = { ...supportedIdeas, [supportIdeaId]: supportEmail };
        setSupportedIdeas(newSupported);
        localStorage.setItem('supportedIdeas', JSON.stringify(newSupported));
        loadIdeas();
        setShowSupportModal(false);
        setSupportIdeaId(null);
        setSupportEmail('');
      } else {
        setSupportMsg(result.error || 'Error supporting idea');
      }
    } catch (err) {
      console.error('Error supporting idea:', err);
      setSupportMsg('Error supporting idea. Please try again.');
    }
  }

  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="bg-gradient-red text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        {/* Logo accent */}
        <Image
          src="/wsr-logo.webp"
          alt=""
          width={96}
          height={64}
          className="absolute top-4 right-4 w-16 sm:w-20 md:w-24 h-auto opacity-40 pointer-events-none brightness-200"
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in-down">
            Community Ideas
          </h1>
          <p className="text-xl text-white/90 animate-fade-in animate-delay-200 mb-8">
            Share your ideas for making Prosper better
          </p>
          <button
            onClick={() => setShowSubmitForm(true)}
            className="btn-white animate-fade-in-up animate-delay-300"
          >
            Submit Your Idea
          </button>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                aria-pressed={category === cat.value}
                className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-all ${
                  category === cat.value
                    ? 'bg-navy text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="mr-1">{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Ideas List */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading ideas...</div>
          ) : ideas.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">💡</div>
              <h2 className="text-xl font-bold text-navy mb-2">Be the First!</h2>
              <p className="text-gray-600 mb-6">Be the first to share your ideas for making Prosper better! Use the form above to submit your thoughts.</p>
              <button onClick={() => setShowSubmitForm(true)} className="btn-primary">
                Submit Your Idea
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {ideas.map((idea) => (
                <div key={idea.id} className="card">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium capitalize">
                        {CATEGORIES.find(c => c.value === idea.category)?.icon} {idea.category}
                      </span>
                      <span className={`px-3 py-1 text-sm rounded-full font-medium capitalize ${STATUS_COLORS[idea.status] || 'bg-gray-100 text-gray-600'}`}>
                        {idea.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(idea.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-navy mb-2">{idea.title}</h2>
                  <p className="text-gray-600 mb-4">
                    {idea.content.length > 200 ? idea.content.slice(0, 200) + '...' : idea.content}
                  </p>

                  {idea.admin_response && (
                    <div className="bg-navy/5 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-navy mb-1">Response from Doug:</p>
                      <p className="text-gray-700">{idea.admin_response}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleSupport(idea.id)}
                        aria-label={supportedIdeas[idea.id] ? `Remove support for ${idea.title}` : `Support ${idea.title}`}
                        aria-pressed={!!supportedIdeas[idea.id]}
                        className={`flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-lg font-medium transition-all ${
                          supportedIdeas[idea.id]
                            ? 'bg-prosper-red text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill={supportedIdeas[idea.id] ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                        </svg>
                        <span>{idea.support_count}</span>
                      </button>
                      <span className="text-sm text-gray-500">by {idea.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Submit Form Modal */}
      {showSubmitForm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSubmitForm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div ref={submitModalRef} tabIndex={-1} className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto outline-none" onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 id="modal-title" className="text-2xl font-bold text-navy">Submit Your Idea</h2>
                <button
                  onClick={() => setShowSubmitForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close form"
                >×</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="idea-name" className="form-label">Your Name *</label>
                  <input
                    id="idea-name"
                    type="text"
                    required
                    value={submitForm.name}
                    onChange={e => setSubmitForm({ ...submitForm, name: e.target.value })}
                    className="form-input"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="idea-email" className="form-label">Your Email *</label>
                  <input
                    id="idea-email"
                    type="email"
                    required
                    value={submitForm.email}
                    onChange={e => setSubmitForm({ ...submitForm, email: e.target.value })}
                    className="form-input"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="idea-category" className="form-label">Category *</label>
                  <select
                    id="idea-category"
                    value={submitForm.category}
                    onChange={e => setSubmitForm({ ...submitForm, category: e.target.value })}
                    className="form-input"
                  >
                    {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="idea-title" className="form-label">Title *</label>
                  <input
                    id="idea-title"
                    type="text"
                    required
                    minLength={5}
                    value={submitForm.title}
                    onChange={e => setSubmitForm({ ...submitForm, title: e.target.value })}
                    className="form-input"
                    placeholder="Give your idea a clear title"
                    aria-describedby="title-hint"
                  />
                  <p id="title-hint" className="text-xs text-gray-500 mt-1">At least 5 characters</p>
                </div>

                <div>
                  <label htmlFor="idea-content" className="form-label">Description *</label>
                  <textarea
                    id="idea-content"
                    required
                    minLength={20}
                    rows={5}
                    value={submitForm.content}
                    onChange={e => setSubmitForm({ ...submitForm, content: e.target.value })}
                    className="form-input"
                    placeholder="Describe your idea in detail..."
                    aria-describedby="content-hint"
                  />
                  <p id="content-hint" className="text-xs text-gray-500 mt-1">At least 20 characters</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={submitForm.is_public}
                    onChange={e => setSubmitForm({ ...submitForm, is_public: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <label htmlFor="is_public" className="text-sm text-gray-600">
                    Make this idea public for others to see and support
                  </label>
                </div>

                {submitMsg && (
                  <div className={`p-4 rounded-lg ${submitMsg.includes('Thank') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {submitMsg}
                  </div>
                )}

                <button type="submit" className="btn-primary w-full">
                  Submit Idea
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSupportModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-modal-title"
        >
          <div ref={supportModalRef} tabIndex={-1} className="bg-white rounded-xl shadow-2xl max-w-sm w-full outline-none" onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 id="support-modal-title" className="text-xl font-bold text-navy">Support This Idea</h2>
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close"
                >×</button>
              </div>
              <p className="text-gray-600 text-sm mb-4">Enter your email to show your support for this idea.</p>
              <form onSubmit={submitSupport} className="space-y-4">
                <div>
                  <label htmlFor="support-email" className="form-label">Email *</label>
                  <input
                    id="support-email"
                    type="email"
                    required
                    value={supportEmail}
                    onChange={e => setSupportEmail(e.target.value)}
                    className="form-input"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                {supportMsg && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {supportMsg}
                  </div>
                )}
                <button type="submit" className="btn-primary w-full">
                  Support Idea
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="section-title mb-4">Have Your Say</h2>
          <p className="text-gray-600 mb-8">Check out our community polls to share your voice</p>
          <Link href="/polls" className="btn-primary">
            View Polls
          </Link>
        </div>
      </section>
    </div>
  );
}
