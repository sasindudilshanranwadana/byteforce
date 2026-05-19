const { test, expect } = require('@playwright/test');

test.describe('Campaigner Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'campaigner1@byteforce.test');
    await page.fill('input[type="password"]', 'Byteforce123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('campaigner can access their dashboard', async ({ page }) => {
    await page.goto('/dashboard/campaigner');
    await expect(page).toHaveURL('/dashboard/campaigner');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 8000 });
  });

  test('campaigner dashboard shows their campaigns', async ({ page }) => {
    await page.goto('/dashboard/campaigner');
    await expect(page.getByText(/campaign/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('campaigner can access analytics page', async ({ page }) => {
    await page.goto('/dashboard/campaigner/analytics');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 10000 });
  });

  test('campaigner can access create campaign page', async ({ page }) => {
    await page.goto('/campaigns/create');
    await expect(page).toHaveURL('/campaigns/create');
    await expect(page.locator('form, input').first()).toBeVisible({ timeout: 8000 });
  });

  test('campaigner cannot access admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).not.toHaveURL('/admin', { timeout: 5000 });
  });
});
