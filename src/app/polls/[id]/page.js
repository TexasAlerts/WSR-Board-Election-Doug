"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

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
  const [votingComment, setVotingComment] = useState(null);

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
        const errorMsg = result.error || 'Error submitting comment';
        setCommentMsg(errorMsg);

        // Log the error to admin dashboard
        await fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error_type: 'validation_error',
            error_message: `Comment submission failed: ${errorMsg}`,
            endpoint: `/polls/${params.id}`,
            context: JSON.stringify({
              pollId: params.id,
              hasContent: !!commentForm.content,
              contentLength: commentForm.content?.length,
              isReply: !!replyTo,
              statusCode: res.status,
            }),
          }),
        }).catch(() => {}); // Silently fail error logging
      }
    } catch (err) {
      const errorMsg = 'Error submitting comment';
      setCommentMsg(errorMsg);

      // Log the exception to admin dashboard
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_type: 'client_error',
          error_message: `Comment submission exception: ${err.message}`,
          error_stack: err.stack,
          endpoint: `/polls/${params.id}`,
          context: JSON.stringify({
            pollId: params.id,
            errorType: err.name,
          }),
        }),
      }).catch(() => {}); // Silently fail error logging
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleCommentVote(commentId, voteType) {
    if (!isAuthenticated && !verifiedVoter) {
      setCommentMsg('Please sign in or verify your email to vote on comments.');
      return;
    }

    setVotingComment(commentId);

    try {
      const res = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType }),
      });

      const result = await res.json();

      if (result.ok) {
        // Update the comment in poll.comments
        const updatedComments = poll.comments.map(c => {
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
        setPoll({ ...poll, comments: updatedComments });
      } else {
        setCommentMsg(result.error || 'Error voting on comment');
        setTimeout(() => setCommentMsg(''), 3000);
      }
    } catch (err) {
      setCommentMsg('Error voting on comment');
      setTimeout(() => setCommentMsg(''), 3000);
    } finally {
      setVotingComment(null);
    }
  }

  // Helper function to organize comments into a tree structure
  function organizeComments(comments) {
    if (!comments) return [];

    const commentMap = new Map();
    const rootComments = [];

    // First pass: create map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into tree
    comments.forEach(comment => {
      const commentNode = commentMap.get(comment.id);
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(commentNode);
        } else {
          // Parent not found, treat as root
          rootComments.push(commentNode);
        }
      } else {
        rootComments.push(commentNode);
      }
    });

    return rootComments;
  }

  // Recursive component for rendering nested comments
  function CommentThread({ comment, depth = 0 }) {
    const [showReplies, setShowReplies] = useState(true);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isVoting = votingComment === comment.id;
    const userVote = comment.user_vote;

    return (
      <div className={`${depth > 0 ? 'ml-8 pl-4 border-l-2 border-gray-200' : ''}`}>
        <div className="bg-gray-50 rounded-lg p-4 mb-3">
          <div className="flex justify-between items-start mb-2">
            <span className="font-medium text-gray-800">{comment.display_name || comment.name}</span>
            <span className="text-sm text-gray-500">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap mb-3">{comment.content}</p>

          {/* Voting and Reply buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Thumbs up */}
            <button
              onClick={() => handleCommentVote(comment.id, 'up')}
              disabled={(!isAuthenticated && !verifiedVoter) || isVoting}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                userVote === 'up'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              } disabled:opacity-50`}
              title={!isAuthenticated && !verifiedVoter ? 'Sign in or verify email to vote' : 'Upvote'}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-medium">{comment.upvotes || 0}</span>
            </button>

            {/* Thumbs down */}
            <button
              onClick={() => handleCommentVote(comment.id, 'down')}
              disabled={(!isAuthenticated && !verifiedVoter) || isVoting}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                userVote === 'down'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-600 hover:bg-gray-100'
              } disabled:opacity-50`}
              title={!isAuthenticated && !verifiedVoter ? 'Sign in or verify email to vote' : 'Downvote'}
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="text-sm font-medium">{comment.downvotes || 0}</span>
            </button>

            {/* Reply button */}
            {isAuthenticated && (
              <button
                onClick={() => setReplyTo(comment)}
                className="text-sm text-navy hover:underline ml-2"
              >
                Reply
              </button>
            )}

            {/* Toggle replies button */}
            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-sm text-gray-600 hover:text-navy ml-auto flex items-center gap-1"
              >
                <MessageSquare className="w-4 h-4" />
                {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                <span className="ml-1">{showReplies ? '▼' : '▶'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Nested replies */}
        {hasReplies && showReplies && (
          <div className="space-y-3 mb-3">
            {comment.replies.map(reply => (
              <CommentThread key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
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
          <h2 className="text-2xl font-bold text-navy mb-6">
            Comments {poll.comments?.length > 0 && `(${poll.comments.length})`}
          </h2>

          {/* Comments are visible to everyone - no verification check here */}
          {poll.comments && poll.comments.length > 0 ? (
            <div className="space-y-4 mb-8">
              {organizeComments(poll.comments).map((comment) => (
                <CommentThread key={comment.id} comment={comment} depth={0} />
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
