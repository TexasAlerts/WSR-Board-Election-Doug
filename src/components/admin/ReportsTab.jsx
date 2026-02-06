'use client';

import { useState } from 'react';
import { BarChart3, Download, Loader2 } from 'lucide-react';
import { logApiError } from '@/lib/clientErrorLogger';

export default function ReportsTab() {
  const [reportType, setReportType] = useState('engagement');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');

  async function loadReport() {
    setLoading(true);
    setError('');
    setReportData(null);

    try {
      const res = await fetch(`/api/admin/reports/${reportType}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setReportData(data.data);
    } catch (err) {
      await logApiError(`/api/admin/reports/${reportType}`, 'GET', err.status || 500, err.message, {
        reportType,
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadCSV() {
    if (reportType === 'engagement') return; // No CSV for engagement
    try {
      const res = await fetch(`/api/admin/reports/${reportType}?format=csv`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      await logApiError(`/api/admin/reports/${reportType}`, 'GET', err.status || 500, err.message, {
        reportType,
        format: 'csv',
      });
      setError('Failed to download CSV');
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div>
          <label htmlFor="report-type" className="sr-only">Report Type</label>
          <select
            id="report-type"
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setReportData(null);
            }}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="engagement">Engagement Overview</option>
            <option value="polls">Poll Results</option>
            <option value="comments">Comments</option>
            <option value="ideas">Ideas</option>
          </select>
        </div>

        <button
          onClick={loadReport}
          disabled={loading}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <BarChart3 className="w-4 h-4" />
          )}
          Generate Report
        </button>

        {reportData && reportType !== 'engagement' && (
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 text-sm text-navy border border-navy rounded-md px-3 py-2 hover:bg-navy/5"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">{error}</div>}

      {reportData && reportType === 'engagement' && <EngagementReport data={reportData} />}

      {reportData && reportType === 'polls' && <PollsReport data={reportData} />}

      {reportData && reportType === 'comments' && <CommentsReport data={reportData} />}

      {reportData && reportType === 'ideas' && <IdeasReport data={reportData} />}
    </div>
  );
}

function EngagementReport({ data }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Verified Voters" value={data.users?.verifiedVoters || 0} />
      <StatCard label="Registered Supporters" value={data.users?.supporters || 0} />
      <StatCard label="Active Polls" value={data.polls?.activePolls || 0} />
      <StatCard label="Total Poll Votes" value={data.polls?.totalPollVotes || 0} />
      <StatCard label="Approved Comments" value={data.comments?.totalComments || 0} />
      <StatCard label="Pending Comments" value={data.comments?.pendingComments || 0} />
      <StatCard label="Total Ideas" value={data.ideas?.totalIdeas || 0} />
      <StatCard label="Published Ideas" value={data.ideas?.publishedIdeas || 0} />
      <div className="col-span-2 md:col-span-4 bg-blue-50 rounded-lg p-4 mt-2">
        <h3 className="font-semibold text-navy mb-2">Last 7 Days</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Votes:</span>{' '}
            <strong>{data.recentActivity?.votes || 0}</strong>
          </div>
          <div>
            <span className="text-gray-500">Comments:</span>{' '}
            <strong>{data.recentActivity?.comments || 0}</strong>
          </div>
          <div>
            <span className="text-gray-500">Ideas:</span>{' '}
            <strong>{data.recentActivity?.ideas || 0}</strong>
          </div>
          <div>
            <span className="text-gray-500">Sign-ups:</span>{' '}
            <strong>{data.recentActivity?.signups || 0}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-2xl font-bold text-navy">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function PollsReport({ data }) {
  return (
    <div className="space-y-4">
      {data.map((poll) => (
        <div key={poll.poll_id} className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-navy">{poll.title}</h3>
            <span className="text-sm px-2 py-1 bg-navy/10 rounded">{poll.status}</span>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            {poll.total_votes} votes &middot; {poll.approved_comments} comments &middot;{' '}
            {poll.poll_type}
          </p>
          <div className="space-y-1">
            {poll.choices.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-navy h-full rounded-full flex items-center px-2"
                    style={{
                      width: `${poll.total_votes > 0 ? Math.max((c.votes / poll.total_votes) * 100, 5) : 5}%`,
                    }}
                  >
                    <span className="text-white text-xs font-medium">{c.votes}</span>
                  </div>
                </div>
                <span className="text-sm w-40 truncate">
                  {c.text}
                  {c.is_other ? ' (Other)' : ''}
                </span>
              </div>
            ))}
          </div>
          {poll.other_responses.length > 0 && (
            <div className="mt-3 text-sm">
              <p className="font-medium text-gray-700 mb-1">
                &quot;Other&quot; responses ({poll.other_responses.length}):
              </p>
              <ul className="list-disc list-inside text-gray-600">
                {poll.other_responses.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
      {data.length === 0 && <p className="text-gray-500">No polls found.</p>}
    </div>
  );
}

function CommentsReport({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">Reported comments</caption>
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Content</th>
            <th className="p-2">Context</th>
            <th className="p-2">Status</th>
            <th className="p-2">Votes</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-2">
                {c.name}
                <br />
                <span className="text-xs text-gray-400">{c.email}</span>
              </td>
              <td className="p-2 max-w-xs truncate">{c.content}</td>
              <td className="p-2 text-xs">
                {c.context_type}: {c.context_title}
              </td>
              <td className="p-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs ${c.status === 'approved' ? 'bg-green-100 text-green-700' : c.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
                >
                  {c.status}
                </span>
              </td>
              <td className="p-2 text-xs">
                {c.upvotes}↑ {c.downvotes}↓
              </td>
              <td className="p-2 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <p className="text-gray-500 p-4">No comments found.</p>}
    </div>
  );
}

function IdeasReport({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">Reported ideas</caption>
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">Title</th>
            <th className="p-2">Author</th>
            <th className="p-2">Category</th>
            <th className="p-2">Status</th>
            <th className="p-2">Votes</th>
            <th className="p-2">Comments</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((i) => (
            <tr key={i.id} className="border-b">
              <td className="p-2 font-medium">{i.title}</td>
              <td className="p-2">
                {i.name}
                <br />
                <span className="text-xs text-gray-400">{i.email}</span>
              </td>
              <td className="p-2 text-xs">{i.category}</td>
              <td className="p-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs ${i.status === 'published' ? 'bg-green-100 text-green-700' : i.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}
                >
                  {i.status}
                </span>
              </td>
              <td className="p-2 text-xs">
                {i.upvotes}↑ {i.downvotes}↓
              </td>
              <td className="p-2 text-xs">{i.comment_count}</td>
              <td className="p-2 text-xs">{new Date(i.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <p className="text-gray-500 p-4">No ideas found.</p>}
    </div>
  );
}
