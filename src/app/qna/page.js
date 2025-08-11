"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function QnaPage() {
  const [questions, setQuestions] = useState([]);
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/questions', { cache: 'no-store' });
        const data = await res.json();
        setQuestions(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);
  return (
    <div className="space-y-8">
      <h1 className="text-3xl sm:text-4xl font-bold">Questions & Answers</h1>
      {questions.length === 0 ? (
        <p>No questions have been answered yet. Submit yours on the home page.</p>
      ) : (
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="border-l-4 border-lagoon pl-4 py-2">
              <p className="font-medium">Q: {q.question}</p>
              <p className="mt-1">A: {q.answer}</p>
            </div>
          ))}
        </div>
      )}
      {/* Link to ask a new question */}
      <div className="mt-6">
        {/* Use Link with hash to scroll to question form on home */}
        <Link href={{ pathname: '/', hash: 'qna' }} className="text-coral hover:underline font-medium">
          Ask a Question
        </Link>
      </div>
    </div>
  );
}