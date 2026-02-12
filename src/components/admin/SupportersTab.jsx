'use client';

import { CheckCircle, XCircle, Trash2, Loader2, Mail, Phone, Shield, ShieldCheck, UserPlus } from 'lucide-react';
import { useState } from 'react';

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
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);

  const handleMigration = async () => {
    if (!confirm('Migrate all existing endorsements to supporters?\n\nThis will:\n• Create supporter accounts for all endorsers\n• Send verification emails to activate accounts\n\nThis action is safe to run multiple times (skips existing supporters).')) {
      return;
    }

    setMigrating(true);
    setMigrationResult(null);

    try {
      const res = await fetch('/api/admin/migrate-endorsers', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setMigrationResult({
          success: true,
          message: `Migration completed successfully!\n\nProcessed: ${data.processed}\nCreated: ${data.created}\nSkipped: ${data.skipped}\nEmails sent: ${data.emailsSent}\nErrors: ${data.errors?.length || 0}`,
          data: data,
        });
        // Reload supporters after migration
        window.location.reload();
      } else {
        setMigrationResult({
          success: false,
          message: `Migration failed: ${data.error || 'Unknown error'}`,
        });
      }
    } catch (err) {
      setMigrationResult({
        success: false,
        message: `Migration error: ${err.message}`,
      });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div>
      <div className="flex gap-4 mb-4 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter supporters by status">
          {['all', 'pending_email', 'pending_phone', 'approved', 'suspended'].map((s) => (
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
          ))}
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleMigration}
            disabled={migrating}
            className="flex items-center gap-2 px-4 py-2 bg-prosper-red text-white rounded-lg hover:bg-red-dark disabled:opacity-50 disabled:cursor-not-allowed"
            title="Migrate existing endorsements to supporters"
          >
            {migrating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Migrate Endorsers
              </>
            )}
          </button>
        )}
      </div>

      {migrationResult && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            migrationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
          role="alert"
        >
          <p className={`font-semibold ${migrationResult.success ? 'text-green-800' : 'text-red-800'}`}>
            {migrationResult.success ? '✓ Migration Successful' : '✗ Migration Failed'}
          </p>
          <p className={`mt-2 text-sm whitespace-pre-line ${migrationResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {migrationResult.message}
          </p>
          {migrationResult.data?.errors?.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium text-red-800">
                View {migrationResult.data.errors.length} error(s)
              </summary>
              <ul className="mt-2 text-xs text-red-700 space-y-1">
                {migrationResult.data.errors.map((err, i) => (
                  <li key={i}>
                    {err.email}: {err.error}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {loading ? (
        <div role="status" aria-live="polite" className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-navy" aria-hidden="true" />
          <span className="sr-only">Loading supporters...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <caption className="sr-only">Supporters list</caption>
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Contact
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Address
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Role
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Consent
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
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
                    <div className="text-xs text-gray-700">{formatDate(s.created_at)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{s.email}</div>
                    <div className="text-sm text-gray-700">{s.phone}</div>
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
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-700">
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
