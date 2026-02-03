'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

const CATEGORIES = [
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
  const [commentForm, setCommentForm] = useState({ content: '' });
  const [commentMsg, setCommentMsg] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [votingIdea, setVotingIdea] = useState(false);

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
        // Not authenticated
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
        // Error handling
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
      setSupportMsg('Error supporting idea. Please try again.');
    }
  }

  async function handleIdeaVote(voteType) {
    if (!isAuthenticated) {
      setCommentMsg('Please sign in to vote on ideas.');
      return;
    }

    setVotingIdea(true);

    try {
      const res = await fetch(`/api/ideas/${params.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType }),
      });

      const result = await res.json();

      if (result.ok) {
        // Reload idea to get updated vote counts
        const ideaRes = await fetch(`/api/ideas/${params.id}`);
        const ideaData = await ideaRes.json();
        if (ideaData.ok) {
          setIdea(ideaData.data);
        }
      } else {
        setCommentMsg(result.error || 'Error voting on idea');
        setTimeout(() => setCommentMsg(''), 3000);
      }
    } catch (err) {
      setCommentMsg('Error voting on idea');
      setTimeout(() => setCommentMsg(''), 3000);
    } finally {
      setVotingIdea(false);
    }
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();

    if (!isAuthenticated) {
      setCommentMsg('Please sign in as a registered supporter to post comments.');
      return;
    }

    setSubmittingComment(true);
    setCommentMsg('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea_id: params.id,
          content: commentForm.content,
        }),
      });

      const result = await res.json();

      if (result.ok) {
        setCommentMsg('Your comment has been submitted for review.');
        setCommentForm({ content: '' });
        // Reload idea to get updated comments
        const ideaRes = await fetch(`/api/ideas/${params.id}`);
        const ideaData = await ideaRes.json();
        if (ideaData.ok) {
          setIdea(ideaData.data);
        }
      } else {
        setCommentMsg(result.error || 'Error submitting comment');
      }
    } catch (err) {
      setCommentMsg('Error submitting comment');
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleCommentVote(commentId, voteType) {
    if (!isAuthenticated) {
      setCommentMsg('Please sign in to vote on comments.');
      return;
    }

    try {
      const res = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType }),
      });

      const result = await res.json();

      if (result.ok) {
        // Update the comment in idea.comments
        const updatedComments = idea.comments.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              upvotes: result.upvotes,
              downvotes: result.downvotes,
              user_vote: result.user_vote,
            };
          }
          return c;
        });
        setIdea({ ...idea, comments: updatedComments });
      } else {
        setCommentMsg(result.error || 'Error voting on comment');
        setTimeout(() => setCommentMsg(''), 3000);
      }
    } catch (err) {
      setCommentMsg('Error voting on comment');
      setTimeout(() => setCommentMsg(''), 3000);
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

  const categoryInfo = CATEGORIES.find((c) => c.value === idea.category) || CATEGORIES[4];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link href="/ideas" className="inline-flex items-center gap-2 text-navy hover:underline mb-6">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Ideas
      </Link>

      {/* Idea header */}
      <div className="card mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium capitalize">
              {categoryInfo.icon} {categoryInfo.label}
            </span>
            <span
              className={`px-3 py-1 text-sm rounded-full font-medium capitalize ${STATUS_COLORS[idea.status] || 'bg-gray-100 text-gray-600'}`}
            >
              {idea.status.replace('_', ' ')}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {new Date(idea.created_at).toLocaleDateString()}
          </span>
        </div>

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

          {isAuthenticated && (
            <>
              <button
                onClick={() => handleIdeaVote('up')}
                disabled={votingIdea}
                className={`flex items-center gap-1 px-3 py-2 rounded transition-colors ${
                  idea.user_vote === 'up'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                } disabled:opacity-50`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">{idea.upvotes || 0}</span>
              </button>

              <button
                onClick={() => handleIdeaVote('down')}
                disabled={votingIdea}
                className={`flex items-center gap-1 px-3 py-2 rounded transition-colors ${
                  idea.user_vote === 'down'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:bg-gray-100'
                } disabled:opacity-50`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span className="text-sm font-medium">{idea.downvotes || 0}</span>
              </button>
            </>
          )}

          <span className="text-sm text-gray-500">by {idea.name}</span>
        </div>
      </div>

      {/* Comments section */}
      <div className="card">
        <h2 className="text-2xl font-bold text-navy mb-6">
          Comments {idea.comments?.length > 0 && `(${idea.comments.length})`}
        </h2>

        {idea.comments && idea.comments.length > 0 ? (
          <div className="space-y-4 mb-8">
            {idea.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-800">{comment.name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap mb-3">{comment.content}</p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCommentVote(comment.id, 'up')}
                    disabled={!isAuthenticated}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                      comment.user_vote === 'up'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    } disabled:opacity-50`}
                    title={!isAuthenticated ? 'Sign in to vote' : 'Upvote'}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{comment.upvotes || 0}</span>
                  </button>

                  <button
                    onClick={() => handleCommentVote(comment.id, 'down')}
                    disabled={!isAuthenticated}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                      comment.user_vote === 'down'
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    } disabled:opacity-50`}
                    title={!isAuthenticated ? 'Sign in to vote' : 'Downvote'}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span className="text-sm font-medium">{comment.downvotes || 0}</span>
                  </button>

                  {comment.reply_count > 0 && (
                    <div className="flex items-center gap-1 text-gray-600 ml-auto">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">
                        {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 mb-8">
            No comments yet. Be the first to comment!
          </div>
        )}

        {/* Comment form */}
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700 font-medium">
                Commenting as: {authenticatedSupporter?.name}
              </p>
              <p className="text-xs text-green-600">{authenticatedSupporter?.email}</p>
            </div>

            <div>
              <label htmlFor="comment-content" className="form-label">
                Your Comment
              </label>
              <textarea
                id="comment-content"
                rows={4}
                value={commentForm.content}
                onChange={(e) => setCommentForm({ content: e.target.value })}
                required
                className="form-input"
                placeholder="Share your thoughts..."
              />
            </div>

            {commentMsg && (
              <div
                className={`p-4 rounded-lg ${commentMsg.includes('submitted') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
              >
                {commentMsg}
              </div>
            )}

            <button type="submit" disabled={submittingComment} className="btn-primary w-full">
              {submittingComment ? 'Submitting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">
              You must be a registered supporter to post comments.
            </p>
            <Link href="/get-involved" className="btn-primary inline-block">
              Register as Supporter
            </Link>
          </div>
        )}
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
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
