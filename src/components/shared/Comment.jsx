'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Reusable threaded comment component with voting and reply functionality.
 *
 * @param {Object} props - Component props
 * @param {Object} props.comment - Comment data object
 * @param {boolean} props.isAuthenticated - Whether user is authenticated
 * @param {string} props.contextId - Poll ID or Idea ID for API calls
 * @param {Function} props.onVote - Vote handler (commentId, direction)
 * @param {Function} props.onReply - Reply handler (commentId)
 * @param {string|null} props.replyingTo - ID of comment being replied to
 * @param {string} props.replyText - Reply textarea value
 * @param {Function} props.setReplyText - Reply text setter
 * @param {Function} props.handleReplySubmit - Reply submit handler (parentId)
 * @param {Function} props.cancelReply - Cancel reply handler
 * @param {boolean} props.expanded - Whether replies are expanded
 * @param {Function} props.toggleReplies - Toggle replies visibility
 * @param {Function} props.loadReplies - Load replies function (commentId)
 * @param {number} props.depth - Nesting depth for indentation
 */
export default function Comment({
  comment,
  isAuthenticated,
  contextId,
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

  /**
   * Fetch replies when expanded for the first time
   */
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
          {/* Comment Header */}
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

          {/* Comment Content */}
          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.content}</p>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 text-sm">
            {/* Upvote */}
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

            {/* Downvote */}
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

            {/* Reply Button */}
            {isAuthenticated && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-gray-500 hover:text-navy"
              >
                Reply
              </button>
            )}

            {/* Toggle Replies */}
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
              <label htmlFor={`reply-${comment.id}`} className="sr-only">
                Reply to {comment.display_name || comment.name}
              </label>
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

          {/* Replies Loading State */}
          {expanded && loadingReplies && (
            <div className="mt-4 text-sm text-gray-500">Loading replies...</div>
          )}

          {/* Nested Replies */}
          {expanded && replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {replies.map(reply => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  isAuthenticated={isAuthenticated}
                  contextId={contextId}
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
