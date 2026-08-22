import { test, expect } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';

test.describe('Member List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/member');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays member list when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/member');
    await expect(page).toHaveURL(/\/member/);

    // Check that the page loaded successfully using data-testid
    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
