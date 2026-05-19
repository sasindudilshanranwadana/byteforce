const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
    await expect(page.locator('a[href="/register"]').first()).toBeVisible();
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/valid email/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('shows error on wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/invalid|error|incorrect/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('backer login succeeds and redirects to home', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'backer1@byteforce.test');
    await page.fill('input[type="password"]', 'Byteforce123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('register page renders correctly', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('forgot password page renders and validates email', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    // Submit empty — should show validation error
    await page.click('button[type="submit"]');
    await expect(page.getByText(/valid email/i)).toBeVisible({ timeout: 5000 });
  });

  test('protected route redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/dashboard/backer');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });
});
