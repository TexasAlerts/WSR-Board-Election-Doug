'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';

export default function IdeaVotingPanel({ idea, votingIdea, onVote, isAuthenticated }) {
  if (!isAuthenticated) return null;

  return (
    <>
      <button
        onClick={() => onVote('up')}
        disabled={votingIdea}
        className={`flex items-center gap-1 px-3 py-2 rounded transition-colors ${
          idea.user_vote === 'up' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
        } disabled:opacity-50`}
      >
        <ThumbsUp className="w-4 h-4" />
        <span className="text-sm font-medium">{idea.upvotes || 0}</span>
      </button>

      <button
        onClick={() => onVote('down')}
        disabled={votingIdea}
        className={`flex items-center gap-1 px-3 py-2 rounded transition-colors ${
          idea.user_vote === 'down'
            ? 'bg-red-100 text-red-700'
            : 'text-gray-600 hover:bg-gray-100'
        } disabled:opacity-50`}
      >
        <ThumbsDown className="w-4 h-4" />
        <span className="text-sm font-medium">{idea.downvotes || 0}</span>
      </button>
    </>
  );
}
