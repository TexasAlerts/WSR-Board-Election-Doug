"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, MessageSquare, ChevronDown, ChevronUp, Send } from 'lucide-react';

export default function PollDetailDynamic({ pollId }) {
  const [poll, setPoll] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Comment form state
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Reply state
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => {
    loadPoll();

    // Reload poll data when window regains focus (e.g., after signing in)
    const handleFocus = () => {
      loadPoll();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollId]);

  async function loadPoll() {
    try {
      const res = await fetch(`/api/polls/${pollId}`);
      const data = await res.json();

      if (!data.ok) {
        setError(data.error || 'Failed to load poll');
        return;
      }

      setPoll(data.data);
      setIsAuthenticated(data.isAuthenticated);
      await loadComments();
    } catch (err) {
      setError('Failed to load poll');
    } finally {
      setLoading(false);
    }
  }

  async function loadComments() {
    try {
      const res = await fetch(`/api/comments?poll_id=${pollId}`);
      const data = await res.json();

      if (data.ok) {
        setComments(data.data || []);
      }
    } catch (err) {
      // Silent fail for comments
    }
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();

    if (!isAuthenticated) {
      setSubmitMessage('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      setSubmitMessage('Comment cannot be empty');
      return;
    }

    setSubmitting(true);
    setSubmitMessage('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poll_id: pollId,
          content: newComment.trim(),
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setSubmitMessage('Comment submitted for approval. It will appear after moderation.');
        setNewComment('');
      } else {
        setSubmitMessage(data.error || 'Failed to post comment');
      }
    } catch (err) {
      setSubmitMessage('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReplySubmit(parentId) {
    if (!isAuthenticated) {
      alert('Please sign in to reply');
      return;
    }

    if (!replyText.trim()) {
      return;
    }

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poll_id: pollId,
          parent_id: parentId,
          content: replyText.trim(),
        }),
      });

      const data = await res.json();

      if (data.ok) {
        alert('Reply submitted for approval');
        setReplyText('');
        setReplyingTo(null);
      } else {
        alert(data.error || 'Failed to post reply');
      }
    } catch (err) {
      alert('Failed to post reply');
    }
  }

  async function handleVote(commentId, voteType) {
    if (!isAuthenticated) {
      alert('Please sign in to vote');
      return;
    }

    try {
      const res = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType }),
      });

      if (res.ok) {
        await loadComments();
      }
    } catch (err) {
      // Silent fail
    }
  }

  function toggleReplies(commentId) {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  }

  async function loadReplies(commentId) {
    try {
      const res = await fetch(`/api/comments/${commentId}/replies`);
      const data = await res.json();

      return data.ok ? data.data : [];
    } catch (err) {
      return [];
    }
  }

  if (loading) {
    return (
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-gray-500" role="status" aria-live="polite">Loading poll...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-navy mb-4">Poll Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/polls" className="btn-primary">
              ← Back to Polls
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Poll Results */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Poll Title */}
          <div className="card mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold text-navy">{poll.title}</h2>
              <span className="px-3 py-1 bg-navy/10 text-navy text-sm rounded-full font-medium whitespace-nowrap">
                {poll.poll_type === 'single_choice' ? 'Single Choice' : 'Multiple Choice'}
              </span>
            </div>

            {poll.description && (
              <p className="text-gray-600 mb-6">{poll.description}</p>
            )}

            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <span className="text-prosper-red font-semibold">
                {poll.total_votes} vote{poll.total_votes !== 1 ? 's' : ''}
              </span>
              {!poll.user_voted && poll.can_vote && (
                <Link href="/polls" className="text-navy hover:underline">
                  ← Back to vote
                </Link>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="card mb-8">
            <h3 className="text-xl font-bold text-navy mb-6">Results</h3>
            <div className="space-y-4">
              {poll.choices?.map(choice => (
                <div key={choice.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-navy">{choice.text}</span>
                    <span className="text-sm font-semibold text-prosper-red">
                      {choice.percentage}% ({choice.votes})
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-prosper-red to-prosper-red/80 rounded-full transition-all duration-500"
                      style={{ width: `${choice.percentage}%` }}
                      role="progressbar"
                      aria-valuenow={choice.percentage}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-label={`${choice.text}: ${choice.percentage}%`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          {poll.allow_comments && (
            <div className="card">
              <h3 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Discussion ({comments.length})
              </h3>

              {/* New Comment Form */}
              {isAuthenticated ? (
                <form onSubmit={handleCommentSubmit} className="mb-8 pb-8 border-b border-gray-100">
                  <label htmlFor="new-comment" className="sr-only">Add a comment</label>
                  <textarea
                    id="new-comment"
                    rows={3}
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Add your thoughts..."
                    className="form-input mb-3"
                    disabled={submitting}
                  />
                  {submitMessage && (
                    <div
                      role="alert"
                      className={`mb-3 p-3 rounded-lg text-sm ${
                        submitMessage.includes('submitted') || submitMessage.includes('approval')
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {submitMessage}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Submitting...' : 'Post Comment'}
                  </button>
                </form>
              ) : (
                <div className="mb-8 pb-8 border-b border-gray-100 bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600 mb-3">Please sign in to join the discussion</p>
                  <Link href="/auth/login" className="btn-primary inline-block">
                    Sign In
                  </Link>
                </div>
              )}

              {/* Comments List */}
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
              ) : (
                <div className="space-y-6">
                  {comments.map(comment => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      isAuthenticated={isAuthenticated}
                      pollId={pollId}
                      onVote={handleVote}
                      onReply={(commentId) => {
                        setReplyingTo(commentId);
                        setReplyText('');
                      }}
                      replyingTo={replyingTo}
                      replyText={replyText}
                      setReplyText={setReplyText}
                      handleReplySubmit={handleReplySubmit}
                      cancelReply={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      expanded={expandedComments[comment.id]}
                      toggleReplies={() => toggleReplies(comment.id)}
                      loadReplies={loadReplies}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link href="/polls" className="btn-primary">
              ← Back to All Polls
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Comment({
  comment,
  isAuthenticated,
  pollId,
  onVote,
  onReply,
  replyingTo,
  replyText,
  setReplyText,
  handleReplySubmit,
  cancelReply,
  expanded,
  toggleReplies,
  loadReplies,
  depth = 0
}) {
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  async function fetchReplies() {
    if (expanded || comment.reply_count === 0) return;

    setLoadingReplies(true);
    const data = await loadReplies(comment.id);
    setReplies(data);
    setLoadingReplies(false);
  }

  useEffect(() => {
    if (expanded && comment.reply_count > 0 && replies.length === 0) {
      fetchReplies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const isReplying = replyingTo === comment.id;
  const marginLeft = depth > 0 ? 'ml-8 sm:ml-12' : '';

  return (
    <div className={`${marginLeft} ${depth > 0 ? 'border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="font-semibold text-navy">{comment.display_name || comment.name}</span>
              <span className="text-sm text-gray-500 ml-2">
                {new Date(comment.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => onVote(comment.id, 'up')}
              disabled={!isAuthenticated}
              className={`flex items-center gap-1 ${
                comment.user_vote === 'up'
                  ? 'text-prosper-red font-semibold'
                  : 'text-gray-500 hover:text-prosper-red'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={`Upvote comment from ${comment.display_name || comment.name}`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{comment.upvotes || 0}</span>
            </button>

            <button
              onClick={() => onVote(comment.id, 'down')}
              disabled={!isAuthenticated}
              className={`flex items-center gap-1 ${
                comment.user_vote === 'down'
                  ? 'text-gray-700 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={`Downvote comment from ${comment.display_name || comment.name}`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{comment.downvotes || 0}</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-gray-500 hover:text-navy"
              >
                Reply
              </button>
            )}

            {comment.reply_count > 0 && (
              <button
                onClick={toggleReplies}
                className="flex items-center gap-1 text-navy hover:underline"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <label htmlFor={`reply-${comment.id}`} className="sr-only">Reply to {comment.display_name || comment.name}</label>
              <textarea
                id={`reply-${comment.id}`}
                rows={2}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="form-input mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleReplySubmit(comment.id)}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Submit Reply
                </button>
                <button
                  onClick={cancelReply}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Replies */}
          {expanded && loadingReplies && (
            <div className="mt-4 text-sm text-gray-500">Loading replies...</div>
          )}

          {expanded && replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {replies.map(reply => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  isAuthenticated={isAuthenticated}
                  pollId={pollId}
                  onVote={onVote}
                  onReply={onReply}
                  replyingTo={replyingTo}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  handleReplySubmit={handleReplySubmit}
                  cancelReply={cancelReply}
                  expanded={false}
                  toggleReplies={() => {}}
                  loadReplies={loadReplies}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
