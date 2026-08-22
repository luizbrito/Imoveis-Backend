import { test, expect } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';

test.describe('Organization New Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('organization new page loads when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/organization/new');
    await expect(page).toHaveURL(/\/organization\/new/);
    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/organization/new');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
