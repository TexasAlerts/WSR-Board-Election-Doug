'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import PollCard from './PollCard';
import { usePollVoting } from '../hooks/usePollVoting';
import { useCSRF } from '../hooks/useCSRF';
import { logApiError } from '@/lib/clientErrorLogger';
import { Loader2 } from 'lucide-react';

// Lazy load modals - they're only needed on user interaction
const VerifiedVoterModal = dynamic(() => import('./VerifiedVoterModal'), {
  loading: () => null,
  ssr: false,
});
const VotingOptionsModal = dynamic(() => import('./VotingOptionsModal'), {
  loading: () => null,
  ssr: false,
});
const VoteModal = dynamic(() => import('./VoteModal'), {
  loading: () => null,
  ssr: false,
});

export default function PollsDynamic({ initialPolls = [] }) {
  const [polls, setPolls] = useState(initialPolls);
  const [loading, setLoading] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [hasVoted, setHasVoted] = useState({});
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showVotingOptionsModal, setShowVotingOptionsModal] = useState(false);
  const [pendingPoll, setPendingPoll] = useState(null);
  const [verifiedVoter, setVerifiedVoter] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedSupporter, setAuthenticatedSupporter] = useState(null);
  const { token: csrfToken, refreshToken } = useCSRF();

  const {
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
  } = usePollVoting();

  useEffect(() => {
    // Only fetch if we need fresh data (e.g., after voting)
    async function loadPolls() {
      // If we have initial polls and aren't authenticated, skip the fetch
      if (initialPolls.length > 0 && !isAuthenticated) {
        return;
      }

      try {
        setLoading(true);
        const res = await fetch('/api/polls');
        const data = await res.json();
        if (data.ok) {
          setPolls(data.data || []);
          setIsAuthenticated(data.isAuthenticated || false);
        }
      } catch (err) {
        await logApiError('/api/polls', 'GET', err.status || 500, err.message, { context: 'loadPolls' });
      } finally {
        setLoading(false);
      }
    }

    // Only load polls if we don't have initial data
    if (initialPolls.length === 0) {
      loadPolls();
    }

    // Check for authenticated supporter
    async function checkAuth() {
      try {
        const res = await fetch('/api/supporter/me');
        const data = await res.json();
        if (data.ok && data.data) {
          setIsAuthenticated(true);
          setAuthenticatedSupporter(data.data);
          // Use authenticated supporter info as verified voter
          setVerifiedVoter({
            email: data.data.email,
            name: data.data.name,
          });
          return; // Stop here if authenticated
        }
      } catch (err) {
        // Not authenticated, that's expected - no need to log
      }

      // If not authenticated, check for verified voter cookie
      try {
        const voterRes = await fetch('/api/verified-voters/me');
        const voterData = await voterRes.json();
        if (voterData.ok && voterData.data) {
          setVerifiedVoter({
            email: voterData.data.email,
            name: voterData.data.name,
          });
        }
      } catch (err) {
        // Not a verified voter either, that's expected - no need to log
      }
    }
    checkAuth();

    // Fetch voted polls from API instead of localStorage
    async function loadVotedPolls() {
      try {
        const res = await fetch('/api/polls/my-votes');
        const data = await res.json();
        if (data.ok) {
          setHasVoted(data.data || {});
        }
      } catch (err) {
        await logApiError('/api/polls/my-votes', 'GET', err.status || 500, err.message, { context: 'loadVotedPolls' });
        setHasVoted({});
      }
    }
    loadVotedPolls();

    // Reload authentication when window regains focus (e.g., after signing in)
    const handleFocus = () => {
      checkAuth();
      loadPolls();
      loadVotedPolls();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleVoteClick(poll) {
    if (isAuthenticated && authenticatedSupporter) {
      setVotingMode('authenticated');
      setSelectedPoll(poll);
      setVoterInfo(authenticatedSupporter.email, authenticatedSupporter.name);
    } else if (verifiedVoter) {
      setVotingMode('verified');
      setSelectedPoll(poll);
      setVoterInfo(verifiedVoter.email, verifiedVoter.name);
    } else {
      setPendingPoll(poll);
      setShowVotingOptionsModal(true);
    }
  }

  function handleVotingOption(option) {
    setShowVotingOptionsModal(false);

    if (option === 'register') {
      window.location.href = '/auth/register';
    } else if (option === 'verify') {
      setShowVerifyModal(true);
    } else if (option === 'anonymous') {
      setVotingMode('anonymous');
      setSelectedPoll(pendingPoll);
      resetForm();
      setPendingPoll(null);
    }
  }

  function handleVerified(voter) {
    setVerifiedVoter(voter);
    setShowVerifyModal(false);
    if (pendingPoll) {
      setVotingMode('verified');
      setSelectedPoll(pendingPoll);
      setVoterInfo(voter.email, voter.name);
      setPendingPoll(null);
    }
  }

  async function handleVote(e) {
    e.preventDefault();
    if (!selectedPoll) return;

    const result = await submitVote(selectedPoll.id, selectedPoll.poll_type, csrfToken);

    if (result.ok) {
      setHasVoted({ ...hasVoted, [selectedPoll.id]: result.email });
      setSelectedPoll(null);
      resetForm();
      await refreshToken();

      const pollsRes = await fetch('/api/polls');
      const pollsData = await pollsRes.json();
      if (pollsData.ok) setPolls(pollsData.data || []);
    }
  }

  function closeModal() {
    setSelectedPoll(null);
    setSubmitMsg('');
  }

  return (
    <>
      {/* Polls List */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3" role="status" aria-live="polite">
              <Loader2 className="w-8 h-8 animate-spin text-navy" aria-hidden="true" />
              <span className="text-gray-700">Loading polls...</span>
            </div>
          ) : polls.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-xl font-bold text-navy mb-2">Gathering Community Input</h2>
              <p className="text-gray-600 mb-4">
                We're gathering community input on key issues. Check back soon for polls, or visit
                the Ideas page to share your thoughts directly.
              </p>
              <Link href="/ideas" className="btn-primary">
                Share an Idea
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  hasVoted={!!hasVoted[poll.id]}
                  onVoteClick={handleVoteClick}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedPoll && (
        <VoteModal
          poll={selectedPoll}
          voteForm={voteForm}
          setVoteForm={setVoteForm}
          votingMode={votingMode}
          authenticatedSupporter={authenticatedSupporter}
          verifiedVoter={verifiedVoter}
          submitMsg={submitMsg}
          onSubmit={handleVote}
          onClose={closeModal}
          toggleChoice={toggleChoice}
          handleRankingClick={handleRankingClick}
          getRankForChoice={getRankForChoice}
          moveRanking={moveRanking}
        />
      )}

      {/* CTA */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="section-title mb-4">Have an Idea?</h2>
          <p className="text-gray-600 mb-8">Share your ideas for making Prosper better</p>
          <Link href="/ideas" className="btn-primary">
            Submit an Idea
          </Link>
        </div>
      </section>

      {/* Voting Options Modal */}
      {showVotingOptionsModal && (
        <VotingOptionsModal
          onClose={() => {
            setShowVotingOptionsModal(false);
            setPendingPoll(null);
          }}
          onOptionSelected={handleVotingOption}
        />
      )}

      {/* Voter Verification Modal */}
      {showVerifyModal && (
        <VerifiedVoterModal
          onClose={() => {
            setShowVerifyModal(false);
            setPendingPoll(null);
          }}
          onVerified={handleVerified}
        />
      )}
    </>
  );
}
