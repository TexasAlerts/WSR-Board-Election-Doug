'use client';

import { useState, useCallback } from 'react';
import { logApiError } from '@/lib/clientErrorLogger';

export function usePollVoting() {
  const [voteForm, setVoteForm] = useState({
    email: '',
    name: '',
    selectedChoice: null,
    selectedChoices: [],
    rankings: [],
    comment: '',
    otherText: '',
  });
  const [submitMsg, setSubmitMsg] = useState('');
  const [votingMode, setVotingMode] = useState(null);

  const resetForm = useCallback(() => {
    setVoteForm({
      email: '',
      name: '',
      selectedChoice: null,
      selectedChoices: [],
      rankings: [],
      comment: '',
      otherText: '',
    });
    setSubmitMsg('');
  }, []);

  const setVoterInfo = useCallback((email, name) => {
    setVoteForm((prev) => ({ ...prev, email, name }));
  }, []);

  const toggleChoice = useCallback((choiceId) => {
    setVoteForm((prev) => {
      if (prev.selectedChoices.includes(choiceId)) {
        return {
          ...prev,
          selectedChoices: prev.selectedChoices.filter((id) => id !== choiceId),
        };
      }
      return {
        ...prev,
        selectedChoices: [...prev.selectedChoices, choiceId],
      };
    });
  }, []);

  const handleRankingClick = useCallback((choiceId) => {
    setVoteForm((prev) => {
      const currentRankings = [...prev.rankings];
      const existingIndex = currentRankings.indexOf(choiceId);

      if (existingIndex !== -1) {
        currentRankings.splice(existingIndex);
      } else {
        currentRankings.push(choiceId);
      }
      return { ...prev, rankings: currentRankings };
    });
  }, []);

  const getRankForChoice = useCallback(
    (choiceId) => {
      const index = voteForm.rankings.indexOf(choiceId);
      return index === -1 ? null : index + 1;
    },
    [voteForm.rankings]
  );

  const moveRanking = useCallback((choiceId, direction) => {
    setVoteForm((prev) => {
      const currentRankings = [...prev.rankings];
      const index = currentRankings.indexOf(choiceId);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= currentRankings.length) return prev;

      [currentRankings[index], currentRankings[newIndex]] = [
        currentRankings[newIndex],
        currentRankings[index],
      ];
      return { ...prev, rankings: currentRankings };
    });
  }, []);

  const submitVote = useCallback(
    async (pollId, pollType) => {
      setSubmitMsg('');

      const voteData = {
        comment: voteForm.comment || undefined,
        other_text: voteForm.otherText || undefined,
      };

      if (votingMode !== 'anonymous') {
        voteData.email = voteForm.email;
        voteData.name = voteForm.name;
      }

      if (pollType === 'single_choice') {
        if (!voteForm.selectedChoice) {
          setSubmitMsg('Please select an option');
          return { ok: false };
        }
        voteData.choice_id = voteForm.selectedChoice;
      } else if (pollType === 'multiple_choice') {
        if (voteForm.selectedChoices.length === 0) {
          setSubmitMsg('Please select at least one option');
          return { ok: false };
        }
        voteData.choice_ids = voteForm.selectedChoices;
      } else if (pollType === 'ranked_choice') {
        voteData.rankings = voteForm.rankings;
      }

      try {
        const res = await fetch(`/api/polls/${pollId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(voteData),
        });
        const result = await res.json();

        if (result.ok) {
          setSubmitMsg('Thank you for voting!');
          return { ok: true, email: voteForm.email || 'anonymous' };
        }
        setSubmitMsg(result.error || 'Error voting');
        return { ok: false };
      } catch (err) {
        await logApiError(`/api/polls/${pollId}/vote`, 'POST', err.status || 500, err.message, {
          userAgent: navigator.userAgent,
        });
        setSubmitMsg('Error submitting vote');
        return { ok: false };
      }
    },
    [voteForm, votingMode]
  );

  return {
    voteForm,
    setVoteForm,
    submitMsg,
    setSubmitMsg,
    votingMode,
    setVotingMode,
    resetForm,
    setVoterInfo,
    toggleChoice,
    handleRankingClick,
    getRankForChoice,
    moveRanking,
    submitVote,
  };
}
