import { test, expect } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';

test.describe('Dashboard Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays dashboard when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/');
    await expect(page).toHaveURL('/');

    // Check that the page loaded successfully (dashboard should be visible) using data-testid
    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
