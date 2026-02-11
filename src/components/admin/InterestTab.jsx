'use client';

import { XCircle, Loader2 } from 'lucide-react';

export default function InterestTab({
  interest,
  loading,
  filter,
  setFilter,
  handleDeleteInterest,
  formatDate,
}) {
  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap" role="group" aria-label="Filter interest by type">
        {['all', 'updates', 'volunteer', 'yardsign', 'meeting'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === s ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'yardsign'
              ? 'Yard Signs'
              : s === 'all'
                ? 'All'
                : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div role="status" aria-live="polite" className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-navy" aria-hidden="true" />
          <span className="sr-only">Loading interest submissions...</span>
        </div>
      ) : (
        <>
          {/* Desktop table view */}
          <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <caption className="sr-only">Interest submissions</caption>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Contact
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Message
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {interest.map((i) => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          i.type === 'volunteer'
                            ? 'bg-green-100 text-green-700'
                            : i.type === 'yardsign'
                              ? 'bg-blue-100 text-blue-700'
                              : i.type === 'meeting'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {i.type === 'yardsign' ? 'Yard Sign' : i.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{i.name}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{i.email}</div>
                      {i.phone && <div className="text-sm text-gray-700">{i.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <div className="line-clamp-2">{i.message || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">{formatDate(i.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteInterest(i.id)}
                        className="text-red-600 hover:text-red-800 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Delete"
                        aria-label={`Delete ${i.name}'s interest record`}
                      >
                        <XCircle className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
                {interest.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-700">
                      No interest records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden space-y-4">
            {interest.map((i) => (
              <div key={i.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      i.type === 'volunteer'
                        ? 'bg-green-100 text-green-700'
                        : i.type === 'yardsign'
                          ? 'bg-blue-100 text-blue-700'
                          : i.type === 'meeting'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {i.type === 'yardsign' ? 'Yard Sign' : i.type}
                  </span>
                  <button
                    onClick={() => handleDeleteInterest(i.id)}
                    className="text-red-600 hover:text-red-800 p-2 -mr-2"
                    title="Delete"
                    aria-label={`Delete ${i.name}'s interest record`}
                  >
                    <XCircle className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="font-medium text-gray-900">{i.name}</div>
                <div className="text-sm text-gray-600">{i.email}</div>
                {i.phone && <div className="text-sm text-gray-700">{i.phone}</div>}
                {i.message && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{i.message}</p>
                )}
                <div className="text-xs text-gray-700 mt-2">{formatDate(i.created_at)}</div>
              </div>
            ))}
            {interest.length === 0 && (
              <div className="text-center py-12 text-gray-700">No interest records found</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
