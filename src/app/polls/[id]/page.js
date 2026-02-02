"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentForm, setCommentForm] = useState({ content: '', name: '', email: '' });
  const [commentMsg, setCommentMsg] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [verifiedVoter, setVerifiedVoter] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedSupporter, setAuthenticatedSupporter] = useState(null);

  useEffect(() => {
    async function loadPoll() {
      try {
        const res = await fetch(`/api/polls/${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Poll not found');
          setLoading(false);
          return;
        }

        setPoll(data.data);
      } catch (err) {
        setError('Error loading poll');
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
          setCommentForm(prev => ({
            ...prev,
            name: data.data.name,
            email: data.data.email
          }));
          return;
        }
      } catch (err) {
        // Not authenticated
      }

      // Check for verified voter
      try {
        const voterRes = await fetch('/api/verified-voters/me');
        const voterData = await voterRes.json();
        if (voterData.ok && voterData.data) {
          setVerifiedVoter({
            email: voterData.data.email,
            name: voterData.data.name
          });
          setCommentForm(prev => ({
            ...prev,
            name: voterData.data.name,
            email: voterData.data.email
          }));
        }
      } catch (err) {
        // Not a verified voter
      }
    }

    loadPoll();
    checkAuth();
  }, [params.id]);

  async function handleCommentSubmit(e) {
    e.preventDefault();

    // Check if user is authenticated (verified voters are not yet supported for comments)
    if (!isAuthenticated) {
      setCommentMsg('Please sign in as a registered supporter to post comments.');
      return;
    }

    setSubmittingComment(true);
    setCommentMsg('');

    try {
      const payload = {
        poll_id: params.id,
        content: commentForm.content,
      };

      // Only include parent_id if replying to a comment
      if (replyTo?.id) {
        payload.parent_id = replyTo.id;
      }

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.ok) {
        setCommentMsg('Your comment has been submitted for review.');
        setCommentForm({ content: '', name: commentForm.name, email: commentForm.email });
        setReplyTo(null);
        // Reload poll to get updated comments
        const pollRes = await fetch(`/api/polls/${params.id}`);
        const pollData = await pollRes.json();
        if (pollData.ok) {
          setPoll(pollData.data);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center text-gray-500">Loading poll...</div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="card text-center py-12">
          <h2 className="text-xl font-bold text-navy mb-4">Poll Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This poll does not exist.'}</p>
          <Link href="/polls" className="btn-primary">
            Back to Polls
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href="/polls"
        className="inline-flex items-center gap-2 text-navy hover:underline mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Polls
      </Link>

      {/* Poll header */}
      <div className="card mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold text-navy">{poll.title}</h1>
          <span className="px-3 py-1 bg-navy/10 text-navy text-sm rounded-full font-medium">
            {poll.poll_type === 'single_choice' ? 'Single Choice' : poll.poll_type === 'multiple_choice' ? 'Multiple Choice' : 'Ranked Choice'}
          </span>
        </div>

        {poll.description && (
          <p className="text-gray-600 mb-6">{poll.description}</p>
        )}

        <div className="text-sm text-gray-500">
          {poll.total_votes} vote{poll.total_votes !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Results */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-navy mb-6">Results</h2>
        <div className="space-y-4">
          {poll.choices?.map((choice) => (
            <div key={choice.id}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">{choice.text}</span>
                <span className="text-gray-600 font-semibold">{choice.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-prosper-red h-full rounded-full transition-all duration-500"
                  style={{ width: `${choice.percentage}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {choice.votes} vote{choice.votes !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments section */}
      {poll.allow_comments && (
        <div className="card">
          <h2 className="text-2xl font-bold text-navy mb-6">Comments</h2>

          {/* Comments are visible to everyone - no verification check here */}
          {poll.comments && poll.comments.length > 0 ? (
            <div className="space-y-4 mb-8">
              {poll.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-800">{comment.display_name || comment.name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  {isAuthenticated && (
                    <button
                      onClick={() => setReplyTo(comment)}
                      className="text-sm text-navy hover:underline mt-2"
                    >
                      Reply
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 mb-8">
              No comments yet. Be the first to comment!
            </div>
          )}

          {/* Comment form - only shown to authenticated supporters */}
          {isAuthenticated ? (
            <div>
              {replyTo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    Replying to {replyTo.display_name || replyTo.name}
                  </span>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700 font-medium">Commenting as: {authenticatedSupporter.name}</p>
                  <p className="text-xs text-green-600">{authenticatedSupporter.email}</p>
                </div>

                <div>
                  <label htmlFor="comment-content" className="form-label">Your Comment</label>
                  <textarea
                    id="comment-content"
                    rows={4}
                    value={commentForm.content}
                    onChange={e => setCommentForm({ ...commentForm, content: e.target.value })}
                    required
                    className="form-input"
                    placeholder="Share your thoughts..."
                  />
                </div>

                {commentMsg && (
                  <div className={`p-4 rounded-lg ${commentMsg.includes('submitted') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {commentMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingComment}
                  className="btn-primary w-full"
                >
                  {submittingComment ? 'Submitting...' : 'Post Comment'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">You must be a registered supporter to post comments.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/get-involved" className="btn-primary">
                  Register as Supporter
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
