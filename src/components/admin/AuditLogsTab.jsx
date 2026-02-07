'use client';

import { Eye, Loader2 } from 'lucide-react';

export default function AuditLogsTab({ auditLogs, loading, filter, setFilter, formatDate }) {
  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap" role="group" aria-label="Filter audit logs by event type">
        {[
          'all',
          'LOGIN_SUCCESS',
          'LOGIN_FAILED',
          'LOGOUT',
          'REGISTER',
          'SUPPORTER_APPROVED',
          'SUPPORTER_SUSPENDED',
          'COMMENT_APPROVED',
          'COMMENT_REJECTED',
          'COMMENT_CREATED',
          'POLL_VOTE',
          'IDEA_VOTE',
          'IDEA_CREATED',
          'ENDORSEMENT_SUBMITTED',
          'ENDORSEMENT_APPROVED',
          'ENDORSEMENT_REJECTED',
          'BROADCAST_SENT',
        ].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === s ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.replace(/_/g, ' ').toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div role="status" aria-live="polite" className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-navy" aria-hidden="true" />
          <span className="sr-only">Loading audit logs...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <caption className="sr-only">Audit logs</caption>
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Time
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Event
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  User
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  IP Address
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDate(log.created_at)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.event_type.includes('SUCCESS') || log.event_type.includes('APPROVED')
                          ? 'bg-green-100 text-green-800'
                          : log.event_type.includes('FAILED') ||
                              log.event_type.includes('SUSPENDED') ||
                              log.event_type.includes('REJECTED')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {log.event_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{log.supporter_name || '-'}</div>
                    <div className="text-xs text-gray-700">{log.supporter_email || '-'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                    {log.ip_address || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {log.details ? (
                      <button
                        onClick={() => alert(JSON.stringify(JSON.parse(log.details), null, 2))}
                        className="text-navy hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-700">
                    No audit logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
