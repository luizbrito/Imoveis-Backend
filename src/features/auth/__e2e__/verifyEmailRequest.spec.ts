import { test, expect } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('Verify Email Request Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('verify email request page loads', async ({ page }) => {
    await page.goto('/auth/verify-email/request');
    await expect(page).toHaveURL(/\/auth\/verify-email\/request/);
  });
});
