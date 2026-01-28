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
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
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
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-prosper-red rounded-lg hover:bg-red-700 font-medium"
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
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
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
          <button type="button" onClick={onCancel} className="p-1 hover:bg-gray-100 rounded" aria-label="Close">
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
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-navy rounded-lg hover:bg-navy-dark font-medium"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
