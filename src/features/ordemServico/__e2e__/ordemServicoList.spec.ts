import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('OrdemServico List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/ordem-servico');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays ordemServico list when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/ordem-servico');
    await expect(page).toHaveURL(new RegExp(`\\/${'ordem-servico'}`));

    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
