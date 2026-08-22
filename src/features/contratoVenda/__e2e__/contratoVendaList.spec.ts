import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('ContratoVenda List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/contrato-venda');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays contratoVenda list when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/contrato-venda');
    await expect(page).toHaveURL(new RegExp(`\\/${'contrato-venda'}`));

    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
