import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('Pais List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/pais');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays pais list when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/pais');
    await expect(page).toHaveURL(new RegExp(`\\/${'pais'}`));

    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
