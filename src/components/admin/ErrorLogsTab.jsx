'use client';

import { CheckCircle, XCircle, RefreshCw, Loader2 } from 'lucide-react';

export default function ErrorLogsTab({
  errorLogs, loading, filter, setFilter, updateErrorStatus, showPrompt, formatDate,
}) {
  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['new', 'investigating', 'resolved', 'wont_fix', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === s
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-navy" />
        </div>
      ) : (
        <div className="space-y-4">
          {errorLogs.map((err) => (
            <div key={err.id} className={`bg-white rounded-xl shadow p-4 border-l-4 ${
              err.status === 'new' ? 'border-red-500' :
              err.status === 'investigating' ? 'border-yellow-500' :
              err.status === 'resolved' ? 'border-green-500' : 'border-gray-400'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    err.status === 'new' ? 'bg-red-100 text-red-800' :
                    err.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                    err.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {err.status.replace('_', ' ')}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {err.occurrence_count > 1 && `${err.occurrence_count}x`}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(err.last_occurred_at || err.created_at)}</span>
              </div>

              <div className="mb-2">
                <span className="px-2 py-0.5 rounded bg-gray-100 text-xs font-mono text-gray-700">
                  {err.error_type}
                </span>
                <span className="ml-2 text-sm text-gray-600">{err.endpoint} ({err.method})</span>
              </div>

              <p className="text-red-700 font-medium mb-2">{err.error_message}</p>

              {err.user_email && (
                <p className="text-sm text-gray-600 mb-2">User: {err.user_email}</p>
              )}

              <div className="text-xs text-gray-500 mb-3 font-mono">
                IP: {err.ip_address || '-'}
              </div>

              {err.error_stack && (
                <details className="mb-3">
                  <summary className="text-sm text-navy cursor-pointer hover:underline">Stack Trace</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">{err.error_stack}</pre>
                </details>
              )}

              {err.resolution_notes && (
                <div className="bg-green-50 p-2 rounded text-sm text-green-800 mb-3">
                  Resolution: {err.resolution_notes}
                </div>
              )}

              {err.status !== 'resolved' && err.status !== 'wont_fix' && (
                <div className="flex gap-2 mt-3">
                  {err.status === 'new' && (
                    <button
                      onClick={() => updateErrorStatus(err.id, 'investigating')}
                      className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Investigating
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      const notes = await showPrompt('Resolve Error', 'Resolution notes:');
                      updateErrorStatus(err.id, 'resolved', notes);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Resolve
                  </button>
                  <button
                    onClick={async () => {
                      const notes = await showPrompt("Won't Fix", 'Reason for not fixing:');
                      updateErrorStatus(err.id, 'wont_fix', notes);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <XCircle className="w-4 h-4" />
                    Won&#39;t Fix
                  </button>
                </div>
              )}
            </div>
          ))}
          {errorLogs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No errors found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
