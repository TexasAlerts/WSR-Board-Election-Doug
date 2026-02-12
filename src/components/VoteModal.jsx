'use client';

import { useEffect, useRef, memo, useCallback } from 'react';

const VoteModal = memo(function VoteModal({
  poll,
  voteForm,
  setVoteForm,
  votingMode,
  authenticatedSupporter,
  verifiedVoter,
  submitMsg,
  onSubmit,
  onClose,
  toggleChoice,
  handleRankingClick,
  getRankForChoice,
  moveRanking,
}) {
  const voteModalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Memoize keyboard handler to prevent recreation on every render
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && voteModalRef.current) {
        const focusable = voteModalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Memoize choice click handlers to prevent recreation
  const handleChoiceClick = useCallback(
    (choiceId, isOther) => {
      if (poll.poll_type === 'single_choice') {
        setVoteForm({
          ...voteForm,
          selectedChoice: choiceId,
          otherText: isOther ? voteForm.otherText : '',
        });
      } else {
        toggleChoice(choiceId);
        if (!isOther) setVoteForm((prev) => ({ ...prev, otherText: '' }));
      }
    },
    [poll.poll_type, voteForm, setVoteForm, toggleChoice]
  );

  // Memoize other text change handler
  const handleOtherTextChange = useCallback(
    (e) => {
      setVoteForm({ ...voteForm, otherText: e.target.value });
    },
    [voteForm, setVoteForm]
  );

  // Memoize comment change handler
  const handleCommentChange = useCallback(
    (e) => {
      setVoteForm({ ...voteForm, comment: e.target.value });
    },
    [voteForm, setVoteForm]
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vote-modal-title"
    >
      <div
        ref={voteModalRef}
        tabIndex={-1}
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto pb-safe outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 id="vote-modal-title" className="text-2xl font-bold text-navy">
              {poll.title}
            </h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close vote form"
              className="text-gray-600 hover:text-gray-700 text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {poll.description && <p className="text-gray-600 mb-6">{poll.description}</p>}

          <form onSubmit={onSubmit} className="space-y-6">
            {votingMode === 'authenticated' && authenticatedSupporter ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">
                    Voting as: {authenticatedSupporter.name}
                  </p>
                  <p className="text-xs text-green-600">{authenticatedSupporter.email}</p>
                  <p className="text-xs text-green-500 mt-1">✓ Authenticated</p>
                </div>
                <span className="text-green-500 text-lg">&#10003;</span>
              </div>
            ) : votingMode === 'verified' && verifiedVoter ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">
                    Voting as: {verifiedVoter.name}
                  </p>
                  <p className="text-xs text-green-600">{verifiedVoter.email}</p>
                  <p className="text-xs text-green-500 mt-1">✓ Verified voter</p>
                </div>
                <span className="text-green-500 text-lg">&#10003;</span>
              </div>
            ) : votingMode === 'anonymous' ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div>
                  <p className="text-sm text-gray-700 font-medium">Voting anonymously</p>
                  <p className="text-xs text-gray-600 mt-1">
                    No personal information required. A cookie will be used to prevent duplicate
                    votes.
                  </p>
                </div>
              </div>
            ) : null}

            <div>
              <label className="form-label">
                {poll.poll_type === 'single_choice'
                  ? 'Select one option *'
                  : poll.poll_type === 'multiple_choice'
                    ? 'Select all that apply *'
                    : 'Rank your choices (click to add, click again to remove) *'}
              </label>

              {(poll.poll_type === 'single_choice' || poll.poll_type === 'multiple_choice') && (
                <div
                  className="space-y-2 mt-2"
                  role={poll.poll_type === 'single_choice' ? 'radiogroup' : 'group'}
                  aria-label={
                    poll.poll_type === 'single_choice'
                      ? 'Poll options'
                      : 'Poll options - select multiple'
                  }
                >
                  {poll.choices?.map((choice) => {
                    const isOther = choice.is_other_option;
                    const isSelected =
                      poll.poll_type === 'single_choice'
                        ? voteForm.selectedChoice === choice.id
                        : voteForm.selectedChoices.includes(choice.id);
                    return (
                      <div key={choice.id}>
                        <button
                          type="button"
                          role={poll.poll_type === 'single_choice' ? 'radio' : 'checkbox'}
                          aria-checked={isSelected}
                          onClick={() => handleChoiceClick(choice.id, isOther)}
                          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-navy bg-navy/5 text-navy'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-${poll.poll_type === 'single_choice' ? 'full' : 'md'} border-2 flex items-center justify-center ${
                                isSelected ? 'border-navy bg-navy text-white' : 'border-gray-300'
                              }`}
                            >
                              {isSelected && (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                            <span>{isOther ? 'Other' : choice.text || choice.choice_text}</span>
                          </div>
                        </button>
                        {isOther && isSelected && (
                          <>
                            <label htmlFor="poll-other-text" className="sr-only">
                              Specify your other option
                            </label>
                            <input
                              id="poll-other-text"
                              type="text"
                              value={voteForm.otherText}
                              onChange={handleOtherTextChange}
                              placeholder="Please specify..."
                              className="form-input mt-2 ml-8"
                              maxLength={500}
                              required
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {poll.poll_type === 'ranked_choice' && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700 mb-3">
                    Click choices in order of preference. Your first click is your top choice.
                  </p>
                  <div className="space-y-2">
                    {poll.choices?.map((choice) => {
                      const rank = getRankForChoice(choice.id);
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() => handleRankingClick(choice.id)}
                          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                            rank !== null
                              ? 'border-navy bg-navy/5 text-navy'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-base sm:text-lg ${
                                  rank !== null
                                    ? 'border-navy bg-navy text-white'
                                    : 'border-gray-300 text-gray-700'
                                }`}
                                aria-label={
                                  rank !== null ? `Ranked number ${rank}` : 'Not yet ranked'
                                }
                              >
                                {rank !== null ? rank : '-'}
                              </div>
                              <span>{choice.text || choice.choice_text}</span>
                            </div>
                            {rank !== null && (
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveRanking(choice.id, 'up');
                                  }}
                                  disabled={rank === 1}
                                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:text-navy hover:bg-gray-100 rounded-lg disabled:opacity-30"
                                  aria-label={`Move ${choice.text || choice.choice_text} up`}
                                  title="Move up"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 15l7-7 7 7"
                                    />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveRanking(choice.id, 'down');
                                  }}
                                  disabled={rank === voteForm.rankings.length}
                                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:text-navy hover:bg-gray-100 rounded-lg disabled:opacity-30"
                                  aria-label={`Move ${choice.text || choice.choice_text} down`}
                                  title="Move down"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {voteForm.rankings.length > 0 &&
                    voteForm.rankings.length < (poll.choices?.length || 0) && (
                      <p className="text-sm text-amber-600 mt-2">
                        {(poll.choices?.length || 0) - voteForm.rankings.length} more choice(s) to
                        rank
                      </p>
                    )}
                </div>
              )}
            </div>

            {poll.allow_comments && votingMode === 'authenticated' && (
              <div>
                <label htmlFor="poll-vote-comment" className="form-label">
                  Comment (optional)
                </label>
                <textarea
                  id="poll-vote-comment"
                  rows={3}
                  value={voteForm.comment}
                  onChange={handleCommentChange}
                  className="form-input"
                  placeholder="Share your thoughts..."
                />
                <p className="text-xs text-gray-700 mt-1">
                  Comments are only available for registered users
                </p>
              </div>
            )}

            {submitMsg && (
              <div
                role="alert"
                aria-live="polite"
                className={`p-4 rounded-lg ${submitMsg.includes('Thank') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
              >
                {submitMsg}
              </div>
            )}

            <button type="submit" className="btn-primary w-full">
              Submit Vote
            </button>
          </form>
        </div>
      </div>
    </div>
  );
});

VoteModal.displayName = 'VoteModal';

export default VoteModal;
