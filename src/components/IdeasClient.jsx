'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { useRecaptcha } from '../hooks/useRecaptcha';
import { useCSRF } from '../hooks/useCSRF';
import { logApiError } from '@/lib/clientErrorLogger';

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

export default function IdeasClient({ initialIdeas = [] }) {
  const { getToken, isReady } = useRecaptcha();
  const { token: csrfToken, refreshToken } = useCSRF();
  const [ideas, setIdeas] = useState(initialIdeas);
  const [loading, setLoading] = useState(false);
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
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportIdeaId, setSupportIdeaId] = useState(null);
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMsg, setSupportMsg] = useState('');
  const submitModalRef = useRef(null);
  const supportModalRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedSupporter, setAuthenticatedSupporter] = useState(null);

  // Escape key, focus trap, and scroll lock for modals
  useEffect(() => {
    const isOpen = showSubmitForm || showSupportModal;
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
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
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
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
      await logApiError('/api/ideas', 'GET', err.status || 500, err.message, { context: 'loadIdeas', category });
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    const controller = new AbortController();

    // Only load if filtering by category (not 'all' with initial data)
    if (category !== 'all' || initialIdeas.length === 0) {
      loadIdeas();
    } else {
      // Filter initialIdeas by category
      setIdeas(initialIdeas);
    }

    // Check for authenticated supporter
    async function checkAuth() {
      try {
        const res = await fetch('/api/supporter/me', { signal: controller.signal });
        const data = await res.json();
        if (controller.signal.aborted) return;
        if (data.ok && data.data) {
          setIsAuthenticated(true);
          setAuthenticatedSupporter(data.data);
          // Pre-fill form with authenticated user info
          setSubmitForm((prev) => ({
            ...prev,
            name: data.data.name,
            email: data.data.email,
          }));
          setSupportEmail(data.data.email);
          return;
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        // Not authenticated - expected for guests, no logging needed
      }

      // If not authenticated, check for verified voter cookie (for pre-filling support email)
      try {
        const voterRes = await fetch('/api/verified-voters/me', { signal: controller.signal });
        const voterData = await voterRes.json();
        if (!controller.signal.aborted && voterData.ok && voterData.data) {
          setSupportEmail(voterData.data.email);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        // Not a verified voter - expected for guests, no logging needed
      }
    }
    checkAuth();

    // Fetch supported ideas from API instead of localStorage
    async function loadSupportedIdeas() {
      try {
        const res = await fetch('/api/ideas/my-support', { signal: controller.signal });
        if (!res.ok) {
          throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
        }
        const data = await res.json();
        if (!controller.signal.aborted && data.ok) {
          setSupportedIdeas(data.data || {});
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        // Network failures on focus events are expected (e.g., tab restore, private relay)
        // Only log server errors, not transient network issues
        if (err.status && err.status >= 500) {
          await logApiError('/api/ideas/my-support', 'GET', err.status, err.message, { context: 'loadSupportedIdeas' });
        }
        setSupportedIdeas({});
      }
    }
    loadSupportedIdeas();

    // Reload authentication when window regains focus (e.g., after signing in)
    const handleFocus = () => {
      checkAuth();
      loadSupportedIdeas();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      controller.abort();
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadIdeas, category, initialIdeas]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitMsg('');

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getToken('submit_idea');

      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          ...submitForm,
          recaptchaToken,
        }),
      });
      await refreshToken();
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
      await logApiError('/api/ideas', 'POST', err.status || 500, err.message, {
        formData: submitForm,
        userAgent: navigator.userAgent,
      });
      setSubmitMsg('Error submitting idea. Our team has been notified.');
    }
  }

  async function handleSupport(ideaId) {
    const email = supportedIdeas[ideaId];

    if (email) {
      // Already supported, unsupport
      try {
        const res = await fetch(`/api/ideas/${ideaId}/support`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          body: JSON.stringify({ email }),
        });
        await refreshToken();
        const result = await res.json();
        if (result.ok) {
          const newSupported = { ...supportedIdeas };
          delete newSupported[ideaId];
          setSupportedIdeas(newSupported);
          loadIdeas();
        }
      } catch (err) {
        await logApiError(`/api/ideas/${ideaId}/support`, 'DELETE', err.status || 500, err.message, { context: 'unsupport' });
      }
    } else {
      // Show support modal
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
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ email: supportEmail }),
      });
      await refreshToken();
      const result = await res.json();
      if (result.ok) {
        const newSupported = { ...supportedIdeas, [supportIdeaId]: supportEmail };
        setSupportedIdeas(newSupported);
        loadIdeas();
        setShowSupportModal(false);
        setSupportIdeaId(null);
        setSupportEmail('');
      } else {
        setSupportMsg(result.error || 'Error supporting idea');
      }
    } catch (err) {
      await logApiError(`/api/ideas/${supportIdeaId}/support`, 'POST', err.status || 500, err.message, { context: 'support' });
      setSupportMsg('Error supporting idea. Please try again.');
    }
  }

  // Filter ideas by category client-side when using initial data
  const filteredIdeas = category === 'all' ? ideas : ideas.filter((i) => i.category === category);

  return (
    <>
      {/* Submit Button for mobile */}
      <section className="py-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-white sm:hidden">
        <div className="max-w-4xl mx-auto text-center">
          <button onClick={() => setShowSubmitForm(true)} className="btn-white w-full">
            Submit Your Idea
          </button>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat) => (
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
            <div className="text-center py-12 text-gray-700" role="status" aria-live="polite">
              Loading ideas...
            </div>
          ) : filteredIdeas.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">💡</div>
              <h2 className="text-xl font-bold text-navy mb-2">Be the First!</h2>
              <p className="text-gray-600 mb-6">
                Be the first to share your ideas for making Prosper better! Use the form above to
                submit your thoughts.
              </p>
              <button onClick={() => setShowSubmitForm(true)} className="btn-primary">
                Submit Your Idea
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredIdeas.map((idea) => (
                <div key={idea.id} className="card">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium capitalize">
                        {CATEGORIES.find((c) => c.value === idea.category)?.icon} {idea.category ?? 'uncategorized'}
                      </span>
                      <span
                        className={`px-3 py-1 text-sm rounded-full font-medium capitalize ${STATUS_COLORS[idea.status ?? 'pending'] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {(idea.status ?? 'pending').replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">
                      {idea.created_at ? new Date(idea.created_at).toLocaleDateString() : 'Date unknown'}
                    </span>
                  </div>

                  <Link href={`/ideas/${idea.id}`}>
                    <h2 className="text-xl font-bold text-navy mb-2 hover:underline cursor-pointer">
                      {idea.title ?? 'Untitled Idea'}
                    </h2>
                  </Link>
                  <p className="text-gray-600 mb-4">
                    {idea.content
                      ? idea.content.length > 200
                        ? idea.content.slice(0, 200) + '...'
                        : idea.content
                      : 'No description provided'}
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
                        aria-label={
                          supportedIdeas[idea.id]
                            ? `Remove support for ${idea.title}`
                            : `Support ${idea.title}`
                        }
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
                      {idea.comment_count !== undefined && idea.comment_count > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MessageSquare className="w-4 h-4" aria-hidden="true" />
                          <span className="text-sm font-medium">{idea.comment_count}</span>
                          <span className="sr-only">comments</span>
                        </div>
                      )}
                      <span className="text-sm text-gray-700">by {idea.name ?? 'Anonymous'}</span>
                    </div>
                    <Link
                      href={`/ideas/${idea.id}`}
                      className="text-navy hover:underline text-sm font-medium"
                    >
                      View Details →
                    </Link>
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
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 pb-28 sm:pb-4"
          onClick={() => setShowSubmitForm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            ref={submitModalRef}
            tabIndex={-1}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] sm:max-h-[90vh] overflow-y-auto outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 id="modal-title" className="text-2xl font-bold text-navy">
                  Submit Your Idea
                </h2>
                <button
                  onClick={() => setShowSubmitForm(false)}
                  className="text-gray-600 hover:text-gray-700 text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close form"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {isAuthenticated && authenticatedSupporter && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-700 font-medium">
                      ✓ Signed in as: {authenticatedSupporter.name}
                    </p>
                    <p className="text-xs text-green-600">{authenticatedSupporter.email}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="idea-name" className="form-label">
                    Your Name *
                  </label>
                  <input
                    id="idea-name"
                    type="text"
                    required
                    aria-required="true"
                    value={submitForm.name}
                    onChange={(e) => setSubmitForm({ ...submitForm, name: e.target.value })}
                    className="form-input"
                    autoComplete="name"
                    disabled={isAuthenticated}
                  />
                </div>

                <div>
                  <label htmlFor="idea-email" className="form-label">
                    Your Email *
                  </label>
                  <input
                    id="idea-email"
                    type="email"
                    required
                    aria-required="true"
                    value={submitForm.email}
                    onChange={(e) => setSubmitForm({ ...submitForm, email: e.target.value })}
                    className="form-input"
                    autoComplete="email"
                    disabled={isAuthenticated}
                  />
                </div>

                <div>
                  <label htmlFor="idea-category" className="form-label">
                    Category *
                  </label>
                  <select
                    id="idea-category"
                    value={submitForm.category}
                    onChange={(e) => setSubmitForm({ ...submitForm, category: e.target.value })}
                    className="form-input"
                  >
                    {CATEGORIES.filter((c) => c.value !== 'all').map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="idea-title" className="form-label">
                    Title *
                  </label>
                  <input
                    id="idea-title"
                    type="text"
                    required
                    aria-required="true"
                    minLength={5}
                    value={submitForm.title}
                    onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                    className="form-input"
                    placeholder="Give your idea a clear title"
                    aria-describedby="title-hint"
                  />
                  <p id="title-hint" className="text-xs text-gray-700 mt-1">
                    At least 5 characters
                  </p>
                </div>

                <div>
                  <label htmlFor="idea-content" className="form-label">
                    Description *
                  </label>
                  <textarea
                    id="idea-content"
                    required
                    aria-required="true"
                    minLength={20}
                    rows={5}
                    value={submitForm.content}
                    onChange={(e) => setSubmitForm({ ...submitForm, content: e.target.value })}
                    className="form-input"
                    placeholder="Describe your idea in detail..."
                    aria-describedby="content-hint"
                  />
                  <p id="content-hint" className="text-xs text-gray-700 mt-1">
                    At least 20 characters
                  </p>
                </div>

                <label
                  htmlFor="is_public"
                  className="flex items-center gap-3 cursor-pointer min-h-[44px]"
                >
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={submitForm.is_public}
                    onChange={(e) => setSubmitForm({ ...submitForm, is_public: e.target.checked })}
                    className="w-5 h-5 min-w-[20px] rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">
                    Make this idea public for others to see and support
                  </span>
                </label>

                {submitMsg && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className={`p-4 rounded-lg ${submitMsg.includes('Thank') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                  >
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
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowSupportModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-modal-title"
        >
          <div
            ref={supportModalRef}
            tabIndex={-1}
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 id="support-modal-title" className="text-xl font-bold text-navy">
                  Support This Idea
                </h2>
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="text-gray-600 hover:text-gray-700 text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Enter your email to show your support for this idea.
              </p>
              <form onSubmit={submitSupport} className="space-y-4">
                <div>
                  <label htmlFor="support-email" className="form-label">
                    Email *
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    required
                    aria-required="true"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="form-input"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                {supportMsg && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="p-3 bg-red-50 text-red-700 rounded-lg text-sm"
                  >
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
    </>
  );
}
