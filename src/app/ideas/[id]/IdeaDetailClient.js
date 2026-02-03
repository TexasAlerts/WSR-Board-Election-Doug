'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import IdeaMetadata from '@/components/IdeaMetadata';
import IdeaVotingPanel from '@/components/IdeaVotingPanel';
import CommentList from '@/components/CommentList';
import CommentForm from '@/components/CommentForm';
import { useIdeaVoting } from '@/hooks/useIdeaVoting';
import { useCommentThread } from '@/hooks/useCommentThread';
import { logApiError } from '@/lib/clientErrorLogger';

export default function IdeaDetailClient() {
  const params = useParams();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [supportedIdeas, setSupportedIdeas] = useState({});
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMsg, setSupportMsg] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedSupporter, setAuthenticatedSupporter] = useState(null);

  const { votingIdea, handleIdeaVote } = useIdeaVoting(params.id);
  const {
    commentForm,
    setCommentForm,
    commentMsg,
    setCommentMsg,
    submittingComment,
    handleCommentSubmit,
    handleCommentVote,
  } = useCommentThread(params.id);

  useEffect(() => {
    async function loadIdea() {
      try {
        const res = await fetch(`/api/ideas/${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Idea not found');
          setLoading(false);
          return;
        }

        setIdea(data.data);
        setIsAuthenticated(data.isAuthenticated || false);
      } catch (err) {
        await logApiError(`/api/ideas/${params.id}`, 'GET', err.status || 500, err.message, { context: 'loadIdea' });
        setError('Error loading idea');
      } finally {
        setLoading(false);
      }
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/supporter/me');
        const data = await res.json();
        if (data.ok && data.data) {
          setIsAuthenticated(true);
          setAuthenticatedSupporter(data.data);
          setSupportEmail(data.data.email);
        }
      } catch (err) {
        // Not authenticated - expected for guests, no logging needed
      }
    }

    loadIdea();
    checkAuth();

    // Load supported ideas from localStorage
    try {
      const supported = JSON.parse(localStorage.getItem('supportedIdeas') || '{}');
      setSupportedIdeas(supported);
    } catch {
      setSupportedIdeas({});
    }
  }, [params.id]);

  async function handleSupport() {
    const email = supportedIdeas[params.id];

    if (email) {
      // Already supported, unsupport
      try {
        const res = await fetch(`/api/ideas/${params.id}/support`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const result = await res.json();
        if (result.ok) {
          const newSupported = { ...supportedIdeas };
          delete newSupported[params.id];
          setSupportedIdeas(newSupported);
          localStorage.setItem('supportedIdeas', JSON.stringify(newSupported));
          // Reload idea
          const ideaRes = await fetch(`/api/ideas/${params.id}`);
          const ideaData = await ideaRes.json();
          if (ideaData.ok) {
            setIdea(ideaData.data);
          }
        }
      } catch (err) {
        await logApiError(`/api/ideas/${params.id}/support`, 'DELETE', err.status || 500, err.message, { context: 'unsupport' });
      }
    } else {
      // Show support modal
      setSupportMsg('');
      setShowSupportModal(true);
    }
  }

  async function submitSupport(e) {
    e.preventDefault();
    if (!supportEmail || !params.id) return;

    setSupportMsg('');
    try {
      const res = await fetch(`/api/ideas/${params.id}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: supportEmail }),
      });
      const result = await res.json();
      if (result.ok) {
        const newSupported = { ...supportedIdeas, [params.id]: supportEmail };
        setSupportedIdeas(newSupported);
        localStorage.setItem('supportedIdeas', JSON.stringify(newSupported));
        setShowSupportModal(false);
        // Reload idea
        const ideaRes = await fetch(`/api/ideas/${params.id}`);
        const ideaData = await ideaRes.json();
        if (ideaData.ok) {
          setIdea(ideaData.data);
        }
      } else {
        setSupportMsg(result.error || 'Error supporting idea');
      }
    } catch (err) {
      await logApiError(`/api/ideas/${params.id}/support`, 'POST', err.status || 500, err.message, { context: 'support' });
      setSupportMsg('Error supporting idea. Please try again.');
    }
  }

  async function onIdeaVote(voteType) {
    if (!isAuthenticated) {
      setCommentMsg('Please sign in to vote on ideas.');
      return;
    }

    const result = await handleIdeaVote(voteType);
    if (result.ok) {
      setIdea(result.idea);
    }
  }

  async function onCommentSubmit(e) {
    if (!isAuthenticated) {
      setCommentMsg('Please sign in as a registered supporter to post comments.');
      return;
    }

    const result = await handleCommentSubmit(e);
    if (result.ok && result.idea) {
      setIdea(result.idea);
    }
  }

  async function onCommentVote(commentId, voteType) {
    if (!isAuthenticated) {
      setCommentMsg('Please sign in to vote on comments.');
      return;
    }

    const result = await handleCommentVote(commentId, voteType, idea.comments);
    if (result.ok) {
      setIdea({ ...idea, comments: result.comments });
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center text-gray-500">Loading idea...</div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="card text-center py-12">
          <h2 className="text-xl font-bold text-navy mb-4">Idea Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This idea does not exist.'}</p>
          <Link href="/ideas" className="btn-primary">
            Back to Ideas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/ideas" className="inline-flex items-center gap-2 text-navy hover:underline mb-6">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Ideas
      </Link>

      <div className="card mb-8">
        <IdeaMetadata idea={idea} />

        <h1 className="text-3xl font-bold text-navy mb-4">{idea.title}</h1>
        <p className="text-gray-700 whitespace-pre-wrap mb-6">{idea.content}</p>

        {idea.admin_response && (
          <div className="bg-navy/5 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-navy mb-1">Response from Doug:</p>
            <p className="text-gray-700">{idea.admin_response}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleSupport}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              supportedIdeas[params.id]
                ? 'bg-prosper-red text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={supportedIdeas[params.id] ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            <span>
              {idea.support_count || 0} Support{idea.support_count !== 1 ? 's' : ''}
            </span>
          </button>

          <IdeaVotingPanel
            idea={idea}
            votingIdea={votingIdea}
            onVote={onIdeaVote}
            isAuthenticated={isAuthenticated}
          />

          <span className="text-sm text-gray-500">by {idea.name}</span>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-navy mb-6">
          Comments {idea.comments?.length > 0 && `(${idea.comments.length})`}
        </h2>

        <CommentList
          comments={idea.comments}
          isAuthenticated={isAuthenticated}
          onVote={onCommentVote}
        />

        <CommentForm
          isAuthenticated={isAuthenticated}
          authenticatedSupporter={authenticatedSupporter}
          commentForm={commentForm}
          setCommentForm={setCommentForm}
          commentMsg={commentMsg}
          submittingComment={submittingComment}
          onSubmit={onCommentSubmit}
        />
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowSupportModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-navy">Support This Idea</h2>
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
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
                    Email
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="form-input"
                    placeholder="you@example.com"
                  />
                </div>
                {supportMsg && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{supportMsg}</div>
                )}
                <button type="submit" className="btn-primary w-full">
                  Support Idea
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
