'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, MessageSquare, Send, CheckCircle, XCircle, Clock, Mail, Phone, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('supporters');
  const [loading, setLoading] = useState(true);
  const [supporters, setSupporters] = useState([]);
  const [comments, setComments] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [supporterFilter, setSupporterFilter] = useState('all');
  const [commentFilter, setCommentFilter] = useState('pending');
  const [error, setError] = useState('');

  // Broadcast form state
  const [broadcastType, setBroadcastType] = useState('email');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab, supporterFilter, commentFilter]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'supporters') {
        const res = await fetch(`/api/admin/supporters?status=${supporterFilter}`);
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth/login?return=/admin/dashboard');
            return;
          }
          throw new Error(data.error);
        }
        setSupporters(data.data);
      } else if (activeTab === 'comments') {
        const res = await fetch(`/api/admin/comments?status=${commentFilter}`);
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth/login?return=/admin/dashboard');
            return;
          }
          throw new Error(data.error);
        }
        setComments(data.data);
      } else if (activeTab === 'broadcasts') {
        const res = await fetch('/api/admin/broadcasts');
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth/login?return=/admin/dashboard');
            return;
          }
          throw new Error(data.error);
        }
        setBroadcasts(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSupporter = async (id, updates) => {
    try {
      const res = await fetch('/api/admin/supporters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const moderateComment = async (id, status, rejection_reason = null) => {
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, rejection_reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const sendBroadcast = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch('/api/admin/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broadcast_type: broadcastType,
          subject: broadcastSubject,
          message: broadcastMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      setBroadcastSubject('');
      setBroadcastMessage('');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColors = {
    pending_email: 'bg-yellow-100 text-yellow-800',
    pending_phone: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-navy mb-8">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('supporters')}
          className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'supporters'
              ? 'border-navy text-navy'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-5 h-5" />
          Supporters
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'comments'
              ? 'border-navy text-navy'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          Comments
        </button>
        <button
          onClick={() => setActiveTab('broadcasts')}
          className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'broadcasts'
              ? 'border-navy text-navy'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Send className="w-5 h-5" />
          Broadcasts
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Supporters Tab */}
      {activeTab === 'supporters' && (
        <div>
          <div className="flex gap-2 mb-4">
            {['all', 'pending_email', 'pending_phone', 'approved', 'suspended'].map((s) => (
              <button
                key={s}
                onClick={() => setSupporterFilter(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  supporterFilter === s
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
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div>
          <div className="flex gap-2 mb-4">
            {['pending', 'approved', 'rejected', 'all'].map((s) => (
              <button
                key={s}
                onClick={() => setCommentFilter(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  commentFilter === s
                    ? 'bg-navy text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              {comments.map((c) => (
                <div key={c.id} className="bg-white rounded-xl shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{c.name}</span>
                      <span className="text-gray-500 text-sm ml-2">{c.email}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    On: {c.poll_title || c.idea_title || 'Unknown'}
                    {c.parent_id && <span className="ml-2 text-gray-400">(reply)</span>}
                  </div>
                  <p className="text-gray-800 mb-3 whitespace-pre-wrap">{c.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{formatDate(c.created_at)}</span>
                    {c.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => moderateComment(c.id, 'approved')}
                          className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Rejection reason (optional):');
                            moderateComment(c.id, 'rejected', reason);
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
              {comments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No comments found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Broadcasts Tab */}
      {activeTab === 'broadcasts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send new broadcast */}
          <div>
            <h2 className="text-xl font-bold text-navy mb-4">Send Broadcast</h2>
            <form onSubmit={sendBroadcast} className="bg-white rounded-xl shadow p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                >
                  <option value="email">Email Only</option>
                  <option value="sms">SMS Only</option>
                  <option value="both">Both Email & SMS</option>
                </select>
              </div>

              {(broadcastType === 'email' || broadcastType === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                    placeholder="Email subject line"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                  placeholder="Your message to supporters..."
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-prosper-red text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Broadcast
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Recent broadcasts */}
          <div>
            <h2 className="text-xl font-bold text-navy mb-4">Recent Broadcasts</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-navy" />
              </div>
            ) : (
              <div className="space-y-4">
                {broadcasts.map((b) => (
                  <div key={b.id} className="bg-white rounded-xl shadow p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{b.subject || '(SMS)'}</span>
                      <span className="text-xs text-gray-500">{formatDate(b.sent_at)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{b.body}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {b.email_recipient_count} emails
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {b.sms_recipient_count} SMS
                      </span>
                    </div>
                  </div>
                ))}
                {broadcasts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No broadcasts sent yet
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
