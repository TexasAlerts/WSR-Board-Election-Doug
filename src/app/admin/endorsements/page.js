"use client";
import { useState, useEffect } from 'react';

export default function AdminEndorsements() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/endorsements');
        if (res.status === 401) {
          setError('Unauthorized. Please log in.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setPending(data.data || []);
      } catch (err) {
        setError('Error loading endorsements');
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleAction(id, action) {
    try {
      const res = await fetch('/api/admin/endorsements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        setPending((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (error) return <div>{error}</div>;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pending Endorsements</h1>
      {loading ? (
        <p>Loading…</p>
      ) : pending.length === 0 ? (
        <p>No pending endorsements.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((e) => (
            <div key={e.id} className="border p-4 rounded">
              <p className="font-medium">{e.name}</p>
              {e.message && <p className="mt-1 italic">“{e.message}”</p>}
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleAction(e.id, 'approve')} className="bg-lagoon text-white px-3 py-1 rounded">Approve</button>
                <button onClick={() => handleAction(e.id, 'reject')} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}