'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Comment from '@/components/shared/Comment';
import { logApiError } from '@/lib/clientErrorLogger';
import { useCSRF } from '@/hooks/useCSRF';

export default function PollDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { token: csrfToken, refreshToken } = useCSRF();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifiedVoter, setVerifiedVoter] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedSupporter, setAuthenticatedSupporter] = useState(null);

  useEffect(() => {
    async function loadPoll() {
      try {
        const res = await fetch(`/api/polls/${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Poll not found');
          setLoading(false);
          return;
        }

        setPoll(data.data);
      } catch (err) {
        await logApiError(`/api/polls/${params.id}`, 'GET', err.status || 500, err.message, { context: 'loadPoll' });
        setError('Error loading poll');
      } finally {
        setLoading(false);
      }
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/supporter/me');
        const data = await res.json();
        if (data.ok && data.data) {
          setIsAuthenticated(true);
          setAuthenticatedSupporter(data.data);
          return;
        }
      } catch (err) {
        // Not authenticated - expected for guests, no logging needed
      }

      // Check for verified voter
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
        // Not a verified voter - expected for guests, no logging needed
      }
    }

    loadPoll();
    checkAuth();
  }, [params.id]);

  async function handleCommentSubmit({ content, parent_id }) {
    try {
      const payload = {
        poll_id: params.id,
        content,
      };

      // Only include parent_id if replying to a comment
      if (parent_id) {
        payload.parent_id = parent_id;
      }

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.ok) {
        await refreshToken();
        // Reload poll to get updated comments
        const pollRes = await fetch(`/api/polls/${params.id}`);
        const pollData = await pollRes.json();
        if (pollData.ok) {
          setPoll(pollData.data);
        }
        return { ok: true };
      } else {
        const errorMsg = result.error || 'Error submitting comment';
        await logApiError('/api/comments', 'POST', res.status, errorMsg, {
          pollId: params.id,
          hasContent: !!content,
          contentLength: content?.length,
          isReply: !!parent_id,
        });
        return { ok: false, error: errorMsg };
      }
    } catch (err) {
      await logApiError('/api/comments', 'POST', err.status || 500, err.message, {
        pollId: params.id,
        context: 'commentSubmitException',
      });
      return { ok: false, error: 'Error submitting comment' };
    }
  }

  async function handleCommentVote(commentId, voteType) {
    const res = await fetch(`/api/comments/${commentId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      body: JSON.stringify({ vote_type: voteType }),
    });

    const result = await res.json();

    if (result.ok) {
      await refreshToken();
      // Update the comment in poll.comments
      const updatedComments = poll.comments.map((c) => {
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
      setPoll({ ...poll, comments: updatedComments });
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center text-gray-700">Loading poll...</div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="card text-center py-12">
          <h2 className="text-xl font-bold text-navy mb-4">Poll Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This poll does not exist.'}</p>
          <Link href="/polls" className="btn-primary">
            Back to Polls
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link href="/polls" className="inline-flex items-center gap-2 text-navy hover:underline mb-6">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Polls
      </Link>

      {/* Poll header */}
      <div className="card mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold text-navy">{poll.title}</h1>
          <span className="px-3 py-1 bg-navy/10 text-navy text-sm rounded-full font-medium">
            {poll.poll_type === 'single_choice'
              ? 'Single Choice'
              : poll.poll_type === 'multiple_choice'
                ? 'Multiple Choice'
                : 'Ranked Choice'}
          </span>
        </div>

        {poll.description && <p className="text-gray-600 mb-6">{poll.description}</p>}

        <div className="text-sm text-gray-700">
          {poll.total_votes} vote{poll.total_votes !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Results */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-navy mb-6">Results</h2>
        <div className="space-y-4">
          {poll.choices?.map((choice) => (
            <div key={choice.id}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">{choice.text}</span>
                <span className="text-gray-600 font-semibold">{choice.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-prosper-red h-full rounded-full transition-all duration-500"
                  style={{ width: `${choice.percentage}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-700 mt-1">
                {choice.votes} vote{choice.votes !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments section */}
      {poll.allow_comments && (
        <Comment
          comments={poll.comments || []}
          isAuthenticated={isAuthenticated}
          authenticatedSupporter={authenticatedSupporter}
          allowReplies={true}
          onCommentSubmit={handleCommentSubmit}
          onCommentVote={handleCommentVote}
          entityType="poll"
          verifiedVoter={verifiedVoter}
        />
      )}
    </div>
  );
}
