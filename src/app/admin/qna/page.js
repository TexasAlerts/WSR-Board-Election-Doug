"use client";
import { useState, useEffect } from 'react';

export default function AdminQna() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/qna');
        if (res.status === 401) {
          setError('Unauthorized. Please log in.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setPending(data.data || []);
      } catch (err) {
        setError('Error loading questions');
      }
      setLoading(false);
    }
    load();
  }, []);

  function handleAnswerChange(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function handleAction(id, action) {
    const answer = answers[id] || '';
    try {
      const res = await fetch('/api/admin/qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, answer }),
      });
      if (res.ok) {
        setPending((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pending Questions</h1>
      {loading ? (
        <p>Loading…</p>
      ) : pending.length === 0 ? (
        <p>No pending questions.</p>
      ) : (
        <div className="space-y-6">
          {pending.map((q) => (
            <div key={q.id} className="border p-4 rounded">
              <p className="font-medium mb-2">{q.question}</p>
              <textarea
                className="border p-2 rounded w-full mb-2"
                placeholder="Write your answer here…"
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                rows={3}
              ></textarea>
              <div className="flex gap-2">
                <button onClick={() => handleAction(q.id, 'approve')} className="bg-lagoon text-white px-3 py-1 rounded">
                  Approve
                </button>
                <button onClick={() => handleAction(q.id, 'reject')} className="bg-red-600 text-white px-3 py-1 rounded">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}