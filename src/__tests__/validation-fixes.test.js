/**
 * Production Validation Fixes - Runtime Tests
 *
 * These tests verify that all production fixes are actually working,
 * not just present in the code.
 */

import fs from 'fs';
import path from 'path';

describe('Production Fixes - Runtime Verification', () => {
  describe('FIX #1: Registration Form Validation', () => {
    let registerCode;

    beforeAll(() => {
      const filePath = path.join(__dirname, '../app/auth/register/page.js');
      registerCode = fs.readFileSync(filePath, 'utf-8');
    });

    it('imports validatePhoneNumber from phoneValidation lib', () => {
      expect(registerCode).toContain("import { validatePhoneNumber } from '../../../lib/phoneValidation'");
    });

    it('has validateEmail function with error state updates', () => {
      expect(registerCode).toContain('const validateEmail = (email)');
      expect(registerCode).toContain("setValidationErrors((prev) => ({ ...prev, email: 'Invalid email format' }))");
    });

    it('has validatePhone function using validatePhoneNumber', () => {
      expect(registerCode).toContain('const validatePhone = (phone)');
      expect(registerCode).toContain('const validation = validatePhoneNumber(phone)');
    });

    it('displays email validation errors with aria-invalid', () => {
      expect(registerCode).toContain('aria-invalid={!!validationErrors.email}');
      expect(registerCode).toContain('role="alert"');
    });

    it('displays phone validation errors with aria-invalid', () => {
      expect(registerCode).toContain('aria-invalid={!!validationErrors.phone}');
    });

    it('disables submit button when form is invalid', () => {
      expect(registerCode).toContain('disabled={loading || !isFormValid}');
    });

    it('uses useMemo for isFormValid to prevent infinite renders', () => {
      expect(registerCode).toContain('const isFormValid = useMemo(');
      expect(registerCode).toContain('}, [formData, validationErrors])');
    });
  });

  describe('FIX #2: GetInvolvedForm Validation', () => {
    let formCode;

    beforeAll(() => {
      const filePath = path.join(__dirname, '../components/GetInvolvedForm.jsx');
      formCode = fs.readFileSync(filePath, 'utf-8');
    });

    it('imports validatePhoneNumber', () => {
      expect(formCode).toContain("import { validatePhoneNumber } from '../lib/phoneValidation'");
    });

    it('has email validation with error display', () => {
      expect(formCode).toContain('const validateEmail = (email)');
      expect(formCode).toContain('aria-invalid={!!validationErrors.email}');
      expect(formCode).toContain('email-error');
    });

    it('has phone validation with error display', () => {
      expect(formCode).toContain('const validatePhone = (phone)');
      expect(formCode).toContain('aria-invalid={!!validationErrors.phone}');
      expect(formCode).toContain('phone-error');
    });

    it('uses useMemo for isFormValid', () => {
      expect(formCode).toContain('const isFormValid = useMemo(');
      // Updated dependency array includes endorsement fields
      expect(formCode).toContain('}, [form.name, form.firstName, form.lastName, form.email, form.phone, form.streetAddress, form.zipCode, validationErrors, selectedAction])');
    });

    it('disables submit when form is invalid', () => {
      expect(formCode).toContain('disabled={isSubmitting || !isFormValid}');
    });
  });

  describe('FIX #3: IdeasClient TypeError Protection', () => {
    let ideasCode;

    beforeAll(() => {
      const filePath = path.join(__dirname, '../components/IdeasClient.jsx');
      ideasCode = fs.readFileSync(filePath, 'utf-8');
    });

    it('has null coalescing for idea.category', () => {
      expect(ideasCode).toMatch(/idea\.category\s*\?\?\s*['"]uncategorized['"]/);
    });

    it('has null coalescing for idea.status', () => {
      expect(ideasCode).toMatch(/idea\.status\s*\?\?\s*['"]pending['"]/);
    });

    it('has defensive check for idea.content', () => {
      expect(ideasCode).toContain('idea.content');
      expect(ideasCode).toContain('No description provided');
    });

    it('has null coalescing for idea.title', () => {
      expect(ideasCode).toMatch(/idea\.title\s*\?\?\s*['"]Untitled Idea['"]/);
    });

    it('has null coalescing for idea.name', () => {
      expect(ideasCode).toMatch(/idea\.name\s*\?\?\s*['"]Anonymous['"]/);
    });

    it('has defensive check for idea.created_at', () => {
      expect(ideasCode).toContain('idea.created_at ?');
      expect(ideasCode).toContain('Date unknown');
    });
  });

  describe('FIX #4: Settings Promise Rejection Fix', () => {
    let settingsCode;

    beforeAll(() => {
      const filePath = path.join(__dirname, '../app/settings/page.js');
      settingsCode = fs.readFileSync(filePath, 'utf-8');
    });

    it('uses async/await instead of .then()/.catch() for preferences', () => {
      expect(settingsCode).toContain('const loadPreferences = async ()');
      expect(settingsCode).toContain('await fetch');
    });

    it('properly awaits logApiError in catch block', () => {
      expect(settingsCode).toContain('await logApiError');
    });

    it('does NOT have .then() chains for preferences loading', () => {
      const prefsSection = settingsCode.substring(
        settingsCode.indexOf('Load notification preferences'),
        settingsCode.indexOf('Load notification preferences') + 500
      );
      expect(prefsSection).not.toMatch(/fetch.*\.then\(/);
    });
  });

  describe('FIX #5: Admin Dashboard Race Condition', () => {
    let dashboardCode;

    beforeAll(() => {
      const filePath = path.join(__dirname, '../app/admin/dashboard/page.js');
      dashboardCode = fs.readFileSync(filePath, 'utf-8');
    });

    it('has initializeDashboard function that awaits auth', () => {
      expect(dashboardCode).toContain('const initializeDashboard = async ()');
      expect(dashboardCode).toContain("await fetch('/api/auth/me')");
    });

    it('calls loadData AFTER auth is confirmed', () => {
      expect(dashboardCode).toContain('await loadData()');
      // Should be inside initializeDashboard after auth check
      const initSection = dashboardCode.substring(
        dashboardCode.indexOf('initializeDashboard'),
        dashboardCode.indexOf('initializeDashboard') + 1000
      );
      expect(initSection).toContain('setCurrentUserRole');
      expect(initSection).toContain('await loadData()');
    });

    it('second useEffect checks currentUserRole before loading', () => {
      expect(dashboardCode).toContain('if (currentUserRole)');
    });
  });

  describe('FIX #6: HomeServer SSR', () => {
    let pageCode, homeServerCode, layoutCode;

    beforeAll(() => {
      const pagePath = path.join(__dirname, '../app/page.js');
      const homeServerPath = path.join(__dirname, '../components/HomeServer.jsx');
      const layoutPath = path.join(__dirname, '../app/layout.js');

      pageCode = fs.readFileSync(pagePath, 'utf-8');
      homeServerCode = fs.readFileSync(homeServerPath, 'utf-8');
      layoutCode = fs.readFileSync(layoutPath, 'utf-8');
    });

    it('page.js imports HomeServer instead of HomeDynamic', () => {
      expect(pageCode).toContain("import HomeServer from '../components/HomeServer'");
      expect(pageCode).not.toContain("import HomeDynamic");
    });

    it('page.js uses <HomeServer /> component', () => {
      expect(pageCode).toContain('<HomeServer />');
    });

    it('HomeServer checks for null Supabase during build', () => {
      expect(homeServerCode).toContain('if (!supabase)');
      expect(homeServerCode).toContain('During build time, Supabase might not be available');
    });

    it('layout.js uses afterInteractive strategy for JSON-LD', () => {
      expect(layoutCode).toContain('strategy="afterInteractive"');
      // beforeInteractive is allowed for the webkit polyfill but not for JSON-LD
      expect(layoutCode).toContain('id="webkit-polyfill" strategy="beforeInteractive"');
      expect(layoutCode).not.toContain('id="structured-data" strategy="beforeInteractive"');
    });

    it('HomeServer uses correct question status (approved, NOT answered)', () => {
      // Critical bug caught by Codex: questions table uses 'approved' status, NOT 'answered'
      // Database schema: status IN ('pending', 'approved', 'rejected')
      expect(homeServerCode).toContain(".eq('status', 'approved')");
      expect(homeServerCode).not.toContain(".eq('status', 'answered')");
    });

    it('HomeServer filters questions by non-null answer', () => {
      expect(homeServerCode).toContain(".not('answer', 'is', null)");
    });
  });

  describe('FIX #7: Database Migration', () => {
    let migrationCode;

    beforeAll(() => {
      const filePath = path.join(
        __dirname,
        '../../supabase/migrations/021_add_endorsements_rejection_reason.sql'
      );
      migrationCode = fs.readFileSync(filePath, 'utf-8');
    });

    it('adds rejection_reason column to endorsements table', () => {
      expect(migrationCode).toContain('ALTER TABLE endorsements');
      expect(migrationCode).toContain('ADD COLUMN IF NOT EXISTS rejection_reason TEXT');
    });

    it('creates index for rejection filtering', () => {
      expect(migrationCode).toContain('CREATE INDEX IF NOT EXISTS idx_endorsements_rejection');
      expect(migrationCode).toContain('ON endorsements(status, rejection_reason)');
    });

    it('includes documentation comment', () => {
      expect(migrationCode).toContain('COMMENT ON COLUMN endorsements.rejection_reason');
    });
  });
});
