"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Reveal from '../../components/Reveal';

export default function PollsPage() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [voteForm, setVoteForm] = useState({ email: '', name: '', selectedChoice: null, selectedChoices: [], comment: '' });
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
    } else {
      if (voteForm.selectedChoices.length === 0) {
        setSubmitMsg('Please select at least one option');
        return;
      }
      voteData.choice_ids = voteForm.selectedChoices;
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
        setVoteForm({ email: '', name: '', selectedChoice: null, selectedChoices: [], comment: '' });
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

  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="cta-gradient text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
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
            <Reveal>
              <div className="card text-center py-12">
                <div className="text-4xl mb-4">📊</div>
                <h2 className="text-xl font-bold text-navy mb-2">No Active Polls</h2>
                <p className="text-gray-600">Check back soon for community polls!</p>
              </div>
            </Reveal>
          ) : (
            <div className="space-y-6">
              {polls.map((poll, idx) => (
                <Reveal key={poll.id} delay={idx * 100}>
                  <div className="card">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <h2 className="text-xl font-bold text-navy">{poll.title}</h2>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-navy/10 text-navy text-sm rounded-full font-medium">
                          {poll.poll_type === 'single_choice' ? 'Single Choice' : 'Multiple Choice'}
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
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Voting Modal */}
      {selectedPoll && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPoll(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-navy">{selectedPoll.title}</h2>
                <button onClick={() => setSelectedPoll(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
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
                    {selectedPoll.poll_type === 'single_choice' ? 'Select one option *' : 'Select all that apply *'}
                  </label>
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
          <Reveal>
            <h2 className="section-title mb-4">Have an Idea?</h2>
            <p className="text-gray-600 mb-8">Share your ideas for making Prosper better</p>
            <Link href="/ideas" className="btn-primary">
              Submit an Idea
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
