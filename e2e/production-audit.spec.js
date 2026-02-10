import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://www.dougcharles.com';

// Store all errors found during testing
const auditResults = {
  consoleErrors: [],
  networkErrors: [],
  validationIssues: [],
  performanceIssues: [],
  functionalIssues: [],
};

test.describe('Production Website Comprehensive Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        auditResults.consoleErrors.push({
          text: msg.text(),
          location: msg.location(),
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Capture network failures
    page.on('requestfailed', (request) => {
      auditResults.networkErrors.push({
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText,
        timestamp: new Date().toISOString(),
      });
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      auditResults.consoleErrors.push({
        text: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    });
  });

  test('1. Homepage Testing - Multiple Visits & Console Errors', async ({ page }) => {
    console.log('\n=== HOMEPAGE AUDIT ===');

    // Visit homepage 3 times to check for consistency
    for (let i = 1; i <= 3; i++) {
      console.log(`\nVisit #${i}:`);

      const response = await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });

      // Check response status
      expect(response.status()).toBe(200);
      console.log(`✓ Response: ${response.status()}`);

      // Check page title
      const title = await page.title();
      console.log(`✓ Title: ${title}`);

      // Check for critical elements
      await expect(page.locator('h1')).toBeVisible();
      console.log('✓ H1 heading visible');

      // Check campaign logo
      await expect(page.locator('img[alt*=""]').first()).toBeVisible();
      console.log('✓ Campaign logo loaded');

      // Wait a bit for any async errors
      await page.waitForTimeout(2000);
    }

    // Test interactive elements
    console.log('\nTesting interactive elements:');

    // Check "Get Involved" button
    const getInvolvedBtn = page.locator('a[href="/get-involved"]').first();
    await expect(getInvolvedBtn).toBeVisible();
    console.log('✓ Get Involved button visible');

    // Check "About Doug Charles" button
    const aboutBtn = page.locator('a[href="/about"]').first();
    await expect(aboutBtn).toBeVisible();
    console.log('✓ About button visible');

    // Check navigation links
    const navLinks = await page.locator('nav a').count();
    console.log(`✓ Found ${navLinks} navigation links`);

    // Click a navigation link to test interactivity
    await page.click('a[href="/about"]');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/about');
    console.log('✓ Navigation works (clicked About)');

    // Go back to homepage
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
  });

  test('2. Registration Form - Validation Testing', async ({ page }) => {
    console.log('\n=== REGISTRATION FORM AUDIT ===');

    await page.goto(`${PRODUCTION_URL}/auth/register`, { waitUntil: 'networkidle' });

    // Test invalid email formats
    console.log('\nTesting invalid email formats:');

    const invalidEmails = [
      'notanemail',
      'test@',
      '@example.com',
      'test@example',
      'test..@example.com',
    ];

    for (const invalidEmail of invalidEmails) {
      await page.fill('input[name="email"]', invalidEmail);
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('input[name="streetAddress"]', '123 Main St');
      await page.fill('input[name="zipCode"]', '75078');

      // Try to submit
      await page.click('button[type="submit"]');

      // Check if browser validation prevents submission
      const emailInput = page.locator('input[name="email"]');
      const validationMessage = await emailInput.evaluate((el) => el.validationMessage);

      if (validationMessage) {
        console.log(`✓ Invalid email "${invalidEmail}" blocked with: ${validationMessage}`);
      } else {
        console.log(`⚠ Invalid email "${invalidEmail}" - no validation message`);
        auditResults.validationIssues.push({
          field: 'email',
          value: invalidEmail,
          issue: 'No browser validation message shown',
        });
      }

      // Clear the field
      await emailInput.clear();
    }

    // Test invalid phone formats
    console.log('\nTesting phone field:');

    await page.fill('input[name="phone"]', 'invalid phone');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="streetAddress"]', '123 Main St');
    await page.fill('input[name="zipCode"]', '75078');

    console.log('✓ Phone field accepts input (validation may be server-side)');

    // Test with valid data (but don't actually submit to avoid creating test data)
    console.log('\nTesting form with valid data (pre-submit check):');

    await page.fill('input[name="email"]', 'valid.test@example.com');
    await page.fill('input[name="phone"]', '(972) 555-1234');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="streetAddress"]', '123 Main Street');
    await page.fill('input[name="city"]', 'Prosper');
    await page.fill('input[name="state"]', 'TX');
    await page.fill('input[name="zipCode"]', '75078');

    // Check if submit button is enabled
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();
    console.log('✓ Submit button enabled with valid data');
    console.log('  (Not submitting to avoid creating test data)');

    // Test required fields
    console.log('\nTesting required fields:');
    await page.reload({ waitUntil: 'networkidle' });

    await page.click('button[type="submit"]');

    const firstName = page.locator('input[name="firstName"]');
    const firstNameValidation = await firstName.evaluate((el) => el.validationMessage);
    if (firstNameValidation) {
      console.log(`✓ First name required: ${firstNameValidation}`);
    }

    const lastName = page.locator('input[name="lastName"]');
    const lastNameValidation = await lastName.evaluate((el) => el.validationMessage);
    if (lastNameValidation) {
      console.log(`✓ Last name required: ${lastNameValidation}`);
    }

    const email = page.locator('input[name="email"]');
    const emailValidation = await email.evaluate((el) => el.validationMessage);
    if (emailValidation) {
      console.log(`✓ Email required: ${emailValidation}`);
    }
  });

  test('3. Ideas Page Testing - TypeError Check', async ({ page }) => {
    console.log('\n=== IDEAS PAGE AUDIT ===');

    // Test without login
    console.log('\nTesting /ideas without login:');
    await page.goto(`${PRODUCTION_URL}/ideas`, { waitUntil: 'networkidle' });

    // Check page loaded
    await expect(page.locator('h1')).toContainText('Community Ideas');
    console.log('✓ Page loaded with correct heading');

    // Check for TypeError in console
    await page.waitForTimeout(2000);
    const typeErrors = auditResults.consoleErrors.filter((err) =>
      err.text.toLowerCase().includes('typeerror')
    );

    if (typeErrors.length > 0) {
      console.log(`✗ Found ${typeErrors.length} TypeError(s):`);
      typeErrors.forEach((err) => {
        console.log(`  - ${err.text}`);
      });
    } else {
      console.log('✓ No TypeErrors detected');
    }

    // Check for empty state message
    const pageContent = await page.textContent('body');
    if (pageContent.includes('No ideas yet') || pageContent.includes('Share your ideas')) {
      console.log('✓ Empty state or content displayed properly');
    }

    // Test data loading states
    console.log('\nChecking data loading indicators:');
    const loadingIndicator = page.locator('[aria-live]');
    const hasLoading = (await loadingIndicator.count()) > 0;
    console.log(`✓ Loading indicators present: ${hasLoading}`);

    // Check for any ideas displayed
    const ideaCards = await page.locator('[data-testid*="idea"], .card').count();
    console.log(`✓ Found ${ideaCards} idea card(s) or content blocks`);
  });

  test('4. Endorsements API Testing', async ({ page, request }) => {
    console.log('\n=== ENDORSEMENTS API AUDIT ===');

    // Direct API test
    console.log('\nTesting GET /api/endorsements directly:');

    const startTime = Date.now();
    const response = await request.get(`${PRODUCTION_URL}/api/endorsements`);
    const duration = Date.now() - startTime;

    console.log(`✓ Response time: ${duration}ms`);

    // Check status
    if (response.status() === 200) {
      console.log('✓ Status: 200 OK');
    } else {
      console.log(`✗ Status: ${response.status()}`);
      auditResults.networkErrors.push({
        url: '/api/endorsements',
        status: response.status(),
        issue: 'Non-200 response',
      });
    }

    // Check response format
    const data = await response.json();
    console.log(`✓ Response format: ${data.ok ? 'OK' : 'ERROR'}`);

    if (data.ok) {
      console.log(`✓ Data array length: ${data.data?.length || 0}`);

      if (data.data && data.data.length > 0) {
        const sample = data.data[0];
        console.log('✓ Sample record fields:', Object.keys(sample).join(', '));
      } else {
        console.log('  (No endorsements in database - this is normal)');
      }
    } else {
      console.log(`✗ API returned error: ${data.error}`);
      auditResults.networkErrors.push({
        url: '/api/endorsements',
        issue: data.error,
      });
    }

    // Test on the page
    console.log('\nTesting endorsements on homepage:');
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const endorsementsSection = page.locator('text=Endorsements').first();
    const hasEndorsements = (await endorsementsSection.count()) > 0;
    console.log(`✓ Endorsements section present: ${hasEndorsements}`);

    if (duration > 3000) {
      console.log(`⚠ Warning: Slow API response (${duration}ms > 3000ms threshold)`);
      auditResults.performanceIssues.push({
        api: '/api/endorsements',
        duration,
        threshold: 3000,
      });
    }
  });

  test('5. Admin Dashboard Testing', async ({ page }) => {
    console.log('\n=== ADMIN DASHBOARD AUDIT ===');

    console.log('\nTesting /admin/dashboard (unauthenticated):');
    const response = await page.goto(`${PRODUCTION_URL}/admin/dashboard`, {
      waitUntil: 'networkidle',
    });

    // Should redirect to login or show login page
    const currentUrl = page.url();
    console.log(`✓ Current URL: ${currentUrl}`);

    if (currentUrl.includes('/admin/login') || currentUrl.includes('login')) {
      console.log('✓ Correctly redirects to login page');
    } else if (currentUrl.includes('/admin/dashboard')) {
      // Check if login form is shown
      const loginForm = await page.locator('form').count();
      if (loginForm > 0) {
        console.log('✓ Login form displayed');
      } else {
        console.log('⚠ Dashboard accessible without authentication - security issue?');
        auditResults.functionalIssues.push({
          page: '/admin/dashboard',
          issue: 'May be accessible without authentication',
        });
      }
    }

    // Check for 500 errors
    if (response.status() >= 500) {
      console.log(`✗ Server error: ${response.status()}`);
      auditResults.networkErrors.push({
        url: '/admin/dashboard',
        status: response.status(),
        issue: 'Server error',
      });
    } else {
      console.log(`✓ No 500 errors (status: ${response.status()})`);
    }

    console.log('\nNote: Full admin dashboard testing requires authentication credentials');
  });

  test('6. Additional Critical Paths', async ({ page }) => {
    console.log('\n=== ADDITIONAL CRITICAL PATHS AUDIT ===');

    const criticalPages = [
      '/endorsements',
      '/polls',
      '/get-involved',
      '/qna',
      '/about',
      '/priorities',
      '/donate',
      '/track-record',
    ];

    for (const path of criticalPages) {
      console.log(`\nTesting ${path}:`);

      const response = await page.goto(`${PRODUCTION_URL}${path}`, {
        waitUntil: 'networkidle',
      });

      // Check status
      if (response.status() === 200) {
        console.log(`  ✓ Status: 200`);
      } else {
        console.log(`  ✗ Status: ${response.status()}`);
        auditResults.networkErrors.push({
          url: path,
          status: response.status(),
        });
      }

      // Check for h1
      const h1 = await page.locator('h1').count();
      console.log(`  ✓ H1 headings: ${h1}`);

      // Check for console errors
      const errorsBefore = auditResults.consoleErrors.length;
      await page.waitForTimeout(1000);
      const errorsAfter = auditResults.consoleErrors.length;

      if (errorsAfter > errorsBefore) {
        console.log(`  ⚠ New console errors: ${errorsAfter - errorsBefore}`);
      } else {
        console.log(`  ✓ No console errors`);
      }
    }
  });

  test('7. Performance Monitoring', async ({ page }) => {
    console.log('\n=== PERFORMANCE AUDIT ===');

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd,
        loadComplete: navigation?.loadEventEnd,
        firstPaint: paint.find((p) => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find((p) => p.name === 'first-contentful-paint')?.startTime,
        transferSize: navigation?.transferSize,
      };
    });

    console.log('\nPerformance Metrics:');
    console.log(`  DOM Content Loaded: ${Math.round(metrics.domContentLoaded)}ms`);
    console.log(`  Page Load Complete: ${Math.round(metrics.loadComplete)}ms`);
    console.log(`  First Paint: ${Math.round(metrics.firstPaint)}ms`);
    console.log(`  First Contentful Paint: ${Math.round(metrics.firstContentfulPaint)}ms`);
    console.log(`  Transfer Size: ${Math.round(metrics.transferSize / 1024)}KB`);

    // Check for performance issues
    if (metrics.loadComplete > 5000) {
      console.log(`  ⚠ Slow page load (${Math.round(metrics.loadComplete)}ms)`);
      auditResults.performanceIssues.push({
        metric: 'loadComplete',
        value: metrics.loadComplete,
        threshold: 5000,
      });
    }

    if (metrics.firstContentfulPaint > 2500) {
      console.log(`  ⚠ Slow FCP (${Math.round(metrics.firstContentfulPaint)}ms)`);
      auditResults.performanceIssues.push({
        metric: 'firstContentfulPaint',
        value: metrics.firstContentfulPaint,
        threshold: 2500,
      });
    }
  });

  test.afterAll(async () => {
    console.log('\n\n========================================');
    console.log('COMPREHENSIVE AUDIT SUMMARY');
    console.log('========================================\n');

    console.log('Console Errors:', auditResults.consoleErrors.length);
    if (auditResults.consoleErrors.length > 0) {
      console.log('  Details:');
      auditResults.consoleErrors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.text.substring(0, 100)}`);
      });
    }

    console.log('\nNetwork Errors:', auditResults.networkErrors.length);
    if (auditResults.networkErrors.length > 0) {
      console.log('  Details:');
      auditResults.networkErrors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.url} - ${err.failure || err.issue || err.status}`);
      });
    }

    console.log('\nValidation Issues:', auditResults.validationIssues.length);
    if (auditResults.validationIssues.length > 0) {
      console.log('  Details:');
      auditResults.validationIssues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue.field}: ${issue.issue}`);
      });
    }

    console.log('\nPerformance Issues:', auditResults.performanceIssues.length);
    if (auditResults.performanceIssues.length > 0) {
      console.log('  Details:');
      auditResults.performanceIssues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue.metric || issue.api}: ${issue.value || issue.duration}ms`);
      });
    }

    console.log('\nFunctional Issues:', auditResults.functionalIssues.length);
    if (auditResults.functionalIssues.length > 0) {
      console.log('  Details:');
      auditResults.functionalIssues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue.page}: ${issue.issue}`);
      });
    }

    const totalIssues =
      auditResults.consoleErrors.length +
      auditResults.networkErrors.length +
      auditResults.validationIssues.length +
      auditResults.performanceIssues.length +
      auditResults.functionalIssues.length;

    console.log('\n========================================');
    console.log(`TOTAL ISSUES FOUND: ${totalIssues}`);
    console.log('========================================\n');
  });
});
