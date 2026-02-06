'use client';

import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

export default function CommentList({ comments, isAuthenticated, onVote }) {
  if (!comments || comments.length === 0) {
    return (
      <div role="status" aria-live="polite" className="text-center py-8 text-gray-700 mb-8">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="font-medium text-gray-800">{comment.name}</span>
            <span className="text-sm text-gray-700">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap mb-3">{comment.content}</p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onVote(comment.id, 'up')}
              disabled={!isAuthenticated}
              className={`flex items-center gap-1 px-2 py-1 min-h-[44px] min-w-[44px] rounded transition-colors ${
                comment.user_vote === 'up'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-700 hover:bg-gray-100'
              } disabled:opacity-70`}
              aria-label={
                !isAuthenticated
                  ? 'Sign in to upvote this comment'
                  : `Upvote this comment (${comment.upvotes || 0} upvotes)`
              }
            >
              <ThumbsUp className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">{comment.upvotes || 0}</span>
            </button>

            <button
              onClick={() => onVote(comment.id, 'down')}
              disabled={!isAuthenticated}
              className={`flex items-center gap-1 px-2 py-1 min-h-[44px] min-w-[44px] rounded transition-colors ${
                comment.user_vote === 'down'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-700 hover:bg-gray-100'
              } disabled:opacity-70`}
              aria-label={
                !isAuthenticated
                  ? 'Sign in to downvote this comment'
                  : `Downvote this comment (${comment.downvotes || 0} downvotes)`
              }
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
        </div>
      ))}
    </div>
  );
}
