import { test, expect } from '@playwright/test';

test.describe('DevTools Hub Smoke & Security E2E', () => {
  test('landing page renders hero, categories, and opens command palette', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Everything developers need');
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog', { name: 'Global tool search' })).toBeVisible();
  });

  test('navigates to JSON Formatter and switches themes', async ({ page }) => {
    await page.goto('/tools/json/json-formatter');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('JSON Formatter');
    const themeBtn = page.getByRole('button', { name: /Current theme/i });
    await themeBtn.click();
  });

  test('redirects unauthenticated visitors from /dashboard and /admin to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});
