import { UserCheck, Ban, Trash2, Mail, Calendar, CheckCircle } from 'lucide-react';

export default function VerifiedVotersTab({
  voters,
  loading,
  filter,
  setFilter,
  handleSuspendVoter,
  handleDeleteVoter,
  formatDate,
  currentUserRole,
}) {
  const isSuperAdmin = currentUserRole === 'super_admin';

  if (loading) {
    return (
      <div className="text-center py-8" role="status" aria-live="polite">
        <span className="sr-only">Loading</span>
        Loading verified voters...
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'all' ? 'bg-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({voters.filter((v) => !v.suspended_at).length})
        </button>
        <button
          onClick={() => setFilter('suspended')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'suspended'
              ? 'bg-navy text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Suspended ({voters.filter((v) => v.suspended_at).length})
        </button>
      </div>

      {/* Voters List */}
      {voters.length === 0 ? (
        <div className="text-center py-12">
          <UserCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-700">No verified voters found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {voters.map((voter) => (
            <div
              key={voter.id}
              className={`card ${voter.suspended_at ? 'bg-gray-50 border-red-200' : ''}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Voter Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-navy">{voter.name}</h3>
                    {voter.suspended_at && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        Suspended
                      </span>
                    )}
                    {voter.verified_at && <CheckCircle className="w-4 h-4 text-green-500" aria-label="Verified" />}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" aria-hidden="true" />
                      <span>{voter.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                      <span>
                        Verified:{' '}
                        {voter.verified_at ? formatDate(voter.verified_at) : 'Not verified'}
                      </span>
                    </div>

                    {voter.suspended_at && (
                      <div className="flex items-center gap-2 text-red-600">
                        <Ban className="w-4 h-4" aria-hidden="true" />
                        <span>Suspended: {formatDate(voter.suspended_at)}</span>
                      </div>
                    )}

                    {voter.vote_count > 0 && (
                      <div className="mt-2">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {voter.vote_count} vote{voter.vote_count !== 1 ? 's' : ''} cast
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {/* Only SuperAdmin can suspend/unsuspend voters */}
                  {isSuperAdmin && (
                    <>
                      {!voter.suspended_at ? (
                        <button
                          onClick={() => handleSuspendVoter(voter.id, 'suspend')}
                          className="btn-secondary text-sm flex items-center gap-2"
                          title="Suspend voter"
                          aria-label={`Suspend ${voter.name}`}
                        >
                          <Ban className="w-4 h-4" />
                          <span className="hidden sm:inline">Suspend</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspendVoter(voter.id, 'unsuspend')}
                          className="btn-primary text-sm flex items-center gap-2"
                          title="Unsuspend voter"
                          aria-label={`Unsuspend ${voter.name}`}
                        >
                          <UserCheck className="w-4 h-4" />
                          <span className="hidden sm:inline">Unsuspend</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteVoter(voter.id, voter.email)}
                        className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
                        title="Delete voter"
                        aria-label={`Delete ${voter.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </>
                  )}
                  {/* Non-SuperAdmin sees no action buttons */}
                  {!isSuperAdmin && (
                    <span className="text-xs text-gray-700 italic">View only</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
