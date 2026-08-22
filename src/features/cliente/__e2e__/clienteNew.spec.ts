import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('Cliente New Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('cliente new page loads when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/cliente/new');
    await expect(page).toHaveURL(new RegExp(`\\/${'cliente'}\\/new`));
    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/cliente/new');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
