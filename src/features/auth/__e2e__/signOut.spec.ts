import { test, expect } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';

test.describe('Sign Out Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('sign out redirects to sign in', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/auth/sign-out');
    await page.waitForURL('**/auth/sign-in**', { timeout: 10000 });
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
