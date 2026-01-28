'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, MessageSquare, Send, CheckCircle, XCircle, Clock, Mail, Phone, Loader2, FileText, AlertTriangle, Eye, RefreshCw, ThumbsUp, Lightbulb, HelpCircle, UserPlus, BarChart3 } from 'lucide-react';
import { ConfirmModal, PromptModal } from '../../../components/AdminModal';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('supporters');
  const [loading, setLoading] = useState(true);
  const [supporters, setSupporters] = useState([]);
  const [comments, setComments] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [endorsements, setEndorsements] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [interest, setInterest] = useState([]);
  const [supporterFilter, setSupporterFilter] = useState('all');
  const [endorsementFilter, setEndorsementFilter] = useState('pending');
  const [questionFilter, setQuestionFilter] = useState('pending');
  const [ideaFilter, setIdeaFilter] = useState('pending');
  const [interestFilter, setInterestFilter] = useState('all');
  const [commentFilter, setCommentFilter] = useState('pending');
  const [auditFilter, setAuditFilter] = useState('all');
  const [errorFilter, setErrorFilter] = useState('new');
  const [error, setError] = useState('');

  // Modal state for accessible confirm/prompt dialogs
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [promptModal, setPromptModal] = useState({ open: false, title: '', label: '', defaultValue: '', multiline: false, onSubmit: null });

  const showConfirm = useCallback((title, message) => {
    return new Promise((resolve) => {
      setConfirmModal({
        open: true, title, message,
        onConfirm: () => { setConfirmModal(m => ({ ...m, open: false })); resolve(true); },
      });
    });
  }, []);

  const showPrompt = useCallback((title, label, defaultValue = '', multiline = false) => {
    return new Promise((resolve) => {
      setPromptModal({
        open: true, title, label, defaultValue, multiline,
        onSubmit: (val) => { setPromptModal(m => ({ ...m, open: false })); resolve(val); },
      });
    });
  }, []);

  // Broadcast form state
  const [broadcastType, setBroadcastType] = useState('email');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab, supporterFilter, commentFilter, auditFilter, errorFilter, endorsementFilter, questionFilter, ideaFilter, interestFilter]);

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
      } else if (activeTab === 'audit') {
        const url = auditFilter === 'all'
          ? '/api/admin/audit-logs?limit=100'
          : `/api/admin/audit-logs?event_type=${auditFilter}&limit=100`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth/login?return=/admin/dashboard');
            return;
          }
          throw new Error(data.error);
        }
        setAuditLogs(data.data);
      } else if (activeTab === 'errors') {
        const url = errorFilter === 'all'
          ? '/api/admin/errors?limit=100'
          : `/api/admin/errors?status=${errorFilter}&limit=100`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth/login?return=/admin/dashboard');
            return;
          }
          throw new Error(data.error);
        }
        setErrorLogs(data.data);
      } else if (activeTab === 'endorsements') {
        const url = endorsementFilter === 'all'
          ? '/api/admin/endorsements?status=all'
          : `/api/admin/endorsements?status=${endorsementFilter}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth/login?return=/admin/dashboard');
            return;
          }
          throw new Error(data.error);
        }
        setEndorsements(data.data || []);
      } else if (activeTab === 'questions') {
        const url = questionFilter === 'all'
          ? '/api/admin/qna?status=all'
          : `/api/admin/qna?status=${questionFilter}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth/login?return=/admin/dashboard');
            return;
          }
          throw new Error(data.error);
        }
        setQuestions(data.data || []);
      } else if (activeTab === 'ideas') {
        const url = ideaFilter === 'all'
          ? '/api/admin/ideas?status=all'
          : `/api/admin/ideas?status=${ideaFilter}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth/login?return=/admin/dashboard');
            return;
          }
          throw new Error(data.error);
        }
        setIdeas(data.data || []);
      } else if (activeTab === 'interest') {
        const url = interestFilter === 'all'
          ? '/api/admin/interest?type=all'
          : `/api/admin/interest?type=${interestFilter}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth/login?return=/admin/dashboard');
            return;
          }
          throw new Error(data.error);
        }
        setInterest(data.data || []);
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

  const updateErrorStatus = async (id, status, resolution_notes = null) => {
    try {
      const res = await fetch('/api/admin/errors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, resolution_notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEndorsementAction = async (id, action, rejection_reason = null) => {
    try {
      const res = await fetch('/api/admin/endorsements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, rejection_reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuestionAction = async (id, action, answer = null, rejection_reason = null) => {
    try {
      const res = await fetch('/api/admin/qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, answer, rejection_reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleIdeaAction = async (id, action, admin_response = null, rejection_reason = null) => {
    try {
      const res = await fetch('/api/admin/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, admin_response, rejection_reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteInterest = async (id) => {
    const confirmed = await showConfirm('Delete Interest Record', 'Are you sure you want to delete this interest record?');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/interest?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadData();
    } catch (err) {
      alert(err.message);
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

      {/* Tabs - scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 mb-6">
        <div className="flex gap-1 md:gap-2 border-b border-gray-200 min-w-max">
          <button
            onClick={() => setActiveTab('supporters')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'supporters'
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Supporters</span>
            <span className="sm:hidden">Users</span>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'comments'
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
            Comments
          </button>
          <button
            onClick={() => setActiveTab('broadcasts')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'broadcasts'
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Broadcasts</span>
            <span className="sm:hidden">Send</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'audit'
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Audit Logs</span>
            <span className="sm:hidden">Audit</span>
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'errors'
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
            Errors
          </button>
          <button
            onClick={() => setActiveTab('endorsements')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'endorsements'
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ThumbsUp className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Endorsements</span>
            <span className="sm:hidden">Endorse</span>
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'questions'
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
            Q&A
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'ideas'
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lightbulb className="w-4 h-4 md:w-5 md:h-5" />
            Ideas
          </button>
          <button
            onClick={() => setActiveTab('interest')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'interest'
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Volunteers</span>
            <span className="sm:hidden">Vol</span>
          </button>
          <Link
            href="/admin/polls"
            className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm md:text-base border-transparent text-gray-500 hover:text-gray-700"
          >
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
            Polls
          </Link>
        </div>
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
                          onClick={async () => {
                            const reason = await showPrompt('Reject Comment', 'Rejection reason (optional):');
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

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
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
                onClick={() => setAuditFilter(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  auditFilter === s
                    ? 'bg-navy text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.replace(/_/g, ' ').toLowerCase()}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.event_type.includes('SUCCESS') || log.event_type.includes('APPROVED')
                            ? 'bg-green-100 text-green-800'
                            : log.event_type.includes('FAILED') || log.event_type.includes('SUSPENDED') || log.event_type.includes('REJECTED')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.event_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{log.supporter_name || '-'}</div>
                        <div className="text-xs text-gray-500">{log.supporter_email || '-'}</div>
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
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No audit logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Error Logs Tab */}
      {activeTab === 'errors' && (
        <div>
          <div className="flex gap-2 mb-4">
            {['new', 'investigating', 'resolved', 'wont_fix', 'all'].map((s) => (
              <button
                key={s}
                onClick={() => setErrorFilter(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  errorFilter === s
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
                        Won't Fix
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
      )}

      {/* Endorsements Tab */}
      {activeTab === 'endorsements' && (
        <div>
          <div className="flex gap-2 mb-4">
            {['pending', 'approved', 'rejected', 'all'].map((s) => (
              <button
                key={s}
                onClick={() => setEndorsementFilter(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  endorsementFilter === s
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
              {endorsements.map((e) => (
                <div key={e.id} className="bg-white rounded-xl shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{e.name}</span>
                      <span className="text-gray-500 text-sm ml-2">{e.email}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[e.status]}`}>
                      {e.status}
                    </span>
                  </div>
                  {e.message && (
                    <p className="text-gray-800 mb-3 whitespace-pre-wrap italic">"{e.message}"</p>
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
                            const reason = await showPrompt('Reject Endorsement', 'Rejection reason (will be sent to user):');
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
                <div className="text-center py-12 text-gray-500">
                  No endorsements found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Q&A Tab */}
      {activeTab === 'questions' && (
        <div>
          <div className="flex gap-2 mb-4">
            {['pending', 'approved', 'rejected', 'all'].map((s) => (
              <button
                key={s}
                onClick={() => setQuestionFilter(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  questionFilter === s
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
              {questions.map((q) => (
                <div key={q.id} className="bg-white rounded-xl shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{q.name}</span>
                      <span className="text-gray-500 text-sm ml-2">{q.email}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[q.status]}`}>
                      {q.status}
                    </span>
                  </div>
                  <p className="text-gray-800 mb-3 font-medium">{q.question}</p>
                  {q.answer && (
                    <div className="bg-green-50 p-3 rounded text-sm text-green-800 mb-3">
                      <strong>Answer:</strong> {q.answer}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{formatDate(q.created_at)}</span>
                    {q.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            const answer = await showPrompt('Answer Question', 'Your answer:', '', true);
                            if (answer) {
                              handleQuestionAction(q.id, 'approve', answer);
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Answer & Approve
                        </button>
                        <button
                          onClick={async () => {
                            const reason = await showPrompt('Reject Question', 'Rejection reason (will be sent to user):');
                            if (reason) {
                              handleQuestionAction(q.id, 'reject', null, reason);
                            }
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
              {questions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No questions found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ideas Tab */}
      {activeTab === 'ideas' && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {['pending', 'published', 'under_review', 'planned', 'completed', 'declined', 'all'].map((s) => (
              <button
                key={s}
                onClick={() => setIdeaFilter(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  ideaFilter === s
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
              {ideas.map((idea) => (
                <div key={idea.id} className="bg-white rounded-xl shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{idea.name}</span>
                      <span className="text-gray-500 text-sm ml-2">{idea.email}</span>
                      <span className="ml-2 px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-600">{idea.category}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[idea.status] || 'bg-gray-100 text-gray-600'}`}>
                      {idea.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-navy mb-2">{idea.title}</h3>
                  <p className="text-gray-700 mb-3 text-sm">{idea.content}</p>
                  {idea.admin_response && (
                    <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-3">
                      <strong>Admin response:</strong> {idea.admin_response}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{formatDate(idea.created_at)}</span>
                    {idea.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            const response = await showPrompt('Publish Idea', 'Your response (optional):');
                            handleIdeaAction(idea.id, 'publish', response);
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Publish
                        </button>
                        <button
                          onClick={async () => {
                            const reason = await showPrompt('Decline Idea', 'Rejection reason (will be sent to user):');
                            if (reason) {
                              handleIdeaAction(idea.id, 'reject', null, reason);
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          <XCircle className="w-4 h-4" />
                          Decline
                        </button>
                      </div>
                    )}
                    {idea.status !== 'pending' && idea.status !== 'declined' && (
                      <button
                        onClick={async () => {
                          const response = await showPrompt('Respond to Idea', 'Add/update response:', idea.admin_response || '', true);
                          if (response) {
                            handleIdeaAction(idea.id, 'respond', response);
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Respond
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {ideas.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No ideas found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Volunteers/Interest Tab */}
      {activeTab === 'interest' && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {['all', 'updates', 'volunteer', 'yardsign', 'meeting'].map((s) => (
              <button
                key={s}
                onClick={() => setInterestFilter(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  interestFilter === s
                    ? 'bg-navy text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'yardsign' ? 'Yard Signs' : s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-navy" />
            </div>
          ) : (
            <>
            {/* Mobile: Card view, Desktop: Table view */}
            <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {interest.map((i) => (
                    <tr key={i.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          i.type === 'volunteer' ? 'bg-green-100 text-green-700' :
                          i.type === 'yardsign' ? 'bg-blue-100 text-blue-700' :
                          i.type === 'meeting' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {i.type === 'yardsign' ? 'Yard Sign' : i.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{i.name}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm">{i.email}</div>
                        {i.phone && <div className="text-sm text-gray-500">{i.phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {i.message || '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(i.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteInterest(i.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="Delete"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {interest.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      i.type === 'volunteer' ? 'bg-green-100 text-green-700' :
                      i.type === 'yardsign' ? 'bg-blue-100 text-blue-700' :
                      i.type === 'meeting' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {i.type === 'yardsign' ? 'Yard Sign' : i.type}
                    </span>
                    <button
                      onClick={() => handleDeleteInterest(i.id)}
                      className="text-red-600 hover:text-red-800 p-2 -mr-2"
                      title="Delete"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="font-medium text-gray-900">{i.name}</div>
                  <div className="text-sm text-gray-600">{i.email}</div>
                  {i.phone && <div className="text-sm text-gray-500">{i.phone}</div>}
                  {i.message && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{i.message}</p>
                  )}
                  <div className="text-xs text-gray-400 mt-2">{formatDate(i.created_at)}</div>
                </div>
              ))}
              {interest.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No interest records found
                </div>
              )}
            </div>
            </>
          )}
        </div>
      )}
      {/* Accessible modal dialogs */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm || (() => {})}
        onCancel={() => setConfirmModal(m => ({ ...m, open: false }))}
      />
      <PromptModal
        open={promptModal.open}
        title={promptModal.title}
        label={promptModal.label}
        defaultValue={promptModal.defaultValue}
        multiline={promptModal.multiline}
        onSubmit={promptModal.onSubmit || (() => {})}
        onCancel={() => setPromptModal(m => ({ ...m, open: false }))}
      />
    </div>
  );
}
