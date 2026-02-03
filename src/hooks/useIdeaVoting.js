'use client';

import { useState, useCallback } from 'react';

export function useIdeaVoting(ideaId) {
  const [votingIdea, setVotingIdea] = useState(false);
  const [error, setError] = useState('');

  const handleIdeaVote = useCallback(
    async (voteType) => {
      setVotingIdea(true);
      setError('');

      try {
        const res = await fetch(`/api/ideas/${ideaId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote_type: voteType }),
        });

        const result = await res.json();

        if (result.ok) {
          const ideaRes = await fetch(`/api/ideas/${ideaId}`);
          const ideaData = await ideaRes.json();
          if (ideaData.ok) {
            return { ok: true, idea: ideaData.data };
          }
        }
        setError(result.error || 'Error voting on idea');
        return { ok: false };
      } catch (err) {
        setError('Error voting on idea');
        return { ok: false };
      } finally {
        setVotingIdea(false);
      }
    },
    [ideaId]
  );

  return {
    votingIdea,
    handleIdeaVote,
    error,
    setError,
  };
}
