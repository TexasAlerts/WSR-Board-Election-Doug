'use client';

import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function QuestionsTab({
  questions,
  loading,
  filter,
  setFilter,
  handleQuestionAction,
  showPrompt,
  formatDate,
  statusColors,
}) {
  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['pending', 'approved', 'rejected', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === s ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[q.status]}`}
                >
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
                        const answer = await showPrompt(
                          'Answer Question',
                          'Your answer:',
                          '',
                          true
                        );
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
                        const reason = await showPrompt(
                          'Reject Question',
                          'Rejection reason (will be sent to user):'
                        );
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
            <div className="text-center py-12 text-gray-500">No questions found</div>
          )}
        </div>
      )}
    </div>
  );
}
