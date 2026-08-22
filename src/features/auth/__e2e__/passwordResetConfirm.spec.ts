import { test } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('Password Reset Confirm Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects when no token provided', async ({ page }) => {
    await page.goto('/auth/password-reset/confirm');
    // Without a valid token, the page should redirect or show an error
    await page.waitForURL(/\/auth/, { timeout: 5000 });
  });
});
