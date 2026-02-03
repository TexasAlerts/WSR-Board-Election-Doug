'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export default function PollCard({ poll, hasVoted, onVoteClick }) {
  return (
    <div className="card">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-navy">{poll.title}</h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-navy/10 text-navy text-sm rounded-full font-medium">
            {poll.poll_type === 'single_choice'
              ? 'Single Choice'
              : poll.poll_type === 'multiple_choice'
                ? 'Multiple Choice'
                : 'Ranked Choice'}
          </span>
          {hasVoted && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
              Voted
            </span>
          )}
        </div>
      </div>

      {poll.description && <p className="text-gray-600 mb-4">{poll.description}</p>}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <span className="text-prosper-red font-semibold">
            {poll.vote_count} vote{poll.vote_count !== 1 ? 's' : ''}
          </span>
          {poll.allow_comments && (
            <Link
              href={`/polls/${poll.id}#comments`}
              className="flex items-center gap-1.5 text-gray-600 hover:text-navy transition-colors"
              title="View comments"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">{poll.comment_count || 0}</span>
            </Link>
          )}
        </div>
        {hasVoted ? (
          <Link href={`/polls/${poll.id}`} className="text-navy font-semibold hover:underline">
            View Results →
          </Link>
        ) : (
          <button onClick={() => onVoteClick(poll)} className="btn-primary">
            Vote Now
          </button>
        )}
      </div>
    </div>
  );
}
