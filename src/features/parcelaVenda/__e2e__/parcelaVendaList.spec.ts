import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('ParcelaVenda List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/parcela-venda');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays parcelaVenda list when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/parcela-venda');
    await expect(page).toHaveURL(new RegExp(`\\/${'parcela-venda'}`));

    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
