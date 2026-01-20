"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PollsPage() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [voteForm, setVoteForm] = useState({ email: '', name: '', selectedChoice: null, selectedChoices: [], rankings: [], comment: '' });
  const [hasVoted, setHasVoted] = useState({});
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    async function loadPolls() {
      try {
        const res = await fetch('/api/polls');
        const data = await res.json();
        if (data.ok) {
          setPolls(data.data || []);
        }
      } catch (err) {
        console.error('Error loading polls:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPolls();

    // Check localStorage for voted polls
    const voted = JSON.parse(localStorage.getItem('votedPolls') || '{}');
    setHasVoted(voted);
  }, []);

  async function handleVote(e) {
    e.preventDefault();
    if (!selectedPoll) return;
    setSubmitMsg('');

    const voteData = {
      email: voteForm.email,
      name: voteForm.name,
      comment: voteForm.comment || undefined,
    };

    if (selectedPoll.poll_type === 'single_choice') {
      if (!voteForm.selectedChoice) {
        setSubmitMsg('Please select an option');
        return;
      }
      voteData.choice_id = voteForm.selectedChoice;
    } else if (selectedPoll.poll_type === 'multiple_choice') {
      if (voteForm.selectedChoices.length === 0) {
        setSubmitMsg('Please select at least one option');
        return;
      }
      voteData.choice_ids = voteForm.selectedChoices;
    } else if (selectedPoll.poll_type === 'ranked_choice') {
      if (voteForm.rankings.length !== selectedPoll.choices?.length) {
        setSubmitMsg('Please rank all options');
        return;
      }
      voteData.rankings = voteForm.rankings;
    }

    try {
      const res = await fetch(`/api/polls/${selectedPoll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voteData),
      });
      const result = await res.json();

      if (result.ok) {
        setSubmitMsg('Thank you for voting!');
        setHasVoted({ ...hasVoted, [selectedPoll.id]: voteForm.email });
        localStorage.setItem('votedPolls', JSON.stringify({ ...hasVoted, [selectedPoll.id]: voteForm.email }));
        setSelectedPoll(null);
        setVoteForm({ email: '', name: '', selectedChoice: null, selectedChoices: [], rankings: [], comment: '' });
        // Reload polls to get updated counts
        const pollsRes = await fetch('/api/polls');
        const pollsData = await pollsRes.json();
        if (pollsData.ok) setPolls(pollsData.data || []);
      } else {
        setSubmitMsg(result.error || 'Error voting');
      }
    } catch (err) {
      setSubmitMsg('Error submitting vote');
    }
  }

  function toggleChoice(choiceId) {
    if (voteForm.selectedChoices.includes(choiceId)) {
      setVoteForm({ ...voteForm, selectedChoices: voteForm.selectedChoices.filter(id => id !== choiceId) });
    } else {
      setVoteForm({ ...voteForm, selectedChoices: [...voteForm.selectedChoices, choiceId] });
    }
  }

  function handleRankingClick(choiceId) {
    const currentRankings = [...voteForm.rankings];
    const existingIndex = currentRankings.indexOf(choiceId);

    if (existingIndex !== -1) {
      // Remove this choice and all after it
      currentRankings.splice(existingIndex);
    } else {
      // Add to rankings
      currentRankings.push(choiceId);
    }
    setVoteForm({ ...voteForm, rankings: currentRankings });
  }

  function getRankForChoice(choiceId) {
    const index = voteForm.rankings.indexOf(choiceId);
    return index === -1 ? null : index + 1;
  }

  function moveRanking(choiceId, direction) {
    const currentRankings = [...voteForm.rankings];
    const index = currentRankings.indexOf(choiceId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentRankings.length) return;

    [currentRankings[index], currentRankings[newIndex]] = [currentRankings[newIndex], currentRankings[index]];
    setVoteForm({ ...voteForm, rankings: currentRankings });
  }

  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="cta-gradient text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        {/* Logo accent */}
        <Image
          src="/wsr-logo.webp"
          alt=""
          width={96}
          height={64}
          className="absolute top-4 right-4 w-16 sm:w-20 md:w-24 h-auto opacity-40 pointer-events-none brightness-200"
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in-down">
            Community Polls
          </h1>
          <p className="text-xl text-white/90 animate-fade-in animate-delay-200">
            Share your voice on issues that matter to Prosper
          </p>
        </div>
      </section>

      {/* Polls List */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading polls...</div>
          ) : polls.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-xl font-bold text-navy mb-2">Gathering Community Input</h2>
              <p className="text-gray-600 mb-4">We're gathering community input on key issues. Check back soon for polls, or visit the Ideas page to share your thoughts directly.</p>
              <Link href="/ideas" className="btn-primary">
                Share an Idea
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {polls.map((poll) => (
                <div key={poll.id} className="card">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <h2 className="text-xl font-bold text-navy">{poll.title}</h2>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-navy/10 text-navy text-sm rounded-full font-medium">
                        {poll.poll_type === 'single_choice' ? 'Single Choice' : poll.poll_type === 'multiple_choice' ? 'Multiple Choice' : 'Ranked Choice'}
                      </span>
                      {hasVoted[poll.id] && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                          Voted
                        </span>
                      )}
                    </div>
                  </div>

                  {poll.description && (
                    <p className="text-gray-600 mb-4">{poll.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-prosper-red font-semibold">
                      {poll.vote_count} vote{poll.vote_count !== 1 ? 's' : ''}
                    </span>
                    {hasVoted[poll.id] ? (
                      <Link
                        href={`/polls/${poll.id}`}
                        className="text-navy font-semibold hover:underline"
                      >
                        View Results →
                      </Link>
                    ) : (
                      <button
                        onClick={() => setSelectedPoll(poll)}
                        className="btn-primary"
                      >
                        Vote Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Voting Modal */}
      {selectedPoll && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPoll(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto pb-safe" onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-navy">{selectedPoll.title}</h2>
                <button onClick={() => setSelectedPoll(null)} className="text-gray-400 hover:text-gray-600 text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center">×</button>
              </div>

              {selectedPoll.description && (
                <p className="text-gray-600 mb-6">{selectedPoll.description}</p>
              )}

              <form onSubmit={handleVote} className="space-y-6">
                <div>
                  <label className="form-label">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={voteForm.name}
                    onChange={e => setVoteForm({ ...voteForm, name: e.target.value })}
                    className="form-input"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="form-label">Your Email *</label>
                  <input
                    type="email"
                    required
                    value={voteForm.email}
                    onChange={e => setVoteForm({ ...voteForm, email: e.target.value })}
                    className="form-input"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="form-label">
                    {selectedPoll.poll_type === 'single_choice'
                      ? 'Select one option *'
                      : selectedPoll.poll_type === 'multiple_choice'
                        ? 'Select all that apply *'
                        : 'Rank your choices (click to add, click again to remove) *'}
                  </label>

                  {/* Single and Multiple Choice UI */}
                  {(selectedPoll.poll_type === 'single_choice' || selectedPoll.poll_type === 'multiple_choice') && (
                    <div className="space-y-2 mt-2">
                      {selectedPoll.choices?.map(choice => (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() => {
                            if (selectedPoll.poll_type === 'single_choice') {
                              setVoteForm({ ...voteForm, selectedChoice: choice.id });
                            } else {
                              toggleChoice(choice.id);
                            }
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                            (selectedPoll.poll_type === 'single_choice' && voteForm.selectedChoice === choice.id) ||
                            (selectedPoll.poll_type === 'multiple_choice' && voteForm.selectedChoices.includes(choice.id))
                              ? 'border-navy bg-navy/5 text-navy'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-${selectedPoll.poll_type === 'single_choice' ? 'full' : 'md'} border-2 flex items-center justify-center ${
                              (selectedPoll.poll_type === 'single_choice' && voteForm.selectedChoice === choice.id) ||
                              (selectedPoll.poll_type === 'multiple_choice' && voteForm.selectedChoices.includes(choice.id))
                                ? 'border-navy bg-navy text-white'
                                : 'border-gray-300'
                            }`}>
                              {((selectedPoll.poll_type === 'single_choice' && voteForm.selectedChoice === choice.id) ||
                                (selectedPoll.poll_type === 'multiple_choice' && voteForm.selectedChoices.includes(choice.id))) && (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span>{choice.text || choice.choice_text}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Ranked Choice UI */}
                  {selectedPoll.poll_type === 'ranked_choice' && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-3">
                        Click choices in order of preference. Your first click is your top choice.
                      </p>
                      <div className="space-y-2">
                        {selectedPoll.choices?.map(choice => {
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
                                  <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-base sm:text-lg ${
                                    rank !== null
                                      ? 'border-navy bg-navy text-white'
                                      : 'border-gray-300 text-gray-400'
                                  }`}>
                                    {rank !== null ? rank : '-'}
                                  </div>
                                  <span>{choice.text || choice.choice_text}</span>
                                </div>
                                {rank !== null && (
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); moveRanking(choice.id, 'up'); }}
                                      disabled={rank === 1}
                                      className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-navy hover:bg-gray-100 rounded-lg disabled:opacity-30"
                                      title="Move up"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); moveRanking(choice.id, 'down'); }}
                                      disabled={rank === voteForm.rankings.length}
                                      className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-navy hover:bg-gray-100 rounded-lg disabled:opacity-30"
                                      title="Move down"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {voteForm.rankings.length > 0 && voteForm.rankings.length < (selectedPoll.choices?.length || 0) && (
                        <p className="text-sm text-amber-600 mt-2">
                          {(selectedPoll.choices?.length || 0) - voteForm.rankings.length} more choice(s) to rank
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {selectedPoll.allow_comments && (
                  <div>
                    <label className="form-label">Comment (optional)</label>
                    <textarea
                      rows={3}
                      value={voteForm.comment}
                      onChange={e => setVoteForm({ ...voteForm, comment: e.target.value })}
                      className="form-input"
                      placeholder="Share your thoughts..."
                    />
                  </div>
                )}

                {submitMsg && (
                  <div className={`p-4 rounded-lg ${submitMsg.includes('Thank') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
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
    </div>
  );
}
