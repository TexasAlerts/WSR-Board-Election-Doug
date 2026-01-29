'use client';

import { CheckCircle, XCircle, Trash2, Loader2, Mail, Phone } from 'lucide-react';

export default function SupportersTab({
  supporters, loading, filter, setFilter, updateSupporter, deleteSupporter, formatDate, statusColors,
}) {
  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['all', 'pending_email', 'pending_phone', 'approved', 'suspended'].map((s) => (
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
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {supporters.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{s.first_name} {s.last_name}</div>
                    <div className="text-xs text-gray-500">{formatDate(s.created_at)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{s.email}</div>
                    <div className="text-sm text-gray-500">{s.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {s.street_address}, {s.city}, {s.state} {s.zip_code}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[s.status]}`}>
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {s.email_consent && <Mail className="w-4 h-4 text-green-600" />}
                      {s.sms_consent && <Phone className="w-4 h-4 text-green-600" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {s.status !== 'approved' && (
                        <button
                          onClick={() => updateSupporter(s.id, { status: 'approved' })}
                          className="text-green-600 hover:text-green-800"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      {s.status !== 'suspended' && (
                        <button
                          onClick={() => updateSupporter(s.id, { status: 'suspended' })}
                          className="text-red-600 hover:text-red-800"
                          title="Suspend"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                      {s.role !== 'admin' && s.role !== 'super_admin' && (
                        <button
                          onClick={() => deleteSupporter(s.id)}
                          className="text-red-700 hover:text-red-900"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {supporters.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No supporters found
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
