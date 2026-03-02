'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import Link from 'next/link';

/**
 * Shared Comment component for displaying and managing comments
 * Used by both Poll and Idea detail pages
 *
 * @param {Object} props
 * @param {Array} props.comments - Array of comments to display
 * @param {boolean} props.isAuthenticated - Whether user is authenticated
 * @param {Object} props.authenticatedSupporter - Current authenticated supporter data
 * @param {boolean} props.allowReplies - Whether to show reply functionality (polls only)
 * @param {Function} props.onCommentSubmit - Handler for comment submission
 * @param {Function} props.onCommentVote - Handler for comment voting
 * @param {string} props.entityType - Type of entity ('poll' or 'idea')
 * @param {boolean} props.verifiedVoter - Whether user is a verified voter (polls only)
 */
export default function Comment({
  comments = [],
  isAuthenticated = false,
  authenticatedSupporter = null,
  allowReplies = false,
  onCommentSubmit,
  onCommentVote,
  entityType = 'idea',
  verifiedVoter = null,
}) {
  const [commentForm, setCommentForm] = useState({ content: '' });
  const [commentMsg, setCommentMsg] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [votingComment, setVotingComment] = useState(null);

  // Helper function to organize comments into a tree structure (for polls with replies)
  function organizeComments(commentsList) {
    if (!commentsList || !allowReplies) return commentsList;

    const commentMap = new Map();
    const rootComments = [];

    // First pass: create map of all comments
    commentsList.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into tree
    commentsList.forEach((comment) => {
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

  // Recursive component for rendering nested comments (polls only)
  function CommentThread({ comment, depth = 0 }) {
    const [showReplies, setShowReplies] = useState(true);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isVoting = votingComment === comment.id;
    const userVote = comment.user_vote;

    return (
      <div className={`${depth > 0 ? 'ml-8 pl-4 border-l-2 border-gray-200' : ''}`}>
        <div className="bg-gray-50 rounded-lg p-4 mb-3">
          <div className="flex justify-between items-start mb-2">
            <span className="font-medium text-gray-800">
              {comment.display_name || comment.name}
            </span>
            <span className="text-sm text-gray-700">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap mb-3">{comment.content}</p>

          {/* Voting and Reply buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Thumbs up */}
            <button
              onClick={() => handleCommentVoteClick(comment.id, 'up')}
              disabled={(!isAuthenticated && !verifiedVoter) || isVoting}
              className={`flex items-center gap-1 px-2 py-1 min-h-[44px] rounded transition-colors ${
                userVote === 'up'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              } disabled:opacity-50`}
              aria-label={`Upvote this comment (${comment.upvotes || 0} upvotes)`}
              title={
                !isAuthenticated && !verifiedVoter ? 'Sign in or verify email to vote' : 'Upvote'
              }
            >
              <ThumbsUp className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">{comment.upvotes || 0}</span>
            </button>

            {/* Thumbs down */}
            <button
              onClick={() => handleCommentVoteClick(comment.id, 'down')}
              disabled={(!isAuthenticated && !verifiedVoter) || isVoting}
              className={`flex items-center gap-1 px-2 py-1 min-h-[44px] rounded transition-colors ${
                userVote === 'down' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'
              } disabled:opacity-50`}
              aria-label={`Downvote this comment (${comment.downvotes || 0} downvotes)`}
              title={
                !isAuthenticated && !verifiedVoter ? 'Sign in or verify email to vote' : 'Downvote'
              }
            >
              <ThumbsDown className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">{comment.downvotes || 0}</span>
            </button>

            {/* Reply button (polls only) */}
            {allowReplies && isAuthenticated && (
              <button
                onClick={() => setReplyTo(comment)}
                className="text-sm text-navy hover:underline ml-2"
                aria-label={`Reply to comment by ${comment.display_name}`}
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
            {comment.replies.map((reply) => (
              <CommentThread key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Simple comment display (ideas - no replies)
  function SimpleComment({ comment }) {
    const userVote = comment.user_vote;

    return (
      <article className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="font-medium text-gray-800">{comment.name}</span>
          <span className="text-sm text-gray-700">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap mb-3">{comment.content}</p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleCommentVoteClick(comment.id, 'up')}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1 px-2 py-1 min-h-[44px] rounded transition-colors ${
              userVote === 'up' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
            } disabled:opacity-50`}
            aria-label={`Upvote this comment (${comment.upvotes || 0} upvotes)`}
            title={!isAuthenticated ? 'Sign in to vote' : 'Upvote'}
          >
            <ThumbsUp className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium">{comment.upvotes || 0}</span>
          </button>

          <button
            onClick={() => handleCommentVoteClick(comment.id, 'down')}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1 px-2 py-1 min-h-[44px] rounded transition-colors ${
              userVote === 'down' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'
            } disabled:opacity-50`}
            aria-label={`Downvote this comment (${comment.downvotes || 0} downvotes)`}
            title={!isAuthenticated ? 'Sign in to vote' : 'Downvote'}
          >
            <ThumbsDown className="w-4 h-4" aria-hidden="true" />
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
      </article>
    );
  }

  async function handleCommentVoteClick(commentId, voteType) {
    setVotingComment(commentId);

    try {
      await onCommentVote(commentId, voteType);
    } catch (err) {
      setCommentMsg('Error voting on comment');
      setTimeout(() => setCommentMsg(''), 3000);
    } finally {
      setVotingComment(null);
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    if (!isAuthenticated) {
      setCommentMsg('Please sign in as a registered supporter to post comments.');
      return;
    }

    setSubmittingComment(true);
    setCommentMsg('');

    try {
      const result = await onCommentSubmit({
        content: commentForm.content,
        parent_id: replyTo?.id,
      });

      if (result.ok) {
        setCommentMsg('Your comment has been submitted for review.');
        setCommentForm({ content: '' });
        setReplyTo(null);
      } else {
        setCommentMsg(result.error || 'Error submitting comment');
      }
    } catch (err) {
      setCommentMsg('Error submitting comment');
    } finally {
      setSubmittingComment(false);
    }
  }

  const organizedComments = organizeComments(comments);

  return (
    <section id="comments" className="card scroll-mt-4" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="text-2xl font-bold text-navy mb-6">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-4 mb-8">
          {allowReplies
            ? organizedComments.map((comment) => (
                <CommentThread key={comment.id} comment={comment} depth={0} />
              ))
            : comments.map((comment) => <SimpleComment key={comment.id} comment={comment} />)}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-700 mb-8">
          No comments yet. Be the first to comment!
        </div>
      )}

      {/* Comment form - only shown to authenticated supporters */}
      {isAuthenticated ? (
        <div>
          {replyTo && allowReplies && (
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

          <form onSubmit={handleFormSubmit} className="space-y-4">
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
                aria-required="true"
                aria-describedby={commentMsg ? 'comment-message' : undefined}
                className="form-input"
                placeholder="Share your thoughts..."
              />
            </div>

            {commentMsg && (
              <div
                id="comment-message"
                role="alert"
                aria-live="polite"
                className={`p-4 rounded-lg ${commentMsg.includes('submitted') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
              >
                {commentMsg}
              </div>
            )}

            <button type="submit" disabled={submittingComment} className="btn-primary w-full">
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
    </section>
  );
}
