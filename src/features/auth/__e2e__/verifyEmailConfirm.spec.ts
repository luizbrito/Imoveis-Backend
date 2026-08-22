import { test, expect } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('Verify Email Confirm Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('verify email confirm page without token redirects', async ({
    page,
  }) => {
    await page.goto('/auth/verify-email/confirm');
    // Without a valid token, the page should redirect
    await page.waitForURL(/\/auth/, { timeout: 5000 });
  });
});
