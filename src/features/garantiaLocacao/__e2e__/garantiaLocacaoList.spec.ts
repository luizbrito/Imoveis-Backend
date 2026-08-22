import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('GarantiaLocacao List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/garantia-locacao');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays garantiaLocacao list when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/garantia-locacao');
    await expect(page).toHaveURL(new RegExp(`\\/${'garantia-locacao'}`));

    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
