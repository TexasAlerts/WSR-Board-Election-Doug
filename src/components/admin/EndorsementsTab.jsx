'use client';

import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function EndorsementsTab({
  endorsements,
  loading,
  filter,
  setFilter,
  handleEndorsementAction,
  showPrompt,
  formatDate,
  statusColors,
}) {
  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['pending', 'approved', 'rejected', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === s ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-navy" />
        </div>
      ) : (
        <div className="space-y-4">
          {endorsements.map((e) => (
            <div key={e.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium">{e.name}</span>
                  <span className="text-gray-500 text-sm ml-2">{e.email}</span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[e.status]}`}
                >
                  {e.status}
                </span>
              </div>
              {e.message && (
                <p className="text-gray-800 mb-3 whitespace-pre-wrap italic">
                  &quot;{e.message}&quot;
                </p>
              )}
              {e.rejection_reason && (
                <div className="bg-red-50 p-2 rounded text-sm text-red-800 mb-3">
                  Rejection reason: {e.rejection_reason}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{formatDate(e.created_at)}</span>
                {e.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEndorsementAction(e.id, 'approve')}
                      className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={async () => {
                        const reason = await showPrompt(
                          'Reject Endorsement',
                          'Rejection reason (will be sent to user):'
                        );
                        handleEndorsementAction(e.id, 'reject', reason);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {endorsements.length === 0 && (
            <div className="text-center py-12 text-gray-500">No endorsements found</div>
          )}
        </div>
      )}
    </div>
  );
}
