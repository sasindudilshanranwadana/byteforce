const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
  test('loads and shows campaign cards', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/byteforce/i);
    // Navbar visible
    await expect(page.locator('nav')).toBeVisible();
    // At least one campaign card rendered
    await page.waitForSelector('[data-testid="campaign-card"], .campaign-card, a[href*="/campaigns/"]', { timeout: 15000 });
    const links = page.locator('a[href*="/campaigns/"]');
    await expect(links.first()).toBeVisible();
  });

  test('search / filter bar is visible', async ({ page }) => {
    await page.goto('/');
    // Input or search element exists
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]');
    await expect(searchInput.first()).toBeVisible({ timeout: 10000 });
  });

  test('clicking a campaign navigates to detail page', async ({ page }) => {
    await page.goto('/');
    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    await campaignLink.waitFor({ timeout: 15000 });
    await campaignLink.click();
    await expect(page).toHaveURL(/\/campaigns\/.+/);
  });
});
// e2e tests — 34 browser tests across 7 test suites
