import { test, expect } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';

test.describe('Profile Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/auth/profile');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays profile when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/auth/profile');
    await expect(page).toHaveURL(/\/auth\/profile/);

    // Check that the page loaded successfully using data-testid
    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
