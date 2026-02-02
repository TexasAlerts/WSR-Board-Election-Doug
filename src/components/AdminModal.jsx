'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible modal dialog for admin actions.
 * Replaces window.confirm() and window.prompt() with WCAG-compliant modals.
 */
export function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        <h2 id="confirm-title" className="text-lg font-bold text-navy mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 text-white bg-prosper-red rounded-lg hover:bg-red-700 font-medium min-h-[44px]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export function PromptModal({ open, title, label, defaultValue, onSubmit, onCancel, multiline }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onCancel]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(inputRef.current?.value || '');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="prompt-title">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 id="prompt-title" className="text-lg font-bold text-navy">{title}</h2>
          <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 rounded min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        {label && <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
        {multiline ? (
          <textarea
            id="prompt-input"
            ref={inputRef}
            defaultValue={defaultValue || ''}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-navy focus:border-navy min-h-[100px]"
            rows={4}
          />
        ) : (
          <input
            id="prompt-input"
            ref={inputRef}
            type="text"
            defaultValue={defaultValue || ''}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-navy focus:border-navy"
          />
        )}
        <div className="flex gap-3 justify-end mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2.5 text-white bg-navy rounded-lg hover:bg-navy-dark font-medium min-h-[44px]"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
