'use client';

import { CheckCircle, XCircle, MessageSquare, Loader2 } from 'lucide-react';

export default function IdeasTab({
  ideas,
  loading,
  filter,
  setFilter,
  handleIdeaAction,
  showPrompt,
  formatDate,
  statusColors,
}) {
  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap" role="group" aria-label="Filter ideas by status">
        {['pending', 'published', 'under_review', 'planned', 'completed', 'declined', 'all'].map(
          (s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              aria-pressed={filter === s}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === s ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          )
        )}
      </div>

      {loading ? (
        <div role="status" aria-live="polite" className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-navy" aria-hidden="true" />
          <span className="sr-only">Loading ideas...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea) => (
            <div key={idea.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium">{idea.name}</span>
                  <span className="text-gray-700 text-sm ml-2">{idea.email}</span>
                  <span className="ml-2 px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-600">
                    {idea.category}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[idea.status] || 'bg-gray-100 text-gray-600'}`}
                >
                  {idea.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-semibold text-navy mb-2">{idea.title}</h3>
              <p className="text-gray-700 mb-3 text-sm">{idea.content}</p>
              {idea.admin_response && (
                <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-3">
                  <strong>Admin response:</strong> {idea.admin_response}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">{formatDate(idea.created_at)}</span>
                {idea.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const response = await showPrompt(
                          'Publish Idea',
                          'Your response (optional):'
                        );
                        handleIdeaAction(idea.id, 'publish', response);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Publish
                    </button>
                    <button
                      onClick={async () => {
                        const reason = await showPrompt(
                          'Decline Idea',
                          'Rejection reason (will be sent to user):'
                        );
                        if (reason) {
                          handleIdeaAction(idea.id, 'reject', null, reason);
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      <XCircle className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                )}
                {idea.status !== 'pending' && idea.status !== 'declined' && (
                  <button
                    onClick={async () => {
                      const response = await showPrompt(
                        'Respond to Idea',
                        'Add/update response:',
                        idea.admin_response || '',
                        true
                      );
                      if (response) {
                        handleIdeaAction(idea.id, 'respond', response);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Respond
                  </button>
                )}
              </div>
            </div>
          ))}
          {ideas.length === 0 && (
            <div className="text-center py-12 text-gray-700">No ideas found</div>
          )}
        </div>
      )}
    </div>
  );
}
