'use client';

import { CheckCircle, XCircle, Trash2, Loader2, Mail, Phone, Shield, ShieldCheck } from 'lucide-react';

const roleColors = {
  super_admin: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  supporter: 'bg-gray-100 text-gray-600',
};

const roleLabels = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  supporter: 'Supporter',
};

export default function SupportersTab({
  supporters,
  loading,
  filter,
  setFilter,
  updateSupporter,
  deleteSupporter,
  formatDate,
  statusColors,
  currentUserRole,
  onRoleChange,
}) {
  const isSuperAdmin = currentUserRole === 'super_admin';

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'pending_email', 'pending_phone', 'approved', 'suspended'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === s ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
        <div className="bg-white rounded-xl shadow overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <caption className="sr-only">Supporters list</caption>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Consent
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {supporters.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {s.first_name} {s.last_name}
                    </div>
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
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[s.status]}`}
                    >
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${roleColors[s.role] || roleColors.supporter}`}
                      >
                        {s.role === 'super_admin' && <ShieldCheck className="w-3 h-3 inline mr-1" />}
                        {s.role === 'admin' && <Shield className="w-3 h-3 inline mr-1" />}
                        {roleLabels[s.role] || 'Supporter'}
                      </span>
                      {isSuperAdmin && s.role !== 'super_admin' && (
                        <select
                          value={s.role || 'supporter'}
                          onChange={(e) => onRoleChange(s.id, e.target.value)}
                          className="text-xs border rounded px-1 py-0.5"
                          aria-label={`Change role for ${s.first_name} ${s.last_name}`}
                        >
                          <option value="supporter">Supporter</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {s.email_consent && <Mail className="w-4 h-4 text-green-600" aria-label="Email consent" />}
                      {s.sms_consent && <Phone className="w-4 h-4 text-green-600" aria-label="SMS consent" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {s.status !== 'approved' && (
                        <button
                          onClick={() => updateSupporter(s.id, { status: 'approved' })}
                          className="text-green-600 hover:text-green-800"
                          title="Approve"
                          aria-label={`Approve ${s.first_name} ${s.last_name}`}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      {/* Only SuperAdmin can suspend users */}
                      {isSuperAdmin && s.status !== 'suspended' && (
                        <button
                          onClick={() => updateSupporter(s.id, { status: 'suspended' })}
                          className="text-red-600 hover:text-red-800"
                          title="Suspend"
                          aria-label={`Suspend ${s.first_name} ${s.last_name}`}
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                      {/* Only SuperAdmin can delete non-admin users */}
                      {isSuperAdmin && s.role !== 'admin' && s.role !== 'super_admin' && (
                        <button
                          onClick={() => deleteSupporter(s.id)}
                          className="text-red-700 hover:text-red-900"
                          title="Delete permanently"
                          aria-label={`Delete ${s.first_name} ${s.last_name}`}
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
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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
