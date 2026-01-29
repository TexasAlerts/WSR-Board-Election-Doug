'use client';

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, MessageSquare, Send, Loader2, FileText, AlertTriangle, ThumbsUp, Lightbulb, HelpCircle, UserPlus, BarChart3 } from 'lucide-react';
import { ConfirmModal, PromptModal } from '../../../components/AdminModal';

const SupportersTab = lazy(() => import('../../../components/admin/SupportersTab'));
const CommentsTab = lazy(() => import('../../../components/admin/CommentsTab'));
const BroadcastsTab = lazy(() => import('../../../components/admin/BroadcastsTab'));
const AuditLogsTab = lazy(() => import('../../../components/admin/AuditLogsTab'));
const ErrorLogsTab = lazy(() => import('../../../components/admin/ErrorLogsTab'));
const EndorsementsTab = lazy(() => import('../../../components/admin/EndorsementsTab'));
const QuestionsTab = lazy(() => import('../../../components/admin/QuestionsTab'));
const IdeasTab = lazy(() => import('../../../components/admin/IdeasTab'));
const InterestTab = lazy(() => import('../../../components/admin/InterestTab'));
const ReportsTab = lazy(() => import('../../../components/admin/ReportsTab'));

function TabSpinner() {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-navy" />
    </div>
  );
}

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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const handleAuthError = (res) => {
        if (res.status === 401) {
          router.push('/auth/login?return=/admin/dashboard');
          return true;
        }
        return false;
      };

      let res, data;

      if (activeTab === 'supporters') {
        res = await fetch(`/api/admin/supporters?status=${supporterFilter}`);
        data = await res.json();
        if (!res.ok) { if (handleAuthError(res)) return; throw new Error(data.error); }
        setSupporters(data.data);
      } else if (activeTab === 'comments') {
        res = await fetch(`/api/admin/comments?status=${commentFilter}`);
        data = await res.json();
        if (!res.ok) { if (handleAuthError(res)) return; throw new Error(data.error); }
        setComments(data.data);
      } else if (activeTab === 'broadcasts') {
        res = await fetch('/api/admin/broadcasts');
        data = await res.json();
        if (!res.ok) { if (handleAuthError(res)) return; throw new Error(data.error); }
        setBroadcasts(data.data);
      } else if (activeTab === 'audit') {
        const url = auditFilter === 'all'
          ? '/api/admin/audit-logs?limit=100'
          : `/api/admin/audit-logs?event_type=${auditFilter}&limit=100`;
        res = await fetch(url);
        data = await res.json();
        if (!res.ok) { if (handleAuthError(res)) return; throw new Error(data.error); }
        setAuditLogs(data.data);
      } else if (activeTab === 'errors') {
        const url = errorFilter === 'all'
          ? '/api/admin/errors?limit=100'
          : `/api/admin/errors?status=${errorFilter}&limit=100`;
        res = await fetch(url);
        data = await res.json();
        if (!res.ok) { if (handleAuthError(res)) return; throw new Error(data.error); }
        setErrorLogs(data.data);
      } else if (activeTab === 'endorsements') {
        const url = endorsementFilter === 'all'
          ? '/api/admin/endorsements?status=all'
          : `/api/admin/endorsements?status=${endorsementFilter}`;
        res = await fetch(url);
        data = await res.json();
        if (!res.ok) { if (handleAuthError(res)) return; throw new Error(data.error); }
        setEndorsements(data.data || []);
      } else if (activeTab === 'questions') {
        const url = questionFilter === 'all'
          ? '/api/admin/qna?status=all'
          : `/api/admin/qna?status=${questionFilter}`;
        res = await fetch(url);
        data = await res.json();
        if (!res.ok) { if (handleAuthError(res)) return; throw new Error(data.error); }
        setQuestions(data.data || []);
      } else if (activeTab === 'ideas') {
        const url = ideaFilter === 'all'
          ? '/api/admin/ideas?status=all'
          : `/api/admin/ideas?status=${ideaFilter}`;
        res = await fetch(url);
        data = await res.json();
        if (!res.ok) { if (handleAuthError(res)) return; throw new Error(data.error); }
        setIdeas(data.data || []);
      } else if (activeTab === 'interest') {
        const url = interestFilter === 'all'
          ? '/api/admin/interest?type=all'
          : `/api/admin/interest?type=${interestFilter}`;
        res = await fetch(url);
        data = await res.json();
        if (!res.ok) { if (handleAuthError(res)) return; throw new Error(data.error); }
        setInterest(data.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, supporterFilter, commentFilter, auditFilter, errorFilter, endorsementFilter, questionFilter, ideaFilter, interestFilter, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const deleteSupporter = async (id) => {
    const reason = await showPrompt('Delete Supporter', 'Reason for deletion', '', false);
    if (!reason) return;
    const confirmed = await showConfirm(
      'Confirm Permanent Deletion',
      'This will permanently delete this supporter and cannot be undone. Their votes, comments, and ideas will be preserved but disassociated. Continue?'
    );
    if (!confirmed) return;
    try {
      const res = await fetch('/api/admin/supporters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reason }),
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

  const tabs = [
    { id: 'supporters', label: 'Supporters', mobileLabel: 'Users', Icon: Users },
    { id: 'comments', label: 'Comments', Icon: MessageSquare },
    { id: 'broadcasts', label: 'Broadcasts', mobileLabel: 'Send', Icon: Send },
    { id: 'audit', label: 'Audit Logs', mobileLabel: 'Audit', Icon: FileText },
    { id: 'errors', label: 'Errors', Icon: AlertTriangle },
    { id: 'endorsements', label: 'Endorsements', mobileLabel: 'Endorse', Icon: ThumbsUp },
    { id: 'questions', label: 'Q&A', Icon: HelpCircle },
    { id: 'ideas', label: 'Ideas', Icon: Lightbulb },
    { id: 'interest', label: 'Volunteers', mobileLabel: 'Vol', Icon: UserPlus },
    { id: 'reports', label: 'Reports', Icon: BarChart3 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-navy mb-8">Admin Dashboard</h1>

      {/* Tabs - scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 mb-6">
        <div className="flex gap-1 md:gap-2 border-b border-gray-200 min-w-max">
          {tabs.map(({ id, label, mobileLabel, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === id
                  ? 'border-navy text-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 md:w-5 md:h-5" />
              {mobileLabel ? (
                <>
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{mobileLabel}</span>
                </>
              ) : (
                label
              )}
            </button>
          ))}
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

      <Suspense fallback={<TabSpinner />}>
        {activeTab === 'supporters' && (
          <SupportersTab
            supporters={supporters} loading={loading} filter={supporterFilter}
            setFilter={setSupporterFilter} updateSupporter={updateSupporter} deleteSupporter={deleteSupporter}
            formatDate={formatDate} statusColors={statusColors}
          />
        )}

        {activeTab === 'comments' && (
          <CommentsTab
            comments={comments} loading={loading} filter={commentFilter}
            setFilter={setCommentFilter} moderateComment={moderateComment}
            showPrompt={showPrompt} formatDate={formatDate} statusColors={statusColors}
          />
        )}

        {activeTab === 'broadcasts' && (
          <BroadcastsTab
            broadcasts={broadcasts} loading={loading}
            broadcastType={broadcastType} setBroadcastType={setBroadcastType}
            broadcastSubject={broadcastSubject} setBroadcastSubject={setBroadcastSubject}
            broadcastMessage={broadcastMessage} setBroadcastMessage={setBroadcastMessage}
            sending={sending} sendBroadcast={sendBroadcast} formatDate={formatDate}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogsTab
            auditLogs={auditLogs} loading={loading} filter={auditFilter}
            setFilter={setAuditFilter} formatDate={formatDate}
          />
        )}

        {activeTab === 'errors' && (
          <ErrorLogsTab
            errorLogs={errorLogs} loading={loading} filter={errorFilter}
            setFilter={setErrorFilter} updateErrorStatus={updateErrorStatus}
            showPrompt={showPrompt} formatDate={formatDate}
          />
        )}

        {activeTab === 'endorsements' && (
          <EndorsementsTab
            endorsements={endorsements} loading={loading} filter={endorsementFilter}
            setFilter={setEndorsementFilter} handleEndorsementAction={handleEndorsementAction}
            showPrompt={showPrompt} formatDate={formatDate} statusColors={statusColors}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionsTab
            questions={questions} loading={loading} filter={questionFilter}
            setFilter={setQuestionFilter} handleQuestionAction={handleQuestionAction}
            showPrompt={showPrompt} formatDate={formatDate} statusColors={statusColors}
          />
        )}

        {activeTab === 'ideas' && (
          <IdeasTab
            ideas={ideas} loading={loading} filter={ideaFilter}
            setFilter={setIdeaFilter} handleIdeaAction={handleIdeaAction}
            showPrompt={showPrompt} formatDate={formatDate} statusColors={statusColors}
          />
        )}

        {activeTab === 'interest' && (
          <InterestTab
            interest={interest} loading={loading} filter={interestFilter}
            setFilter={setInterestFilter} handleDeleteInterest={handleDeleteInterest}
            formatDate={formatDate}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab />
        )}
      </Suspense>

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
