'use client';

import Link from 'next/link';

export default function CommentForm({
  isAuthenticated,
  authenticatedSupporter,
  commentForm,
  setCommentForm,
  commentMsg,
  submittingComment,
  onSubmit,
}) {
  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-4">
          You must be a registered supporter to post comments.
        </p>
        <Link href="/get-involved" className="btn-primary inline-block">
          Register as Supporter
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          aria-describedby={commentMsg ? 'comment-message' : undefined}
        />
      </div>

      {commentMsg && (
        <div
          id="comment-message"
          role={commentMsg.includes('submitted') ? 'status' : 'alert'}
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
  );
}
