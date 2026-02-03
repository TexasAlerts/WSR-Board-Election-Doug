'use client';

import { useState, useCallback } from 'react';

export function useCommentThread(ideaId) {
  const [commentForm, setCommentForm] = useState({ content: '' });
  const [commentMsg, setCommentMsg] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleCommentSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmittingComment(true);
      setCommentMsg('');

      try {
        const res = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idea_id: ideaId,
            content: commentForm.content,
          }),
        });

        const result = await res.json();

        if (result.ok) {
          setCommentMsg('Your comment has been submitted for review.');
          setCommentForm({ content: '' });

          const ideaRes = await fetch(`/api/ideas/${ideaId}`);
          const ideaData = await ideaRes.json();
          if (ideaData.ok) {
            return { ok: true, idea: ideaData.data };
          }
        }
        setCommentMsg(result.error || 'Error submitting comment');
        return { ok: false };
      } catch (err) {
        setCommentMsg('Error submitting comment');
        return { ok: false };
      } finally {
        setSubmittingComment(false);
      }
    },
    [ideaId, commentForm.content]
  );

  const handleCommentVote = useCallback(async (commentId, voteType, comments) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType }),
      });

      const result = await res.json();

      if (result.ok) {
        const updatedComments = comments.map((c) => {
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
        return { ok: true, comments: updatedComments };
      }
      setCommentMsg(result.error || 'Error voting on comment');
      setTimeout(() => setCommentMsg(''), 3000);
      return { ok: false };
    } catch (err) {
      setCommentMsg('Error voting on comment');
      setTimeout(() => setCommentMsg(''), 3000);
      return { ok: false };
    }
  }, []);

  const resetCommentForm = useCallback(() => {
    setCommentForm({ content: '' });
    setCommentMsg('');
  }, []);

  return {
    commentForm,
    setCommentForm,
    commentMsg,
    setCommentMsg,
    submittingComment,
    handleCommentSubmit,
    handleCommentVote,
    resetCommentForm,
  };
}
