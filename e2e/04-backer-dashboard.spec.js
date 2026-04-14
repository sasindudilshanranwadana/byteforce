const { test, expect } = require('@playwright/test');

test.describe('Backer Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'backer1@byteforce.test');
    await page.fill('input[type="password"]', 'Byteforce123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('backer can access their dashboard', async ({ page }) => {
    await page.goto('/dashboard/backer');
    await expect(page).toHaveURL('/dashboard/backer');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 8000 });
  });

  test('backer can view donation history', async ({ page }) => {
    await page.goto('/dashboard/backer/donations');
    await expect(page).toHaveURL('/dashboard/backer/donations');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('backer cannot access admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).not.toHaveURL('/admin', { timeout: 5000 });
  });

  test('backer cannot access campaigner dashboard', async ({ page }) => {
    await page.goto('/dashboard/campaigner');
    await expect(page).not.toHaveURL('/dashboard/campaigner', { timeout: 5000 });
  });

  test('notification bell is visible when logged in', async ({ page }) => {
    await expect(page.locator('nav button').filter({ hasText: '' }).first()).toBeVisible({ timeout: 8000 });
  });
});
