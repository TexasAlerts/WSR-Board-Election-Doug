'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';

export default function IdeaVotingPanel({ idea, votingIdea, onVote, isAuthenticated }) {
  if (!isAuthenticated) return null;

  return (
    <>
      <button
        onClick={() => onVote('up')}
        disabled={votingIdea}
        aria-label={`Upvote this idea (${idea.upvotes || 0} upvotes)`}
        aria-pressed={idea.user_vote === 'up'}
        className={`flex items-center gap-1 px-3 py-2 min-h-[44px] min-w-[44px] rounded transition-colors ${
          idea.user_vote === 'up' ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'
        } disabled:opacity-70`}
      >
        <ThumbsUp className="w-4 h-4" aria-hidden="true" />
        <span className="text-sm font-medium">{idea.upvotes || 0}</span>
      </button>

      <button
        onClick={() => onVote('down')}
        disabled={votingIdea}
        aria-label={`Downvote this idea (${idea.downvotes || 0} downvotes)`}
        aria-pressed={idea.user_vote === 'down'}
        className={`flex items-center gap-1 px-3 py-2 min-h-[44px] min-w-[44px] rounded transition-colors ${
          idea.user_vote === 'down'
            ? 'bg-red-100 text-red-700'
            : 'text-gray-700 hover:bg-gray-100'
        } disabled:opacity-70`}
      >
        <ThumbsDown className="w-4 h-4" aria-hidden="true" />
        <span className="text-sm font-medium">{idea.downvotes || 0}</span>
      </button>
    </>
  );
}
