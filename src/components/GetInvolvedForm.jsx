'use client';

import { validatePhoneNumber } from '../lib/phoneValidation';

export default function GetInvolvedForm({
  selectedAction,
  form,
  setForm,
  submitMsg,
  onSubmit,
  onClose,
  isSubmitting,
}) {
  const getFormTitle = () => {
    const actionTitles = {
      updates: 'Stay Informed',
      yardsign: 'Request a Yard Sign',
      volunteer: 'Volunteer Your Time',
      meeting: 'Meet with Doug',
      endorsement: 'Endorse Doug',
    };
    return actionTitles[selectedAction] || '';
  };

  const getFormIcon = () => {
    const actionIcons = {
      updates: '📬',
      yardsign: '🏠',
      volunteer: '🤝',
      meeting: '☕',
      endorsement: '✓',
    };
    return actionIcons[selectedAction] || '';
  };

  const getSubmitLabel = () => {
    const labels = {
      updates: 'Subscribe',
      yardsign: 'Request Sign',
      volunteer: 'Sign Up',
      meeting: 'Request Meeting',
      endorsement: 'Submit Endorsement',
    };
    return labels[selectedAction] || 'Submit';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getFormIcon()}</span>
          {getFormTitle() && <h2 className="text-xl font-bold text-navy">{getFormTitle()}</h2>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-600 hover:text-gray-700 text-xl font-bold min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close form"
        >
          ×
        </button>
      </div>

      {submitMsg && submitMsg.includes('Thank you') ? (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg" role="status" aria-live="polite">
          <p className="text-green-800 font-semibold">{submitMsg}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 text-navy font-medium hover:underline"
          >
            ← Back to options
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="form-label">
              Name *
            </label>
            <input
              id="name"
              type="text"
              required
              aria-required="true"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="form-input"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="email" className="form-label">
              Email *
            </label>
            <input
              id="email"
              type="email"
              required
              aria-required="true"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="form-input"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="phone" className="form-label">
              Phone {selectedAction === 'meeting' ? '*' : '(optional)'}
            </label>
            <input
              id="phone"
              type="tel"
              required={selectedAction === 'meeting'}
              aria-required={selectedAction === 'meeting' ? 'true' : undefined}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="form-input"
              placeholder="(555) 555-5555"
              aria-describedby="phone-hint"
              autoComplete="tel"
            />
            <p id="phone-hint" className="text-sm text-gray-700 mt-1">
              US phone numbers only
            </p>
          </div>

          {selectedAction === 'yardsign' && (
            <div>
              <label htmlFor="address" className="form-label">
                Delivery Address *
              </label>
              <input
                id="address"
                type="text"
                required
                aria-required="true"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="form-input"
                placeholder="Street address in Prosper"
                autoComplete="street-address"
              />
            </div>
          )}

          {selectedAction === 'endorsement' && (
            <div>
              <label htmlFor="endorsement-message" className="form-label">
                Why I support Doug (optional)
              </label>
              <textarea
                id="endorsement-message"
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="form-input"
                placeholder="Share why you're endorsing Doug for Town Council..."
              />
            </div>
          )}

          {(selectedAction === 'volunteer' || selectedAction === 'meeting') && (
            <div>
              <label htmlFor="volunteer-message" className="form-label">
                {selectedAction === 'meeting' ? 'Preferred time or message' : 'Message (optional)'}
              </label>
              <textarea
                id="volunteer-message"
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="form-input"
                placeholder={selectedAction === 'meeting' ? 'Let us know your availability...' : ''}
              />
            </div>
          )}

          <fieldset className="space-y-3 pt-2">
            <legend className="sr-only">Communication preferences</legend>
            <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={form.consentEmail}
                onChange={(e) => setForm({ ...form, consentEmail: e.target.checked })}
                className="mt-0.5 h-5 w-5 min-w-[20px] rounded border-gray-300 text-navy focus:ring-navy focus:ring-2"
              />
              <span className="text-sm text-gray-600">
                I agree to receive campaign updates via email. You can unsubscribe at any time.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={form.consentSms}
                onChange={(e) => setForm({ ...form, consentSms: e.target.checked })}
                className="mt-0.5 h-5 w-5 min-w-[20px] rounded border-gray-300 text-navy focus:ring-navy focus:ring-2"
              />
              <span className="text-sm text-gray-600">
                I agree to receive campaign updates via text message. Msg & data rates may apply.
                Reply STOP to opt out.
              </span>
            </label>
          </fieldset>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : getSubmitLabel()}
          </button>

          {submitMsg && !submitMsg.includes('Thank you') && (
            <div role="alert" aria-live="assertive" className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{submitMsg}</p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
