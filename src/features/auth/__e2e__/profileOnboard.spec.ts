import { test, expect } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('Profile Onboard Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/auth/profile-onboard');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
