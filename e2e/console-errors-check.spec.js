import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://www.dougcharles.com';

test('Capture all console errors and warnings', async ({ page }) => {
  const logs = {
    errors: [],
    warnings: [],
    info: [],
    networkFailures: [],
  };

  // Capture console messages
  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();

    if (type === 'error') {
      logs.errors.push({
        text,
        location: msg.location(),
        type: 'console.error',
      });
      console.log(`[CONSOLE ERROR] ${text}`);
    } else if (type === 'warning') {
      logs.warnings.push(text);
      console.log(`[CONSOLE WARNING] ${text}`);
    } else if (type === 'log' || type === 'info') {
      logs.info.push(text);
    }
  });

  // Capture network failures
  page.on('requestfailed', (request) => {
    const failure = {
      url: request.url(),
      method: request.method(),
      failure: request.failure()?.errorText,
      resourceType: request.resourceType(),
    };
    logs.networkFailures.push(failure);
    console.log(`[NETWORK FAILURE] ${request.method()} ${request.url()}`);
    console.log(`  Reason: ${request.failure()?.errorText}`);
  });

  // Capture response errors (400, 401, 500, etc.)
  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();

    if (status >= 400) {
      console.log(`[HTTP ${status}] ${url}`);
      logs.networkFailures.push({
        url,
        status,
        statusText: response.statusText(),
        type: 'http_error',
      });
    }
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    logs.errors.push({
      text: error.message,
      stack: error.stack,
      type: 'pageerror',
    });
    console.log(`[PAGE ERROR] ${error.message}`);
    if (error.stack) {
      console.log(`  Stack: ${error.stack.substring(0, 200)}`);
    }
  });

  console.log('\n=== Testing Homepage ===');
  await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('\n=== Testing /ideas ===');
  await page.goto(`${PRODUCTION_URL}/ideas`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('\n=== Testing /polls ===');
  await page.goto(`${PRODUCTION_URL}/polls`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('\n=== Testing /endorsements ===');
  await page.goto(`${PRODUCTION_URL}/endorsements`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('\n=== Testing /auth/register ===');
  await page.goto(`${PRODUCTION_URL}/auth/register`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('\n\n========================================');
  console.log('DETAILED ERROR REPORT');
  console.log('========================================\n');

  console.log(`Console Errors: ${logs.errors.length}`);
  if (logs.errors.length > 0) {
    logs.errors.forEach((err, i) => {
      console.log(`\n${i + 1}. ${err.type}`);
      console.log(`   Text: ${err.text}`);
      if (err.location) {
        console.log(`   Location: ${err.location.url}:${err.location.lineNumber}`);
      }
      if (err.stack) {
        console.log(`   Stack: ${err.stack.substring(0, 300)}`);
      }
    });
  }

  console.log(`\n\nNetwork/HTTP Failures: ${logs.networkFailures.length}`);
  if (logs.networkFailures.length > 0) {
    logs.networkFailures.forEach((err, i) => {
      console.log(`\n${i + 1}. ${err.method || 'HTTP'} ${err.url}`);
      if (err.status) {
        console.log(`   Status: ${err.status} ${err.statusText || ''}`);
      }
      if (err.failure) {
        console.log(`   Failure: ${err.failure}`);
      }
      if (err.resourceType) {
        console.log(`   Resource Type: ${err.resourceType}`);
      }
    });
  }

  console.log(`\n\nWarnings: ${logs.warnings.length}`);
  if (logs.warnings.length > 0) {
    logs.warnings.slice(0, 10).forEach((warn, i) => {
      console.log(`${i + 1}. ${warn.substring(0, 150)}`);
    });
  }

  console.log('\n========================================\n');

  // Filter out known acceptable errors (e.g., 401 on unauthenticated API calls)
  const criticalErrors = logs.errors.filter(
    (err) => !err.text.includes('401') && !err.text.includes('recaptcha')
  );

  const criticalNetworkErrors = logs.networkFailures.filter((err) => {
    // 401 on /api/auth/me is expected when not logged in
    if (err.url?.includes('/api/auth/me') && err.status === 401) return false;
    // 401 on other auth endpoints is expected
    if (err.url?.includes('/api/') && err.status === 401) return false;
    return true;
  });

  console.log(`Critical Errors (excluding expected 401s): ${criticalErrors.length}`);
  console.log(
    `Critical Network Errors (excluding expected 401s): ${criticalNetworkErrors.length}`
  );

  // Test passes if no critical errors
  expect(criticalErrors.length).toBe(0);
});
