'use client';

import { useRef, useEffect } from 'react';
import { UserCheck, Mail, UserX } from 'lucide-react';

/**
 * VotingOptionsModal - Shows voting options to non-authenticated users
 * Offers three paths:
 * 1. Register (full access: vote, comment, notifications)
 * 2. Verify Email (vote + notifications)
 * 3. Vote Anonymously (vote only, no registration)
 */
export default function VotingOptionsModal({ onClose, onOptionSelected }) {
  const modalRef = useRef(null);

  // Scroll lock to prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Focus trap and escape key handler
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="voting-options-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pb-safe outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 id="voting-options-title" className="text-2xl sm:text-3xl font-bold text-navy">
              Choose How to Vote
            </h2>
            <button
              onClick={onClose}
              aria-label="Close voting options"
              className="text-gray-600 hover:text-gray-700 text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              ×
            </button>
          </div>

          <p className="text-gray-600 mb-8 text-lg">
            Select your preferred way to participate in this poll:
          </p>

          <div className="space-y-4">
            {/* Option 1: Register for Full Access */}
            <button
              onClick={() => onOptionSelected('register')}
              aria-label="Register for full access - vote, comment, and get notified"
              className="w-full text-left p-6 rounded-xl border-2 border-navy/20 hover:border-navy hover:bg-navy/5 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-navy/10 group-hover:bg-navy flex items-center justify-center flex-shrink-0 transition-colors">
                  <UserCheck className="w-6 h-6 text-navy group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-navy mb-2">Register for Full Access</h3>
                  <p className="text-gray-600 mb-3">
                    Create an account to unlock all features and stay engaged with the campaign.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>
                        <strong className="text-navy">Vote</strong> on all polls
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>
                        <strong className="text-navy">Comment</strong> and reply to discussions
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>
                        <strong className="text-navy">Get notified</strong> when polls you voted on
                        close
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>
                        <strong className="text-navy">Track</strong> your voting history
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </button>

            {/* Option 2: Verify Email */}
            <button
              onClick={() => onOptionSelected('verify')}
              aria-label="Verify email to vote and get notified"
              className="w-full text-left p-6 rounded-xl border-2 border-navy/20 hover:border-navy hover:bg-navy/5 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-navy/10 group-hover:bg-navy flex items-center justify-center flex-shrink-0 transition-colors">
                  <Mail className="w-6 h-6 text-navy group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-navy mb-2">Verify Email to Get Notified</h3>
                  <p className="text-gray-600 mb-3">
                    Quickly verify your email to vote and receive poll result notifications.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>
                        <strong className="text-navy">Vote</strong> on all polls
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>
                        <strong className="text-navy">Get notified</strong> when polls you voted on
                        close
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gray-500">○</span>
                      <span className="text-gray-500">Comments require full registration</span>
                    </li>
                  </ul>
                </div>
              </div>
            </button>

            {/* Option 3: Vote Anonymously */}
            <button
              onClick={() => onOptionSelected('anonymous')}
              aria-label="Vote anonymously without registration"
              className="w-full text-left p-6 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors">
                  <UserX className="w-6 h-6 text-gray-600 group-hover:text-gray-700 transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Vote Anonymously</h3>
                  <p className="text-gray-600 mb-3">
                    Vote without providing any personal information. No registration required.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>
                        <strong className="text-gray-900">Vote</strong> on this poll
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gray-500">○</span>
                      <span className="text-gray-500">No notifications about results</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gray-500">○</span>
                      <span className="text-gray-500">Cannot comment or reply</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-3 italic">
                    Note: A cookie is used to prevent duplicate votes from the same browser.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
