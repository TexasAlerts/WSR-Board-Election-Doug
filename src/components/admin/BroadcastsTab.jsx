'use client';

import { Send, Loader2, Mail, Phone } from 'lucide-react';

export default function BroadcastsTab({
  broadcasts,
  loading,
  broadcastType,
  setBroadcastType,
  broadcastSubject,
  setBroadcastSubject,
  broadcastMessage,
  setBroadcastMessage,
  sending,
  sendBroadcast,
  formatDate,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-bold text-navy mb-4">Send Broadcast</h2>
        <form onSubmit={sendBroadcast} className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label
              htmlFor="broadcast-type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Type
            </label>
            <select
              id="broadcast-type"
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
              <label
                htmlFor="broadcast-subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subject
              </label>
              <input
                id="broadcast-subject"
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
            <label
              htmlFor="broadcast-message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message
            </label>
            <textarea
              id="broadcast-message"
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

      <div>
        <h2 className="text-xl font-bold text-navy mb-4">Recent Broadcasts</h2>
        {loading ? (
          <div role="status" aria-live="polite" className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-navy" aria-hidden="true" />
            <span className="sr-only">Loading broadcasts...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {broadcasts.map((b) => (
              <div key={b.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{b.subject || '(SMS)'}</span>
                  <span className="text-xs text-gray-700">{formatDate(b.sent_at)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{b.body}</p>
                <div className="flex gap-4 text-xs text-gray-700">
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
              <div className="text-center py-12 text-gray-700">No broadcasts sent yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
