const { test, expect } = require('@playwright/test');

test.describe('Donation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'backer2@byteforce.test');
    await page.fill('input[type="password"]', 'Byteforce123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  // Find first ACTIVE campaign by checking its donate link
  async function getActiveDonateUrl(page) {
    await page.goto('/');
    const links = page.locator('a[href*="/campaigns/"]');
    await links.first().waitFor({ timeout: 15000 });
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href && !href.includes('/donate') && !href.includes('/edit') && !href.includes('/create')) {
        // Visit campaign page and check if donate link exists
        await page.goto(href);
        const donateLink = page.locator('a[href*="/donate"]').first();
        const visible = await donateLink.isVisible().catch(() => false);
        if (visible) {
          return href + '/donate';
        }
      }
    }
    return null;
  }

  test('donate page loads with pledge amount input', async ({ page }) => {
    const donateUrl = await getActiveDonateUrl(page);
    if (!donateUrl) test.skip();
    await page.goto(donateUrl);
    await expect(page).toHaveURL(/\/donate/);
    await expect(page.getByText(/your pledge/i)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="number"], input[inputmode="decimal"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('donate page shows reward tiers when campaign has them', async ({ page }) => {
    const donateUrl = await getActiveDonateUrl(page);
    if (!donateUrl) test.skip();
    await page.goto(donateUrl);
    await expect(page).toHaveURL(/\/donate/);
    await expect(page.getByText(/choose a reward tier/i)).toBeVisible({ timeout: 10000 });
  });

  test('donate page shows Stripe payment element after clicking continue', async ({ page }) => {
    const donateUrl = await getActiveDonateUrl(page);
    if (!donateUrl) test.skip();
    await page.goto(donateUrl);
    await expect(page).toHaveURL(/\/donate/);
    const amountInput = page.locator('input[type="number"], input[inputmode="decimal"]').first();
    await amountInput.waitFor({ timeout: 8000 });
    await amountInput.fill('50');
    const continueBtn = page.getByRole('button', { name: /continue|next|proceed/i }).first();
    await continueBtn.click();
    await page.waitForSelector('iframe[allow*="payment"]', { timeout: 20000 });
    await expect(page.locator('iframe[allow*="payment"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('full donation with Stripe test card 4242 4242 4242 4242', async ({ page }) => {
    const donateUrl = await getActiveDonateUrl(page);
    if (!donateUrl) test.skip();
    await page.goto(donateUrl);
    await expect(page).toHaveURL(/\/donate/);

    const amountInput = page.locator('input[type="number"], input[inputmode="decimal"]').first();
    await amountInput.waitFor({ timeout: 8000 });
    await amountInput.fill('50');

    const continueBtn = page.getByRole('button', { name: /continue|next|proceed/i }).first();
    await continueBtn.click();

    await page.waitForSelector('iframe[allow*="payment"]', { timeout: 20000 });

    // Fill Stripe card fields inside iframe
    const cardFrame = page.frameLocator('iframe[allow*="payment"]').first();
    await cardFrame.locator('[placeholder*="1234"]').fill('4242424242424242');
    await cardFrame.locator('[placeholder*="MM"]').fill('12/28');
    await cardFrame.locator('[placeholder*="CVC"]').fill('123');

    await page.getByRole('button', { name: /pay|confirm|donate/i }).last().click();

    await expect(page).toHaveURL(/\/success/, { timeout: 30000 });
    await expect(page.getByText(/thank|success|confirmed/i).first()).toBeVisible({ timeout: 10000 });
  });
});
