import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('homepage loads and has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Doug Charles|Prosper/i);
    await expect(page.locator('nav')).toBeVisible();
  });

  test('navigation links are present', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav.getByText(/priorities/i)).toBeVisible();
    await expect(nav.getByText(/endorsements/i)).toBeVisible();
  });

  test('priorities page loads', async ({ page }) => {
    await page.goto('/priorities');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('endorsements page loads', async ({ page }) => {
    await page.goto('/endorsements');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('get-involved page loads', async ({ page }) => {
    await page.goto('/get-involved');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('polls page loads', async ({ page }) => {
    await page.goto('/polls');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('ideas page loads', async ({ page }) => {
    await page.goto('/ideas');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('admin login page loads', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('forgot password page loads', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
