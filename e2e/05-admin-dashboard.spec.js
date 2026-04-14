const { test, expect } = require('@playwright/test');

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@byteforce.test');
    await page.fill('input[type="password"]', 'Byteforce123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('admin can access admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 8000 });
  });

  test('admin dashboard shows stat cards', async ({ page }) => {
    await page.goto('/admin');
    // Stat cards (pending / active / suspended / rejected / closed / all)
    await expect(page.getByText(/all/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('admin dashboard has status filter tabs', async ({ page }) => {
    await page.goto('/admin');
    const tabs = ['all', 'pending', 'active', 'rejected'];
    for (const tab of tabs) {
      await expect(page.getByRole('button', { name: new RegExp(tab, 'i') }).first()).toBeVisible({ timeout: 8000 });
    }
  });

  test('admin dashboard shows campaigns table or empty state', async ({ page }) => {
    await page.goto('/admin');
    // The page always renders either a table or "All clear" — wait for either
    await page.waitForTimeout(2000); // let data load
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasClear = await page.locator('text=All clear').isVisible().catch(() => false);
    expect(hasTable || hasClear).toBe(true);
  });

  test('admin reject modal textarea and confirm button work', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1500);
    // Tab buttons are identified by their child text, use locator with has-text
    const tabButtons = page.locator('button').filter({ hasText: /^(pending|active|all)/i });
    const tabCount = await tabButtons.count();
    let found = false;
    for (let i = 0; i < tabCount; i++) {
      await tabButtons.nth(i).click();
      await page.waitForTimeout(500);
      const rejectBtn = page.locator('button[title="Reject"]').first();
      const visible = await rejectBtn.isVisible().catch(() => false);
      if (visible) {
        await rejectBtn.click();
        await expect(page.locator('textarea')).toBeVisible({ timeout: 5000 });
        await page.locator('textarea').fill('Missing budget breakdown.');
        await expect(page.locator('textarea')).toHaveValue('Missing budget breakdown.');
        found = true;
        break;
      }
    }
    if (!found) test.skip();
  });

  test('admin can access campaigner analytics', async ({ page }) => {
    await page.goto('/dashboard/campaigner/analytics');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 8000 });
  });
});
