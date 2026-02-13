'use client';

import { useState, useMemo } from 'react';
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
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    phone: '',
  });

  const validateEmail = (email) => {
    if (!email) {
      setValidationErrors((prev) => ({ ...prev, email: '' }));
      return true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationErrors((prev) => ({ ...prev, email: 'Invalid email format' }));
      return false;
    }

    setValidationErrors((prev) => ({ ...prev, email: '' }));
    return true;
  };

  const validatePhone = (phone) => {
    if (!phone) {
      setValidationErrors((prev) => ({ ...prev, phone: '' }));
      return true;
    }

    const validation = validatePhoneNumber(phone);
    if (!validation.valid) {
      setValidationErrors((prev) => ({ ...prev, phone: validation.error || 'Invalid phone number' }));
      return false;
    }

    setValidationErrors((prev) => ({ ...prev, phone: '' }));
    return true;
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setForm({ ...form, email: newEmail });
    validateEmail(newEmail);
  };

  const handlePhoneChange = (e) => {
    const newPhone = e.target.value;
    setForm({ ...form, phone: newPhone });
    validatePhone(newPhone);
  };

  // Memoize form validity to prevent infinite re-renders
  const isFormValid = useMemo(() => {
    if (selectedAction === 'endorsement') {
      const firstNameValid = form.firstName.trim().length > 0;
      const lastNameValid = form.lastName.trim().length > 0;
      const emailValid = form.email.trim().length > 0 && !validationErrors.email;
      const phoneValid = form.phone.trim().length > 0 && !validationErrors.phone;
      const streetAddressValid = form.streetAddress.trim().length > 0;
      const zipCodeValid = /^\d{5}$/.test(form.zipCode.trim());

      return firstNameValid && lastNameValid && emailValid && phoneValid && streetAddressValid && zipCodeValid;
    }

    const nameValid = form.name.trim().length > 0;
    const emailValid = form.email.trim().length > 0 && !validationErrors.email;
    const phoneValid = selectedAction === 'host_event'
      ? form.phone.trim().length > 0 && !validationErrors.phone
      : !validationErrors.phone;

    return nameValid && emailValid && phoneValid;
  }, [form.name, form.firstName, form.lastName, form.email, form.phone, form.streetAddress, form.zipCode, validationErrors, selectedAction]);

  const getFormTitle = () => {
    const actionTitles = {
      updates: 'Stay Informed',
      yard_sign: 'Request a Yard Sign',
      volunteer: 'Volunteer Your Time',
      host_event: 'Meet with Doug',
      endorsement: 'Endorse Doug',
    };
    return actionTitles[selectedAction] || '';
  };

  const getFormIcon = () => {
    const actionIcons = {
      updates: '📬',
      yard_sign: '🏠',
      volunteer: '🤝',
      host_event: '☕',
      endorsement: '✓',
    };
    return actionIcons[selectedAction] || '';
  };

  const getSubmitLabel = () => {
    const labels = {
      updates: 'Subscribe',
      yard_sign: 'Request Sign',
      volunteer: 'Sign Up',
      host_event: 'Request Meeting',
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
          {selectedAction === 'endorsement' ? (
            <>
              {/* Endorsement-specific fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="firstName" className="form-label">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    aria-required="true"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="form-input"
                    autoComplete="given-name"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="form-label">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    aria-required="true"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="form-input"
                    autoComplete="family-name"
                  />
                </div>
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
                  aria-invalid={!!validationErrors.email}
                  aria-describedby={validationErrors.email ? 'email-error' : undefined}
                  value={form.email}
                  onChange={handleEmailChange}
                  className={`form-input ${
                    validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  autoComplete="email"
                />
                {validationErrors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="form-label">
                  Phone *
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  aria-required="true"
                  aria-invalid={!!validationErrors.phone}
                  aria-describedby={validationErrors.phone ? 'phone-error' : 'phone-hint'}
                  value={form.phone}
                  onChange={handlePhoneChange}
                  className={`form-input ${
                    validationErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="(555) 555-5555"
                  autoComplete="tel"
                />
                {validationErrors.phone ? (
                  <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
                    {validationErrors.phone}
                  </p>
                ) : (
                  <p id="phone-hint" className="text-sm text-gray-700 mt-1">
                    US phone numbers only
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="streetAddress" className="form-label">
                  Street Address *
                </label>
                <input
                  id="streetAddress"
                  type="text"
                  required
                  aria-required="true"
                  value={form.streetAddress}
                  onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
                  className="form-input"
                  placeholder="123 Main St"
                  autoComplete="street-address"
                />
                <p className="text-sm text-gray-700 mt-1">
                  Must be in Prosper, TX to endorse
                </p>
              </div>

              <div>
                <label htmlFor="zipCode" className="form-label">
                  Zip Code *
                </label>
                <input
                  id="zipCode"
                  type="text"
                  required
                  aria-required="true"
                  value={form.zipCode}
                  onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                  className="form-input"
                  placeholder="75078"
                  maxLength={5}
                  pattern="\d{5}"
                  autoComplete="postal-code"
                />
                <p className="text-sm text-gray-700 mt-1">
                  5-digit Prosper zip code
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Standard fields for other actions */}
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
                  aria-invalid={!!validationErrors.email}
                  aria-describedby={validationErrors.email ? 'email-error' : undefined}
                  value={form.email}
                  onChange={handleEmailChange}
                  className={`form-input ${
                    validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  autoComplete="email"
                />
                {validationErrors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="form-label">
                  Phone {selectedAction === 'host_event' ? '*' : '(optional)'}
                </label>
                <input
                  id="phone"
                  type="tel"
                  required={selectedAction === 'host_event'}
                  aria-required={selectedAction === 'host_event' ? 'true' : undefined}
                  aria-invalid={!!validationErrors.phone}
                  aria-describedby={validationErrors.phone ? 'phone-error' : 'phone-hint'}
                  value={form.phone}
                  onChange={handlePhoneChange}
                  className={`form-input ${
                    validationErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="(555) 555-5555"
                  autoComplete="tel"
                />
                {validationErrors.phone ? (
                  <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
                    {validationErrors.phone}
                  </p>
                ) : (
                  <p id="phone-hint" className="text-sm text-gray-700 mt-1">
                    US phone numbers only
                  </p>
                )}
              </div>
            </>
          )}

          {selectedAction === 'yard_sign' && (
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

          {(selectedAction === 'volunteer' || selectedAction === 'host_event') && (
            <div>
              <label htmlFor="volunteer-message" className="form-label">
                {selectedAction === 'host_event' ? 'Preferred time or message' : 'Message (optional)'}
              </label>
              <textarea
                id="volunteer-message"
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="form-input"
                placeholder={selectedAction === 'host_event' ? 'Let us know your availability...' : ''}
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
            disabled={isSubmitting || !isFormValid}
            className="btn-primary w-full disabled:bg-gray-400 disabled:text-gray-700 disabled:cursor-not-allowed disabled:border-gray-400"
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
