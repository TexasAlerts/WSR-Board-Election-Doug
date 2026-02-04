'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Users,
  MessageSquare,
} from 'lucide-react';

export default function AdminPollsPage() {
  const router = useRouter();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPoll, setEditingPoll] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    poll_type: 'single_choice',
    visibility: 'public',
    status: 'draft',
    allow_comments: true,
    show_results_before_vote: false,
    closes_at: '',
    choices: [{ choice_text: '' }, { choice_text: '' }],
  });

  const loadPolls = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const url =
        statusFilter === 'all' ? '/api/admin/polls' : `/api/admin/polls?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/login?return=/admin/polls');
          return;
        }
        throw new Error(data.error);
      }

      setPolls(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, router]);

  useEffect(() => {
    loadPolls();
  }, [loadPolls]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      poll_type: 'single_choice',
      visibility: 'public',
      status: 'draft',
      allow_comments: true,
      show_results_before_vote: false,
      closes_at: '',
      choices: [{ choice_text: '' }, { choice_text: '' }],
    });
    setEditingPoll(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Filter out empty choices
      const validChoices = formData.choices.filter((c) => c.choice_text.trim());
      if (validChoices.length < 2) {
        throw new Error('At least 2 choices are required');
      }

      const payload = {
        ...formData,
        choices: validChoices.map((c, i) => ({ ...c, display_order: i })),
        closes_at: formData.closes_at || null,
      };

      const url = editingPoll ? `/api/admin/polls/${editingPoll.id}` : '/api/admin/polls';
      const method = editingPoll ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      resetForm();
      loadPolls();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (poll) => {
    setFormData({
      title: poll.title,
      description: poll.description || '',
      poll_type: poll.poll_type,
      visibility: poll.visibility || 'public',
      status: poll.status,
      allow_comments: poll.allow_comments,
      show_results_before_vote: poll.show_results_before_vote,
      closes_at: poll.closes_at ? poll.closes_at.slice(0, 16) : '',
      choices:
        poll.poll_choices.length > 0
          ? poll.poll_choices.map((c) => ({ id: c.id, choice_text: c.choice_text }))
          : [{ choice_text: '' }, { choice_text: '' }],
    });
    setEditingPoll(poll);
    setShowCreateForm(true);
  };

  const handleDelete = async (poll) => {
    if (!confirm(`Are you sure you want to delete "${poll.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/polls/${poll.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadPolls();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (poll, newStatus) => {
    try {
      const res = await fetch(`/api/admin/polls/${poll.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadPolls();
    } catch (err) {
      alert(err.message);
    }
  };

  const addChoice = () => {
    setFormData({
      ...formData,
      choices: [...formData.choices, { choice_text: '' }],
    });
  };

  const removeChoice = (index) => {
    if (formData.choices.length <= 2) return;
    setFormData({
      ...formData,
      choices: formData.choices.filter((_, i) => i !== index),
    });
  };

  const updateChoice = (index, value) => {
    const newChoices = [...formData.choices];
    newChoices[index] = { ...newChoices[index], choice_text: value };
    setFormData({ ...formData, choices: newChoices });
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
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    closed: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-navy"
          >
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-navy">Polls Management</h1>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="flex items-center gap-2 bg-prosper-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
        >
          <Plus className="w-5 h-5" />
          Create Poll
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-navy">
                  {editingPoll ? 'Edit Poll' : 'Create New Poll'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-600 hover:text-gray-700 text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close form"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="poll-title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Title *
                  </label>
                  <input
                    id="poll-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                    placeholder="What should we prioritize?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="poll-description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="poll-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                    placeholder="Optional description or context for the poll"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="poll-type"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Poll Type
                    </label>
                    <select
                      id="poll-type"
                      value={formData.poll_type}
                      onChange={(e) => setFormData({ ...formData, poll_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                    >
                      <option value="single_choice">Single Choice</option>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="ranked_choice">Ranked Choice</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="poll-visibility"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Visibility
                    </label>
                    <select
                      id="poll-visibility"
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                    >
                      <option value="public">Public (anyone can vote)</option>
                      <option value="public_view">
                        Public View (view only, must login to vote)
                      </option>
                      <option value="authenticated">Authenticated Only</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="poll-status"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Status
                    </label>
                    <select
                      id="poll-status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="poll-closes-at"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Closes At (optional)
                    </label>
                    <input
                      id="poll-closes-at"
                      type="datetime-local"
                      value={formData.closes_at}
                      onChange={(e) => setFormData({ ...formData, closes_at: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={formData.allow_comments}
                      onChange={(e) =>
                        setFormData({ ...formData, allow_comments: e.target.checked })
                      }
                      className="w-5 h-5 min-w-[20px] rounded border-gray-300 text-navy focus:ring-navy"
                    />
                    <span className="text-sm text-gray-700">Allow comments</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={formData.show_results_before_vote}
                      onChange={(e) =>
                        setFormData({ ...formData, show_results_before_vote: e.target.checked })
                      }
                      className="w-5 h-5 min-w-[20px] rounded border-gray-300 text-navy focus:ring-navy"
                    />
                    <span className="text-sm text-gray-700">Show results before voting</span>
                  </label>
                </div>

                {/* Choices */}
                <div>
                  <span
                    className="block text-sm font-medium text-gray-700 mb-2"
                    id="poll-choices-label"
                  >
                    Choices * (minimum 2)
                  </span>
                  <div className="space-y-2">
                    {formData.choices.map((choice, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={choice.choice_text}
                          onChange={(e) => updateChoice(index, e.target.value)}
                          placeholder={`Choice ${index + 1}`}
                          aria-label={`Choice ${index + 1}`}
                          aria-describedby="poll-choices-label"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                        />
                        {formData.choices.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeChoice(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addChoice}
                    className="mt-2 text-sm text-navy hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Choice
                  </button>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-prosper-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : editingPoll ? (
                      'Update Poll'
                    ) : (
                      'Create Poll'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Status Filter */}
      <div className="flex gap-2 mb-6">
        {['all', 'draft', 'active', 'closed'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusFilter === s
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Polls List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-navy" />
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <div key={poll.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-navy">{poll.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[poll.status]}`}
                    >
                      {poll.status}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-600">
                      {poll.poll_type === 'single_choice'
                        ? 'Single'
                        : poll.poll_type === 'multiple_choice'
                          ? 'Multiple'
                          : 'Ranked'}{' '}
                      choice
                    </span>
                  </div>
                  {poll.description && <p className="text-gray-600 text-sm">{poll.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(poll)}
                    className="p-2 text-gray-600 hover:text-navy hover:bg-gray-100 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(poll)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Choices preview */}
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-2">Choices:</div>
                <div className="flex flex-wrap gap-2">
                  {poll.poll_choices?.map((choice) => (
                    <span
                      key={choice.id}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                    >
                      {choice.choice_text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {poll.vote_count} votes
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    {poll.choice_count} choices
                  </span>
                  {poll.allow_comments && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      Comments enabled
                    </span>
                  )}
                  {poll.closes_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Closes {formatDate(poll.closes_at)}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {poll.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange(poll, 'active')}
                      className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Publish
                    </button>
                  )}
                  {poll.status === 'active' && (
                    <button
                      onClick={() => handleStatusChange(poll, 'closed')}
                      className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                    >
                      <EyeOff className="w-4 h-4" />
                      Close
                    </button>
                  )}
                  {poll.status === 'closed' && (
                    <button
                      onClick={() => handleStatusChange(poll, 'active')}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Reopen
                    </button>
                  )}
                  <Link
                    href={`/polls`}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                </div>
              </div>

              <div className="text-xs text-gray-400 mt-3">
                Created {formatDate(poll.created_at)}
                {poll.published_at && ` · Published ${formatDate(poll.published_at)}`}
              </div>
            </div>
          ))}

          {polls.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No polls found</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateForm(true);
                }}
                className="mt-4 text-navy hover:underline"
              >
                Create your first poll
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
