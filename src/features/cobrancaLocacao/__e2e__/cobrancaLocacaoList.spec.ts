import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('CobrancaLocacao List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/cobranca-locacao');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays cobrancaLocacao list when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/cobranca-locacao');
    await expect(page).toHaveURL(new RegExp(`\\/${'cobranca-locacao'}`));

    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
