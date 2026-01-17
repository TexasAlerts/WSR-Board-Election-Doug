"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        router.push('/admin/qna');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Error logging in');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 space-y-4 px-2 w-full">
      <h1 className="text-2xl font-bold">Admin Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Enter admin password" className="border p-2 rounded w-full min-h-[44px]" />
        <button type="submit" className="bg-lagoon text-white px-4 py-2 rounded w-full min-h-[44px]">Login</button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
}