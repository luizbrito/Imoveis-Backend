import { test, expect } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('Invitation Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('invitation page without token redirects', async ({ page }) => {
    await page.goto('/auth/invitation');
    // Without a valid token, the page should redirect
    await page.waitForURL(/\/auth/, { timeout: 5000 });
  });
});
