import { test, expect } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';

test.describe('Member Importer Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('member importer page loads when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/member/importer');
    await expect(page).toHaveURL(/\/member\/importer/);
    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/member/importer');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
