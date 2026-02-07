'use client';

import Link from 'next/link';
import { MessageSquare, PenLine } from 'lucide-react';

export default function PollCard({ poll, hasVoted, onVoteClick }) {
  return (
    <div className="card">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-navy">{poll.title}</h2>
        <div className="flex gap-2 flex-shrink-0">
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

      {poll.description && <p className="text-gray-700 mb-4">{poll.description}</p>}

      <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
        {/* Stats row */}
        <div className="flex items-center gap-4">
          <span className="text-prosper-red font-semibold">
            {poll.vote_count} vote{poll.vote_count !== 1 ? 's' : ''}
          </span>
          {poll.allow_comments && (
            <span className="flex items-center gap-1.5 text-gray-700">
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">
                {poll.comment_count || 0} comment{(poll.comment_count || 0) !== 1 ? 's' : ''}
              </span>
            </span>
          )}
        </div>

        {/* Action buttons row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Vote/Results button */}
          {hasVoted ? (
            <Link
              href={`/polls/${poll.id}`}
              aria-label={`View results for poll: ${poll.title}`}
              className="inline-flex items-center px-4 py-2.5 min-h-[44px] text-sm font-semibold text-navy bg-navy/10 rounded-lg hover:bg-navy/20 transition-colors"
            >
              View Results →
            </Link>
          ) : (
            <button
              onClick={() => onVoteClick(poll)}
              aria-label={`Vote on poll: ${poll.title}`}
              className="btn-primary text-sm px-4 py-2.5 min-h-[44px]"
            >
              Vote Now
            </button>
          )}

          {/* Comment buttons */}
          {poll.allow_comments && (
            <>
              {(poll.comment_count || 0) > 0 && (
                <Link
                  href={`/polls/${poll.id}#comments`}
                  aria-label={`Review ${poll.comment_count || 0} comments on poll: ${poll.title}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  Review Comments
                </Link>
              )}
              <Link
                href={`/polls/${poll.id}#comments`}
                aria-label={`Add comment to poll: ${poll.title}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] text-sm font-medium text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PenLine className="w-4 h-4" aria-hidden="true" />
                Add Comment
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
