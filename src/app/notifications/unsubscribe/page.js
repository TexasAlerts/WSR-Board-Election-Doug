'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const type = searchParams.get('type') || 'all';

  const typeLabels = {
    email_on_comment_moderation: 'comment moderation',
    email_on_new_comment: 'new comment',
    email_on_new_reply: 'reply',
    email_on_weekly_digest: 'weekly digest',
    all: 'all',
  };

  const hasResult = success !== null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {hasResult && success === 'true' ? (
          <>
            <div className="text-green-500 text-5xl mb-4">&#10003;</div>
            <h1 className="text-xl font-semibold text-navy mb-2">Unsubscribed</h1>
            <p className="text-gray-600">
              You have been unsubscribed from {typeLabels[type] || type} notifications.
            </p>
          </>
        ) : hasResult ? (
          <>
            <div className="text-red-500 text-5xl mb-4">&#10007;</div>
            <h1 className="text-xl font-semibold text-navy mb-2">Something Went Wrong</h1>
            <p className="text-gray-600">The unsubscribe link may be invalid or expired.</p>
          </>
        ) : (
          <>
            <div className="text-navy text-5xl mb-4">&#9993;</div>
            <h1 className="text-xl font-semibold text-navy mb-2">Notification Preferences</h1>
            <p className="text-gray-600">
              To manage your notification preferences, use the unsubscribe link in any notification email you have received.
            </p>
          </>
        )}
        <div className="mt-6">
          <Link href="/polls" className="text-navy font-medium hover:underline">
            Back to Polls
          </Link>
        </div>
      </div>
    </div>
  );
}
