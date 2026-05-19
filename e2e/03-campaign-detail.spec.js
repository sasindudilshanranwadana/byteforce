const { test, expect } = require('@playwright/test');

test.describe('Campaign Detail', () => {
  test('campaign detail page shows title, description and progress', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('a[href*="/campaigns/"]').first();
    await link.waitFor({ timeout: 15000 });
    const href = await link.getAttribute('href');
    await page.goto(href);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/raised|\$|goal/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('donate button is visible on active campaign', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('a[href*="/campaigns/"]').first();
    await link.waitFor({ timeout: 15000 });
    const href = await link.getAttribute('href');
    await page.goto(href);
    // Donate link or button should exist
    await expect(
      page.locator('a[href*="/donate"], button:has-text("Back this"), button:has-text("Donate")').first()
    ).toBeVisible({ timeout: 8000 });
  });

  test('share button is visible on campaign page', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('a[href*="/campaigns/"]').first();
    await link.waitFor({ timeout: 15000 });
    const href = await link.getAttribute('href');
    await page.goto(href);
    await expect(page.getByRole('button', { name: /share/i }).first()).toBeVisible({ timeout: 8000 });
  });

  test('unauthenticated user redirected to login when accessing donate page', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('a[href*="/campaigns/"]').first();
    await link.waitFor({ timeout: 15000 });
    const href = await link.getAttribute('href');
    // Directly navigate to donate URL
    await page.goto(href + '/donate');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });
});
