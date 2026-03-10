'use client';

import { useState, useCallback } from 'react';
import { logApiError } from '@/lib/clientErrorLogger';
import { useCSRF } from './useCSRF';

export function useIdeaVoting(ideaId) {
  const [votingIdea, setVotingIdea] = useState(false);
  const [error, setError] = useState('');
  const { token: csrfToken, refreshToken } = useCSRF();

  const handleIdeaVote = useCallback(
    async (voteType) => {
      setVotingIdea(true);
      setError('');

      try {
        const res = await fetch(`/api/ideas/${ideaId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
          body: JSON.stringify({ vote_type: voteType }),
        });

        if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
        const result = await res.json();

        if (result.ok) {
          await refreshToken();
          const ideaRes = await fetch(`/api/ideas/${ideaId}`);
          if (!ideaRes.ok) throw Object.assign(new Error(`HTTP ${ideaRes.status}`), { status: ideaRes.status });
          const ideaData = await ideaRes.json();
          if (ideaData.ok) {
            return { ok: true, idea: ideaData.data };
          }
        }
        setError(result.error || 'Error voting on idea');
        return { ok: false };
      } catch (err) {
        await logApiError(`/api/ideas/${ideaId}/vote`, 'POST', err.status || 500, err.message, { context: 'handleIdeaVote' });
        setError('Error voting on idea');
        return { ok: false };
      } finally {
        setVotingIdea(false);
      }
    },
    [ideaId, csrfToken, refreshToken]
  );

  return {
    votingIdea,
    handleIdeaVote,
    error,
    setError,
  };
}
