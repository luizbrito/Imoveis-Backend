import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('DivisaoOperacionalRural List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/divisao-operacional-rural');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays divisaoOperacionalRural list when authenticated', async ({
    page,
  }) => {
    await signUpAndSignIn(page);

    await page.goto('/divisao-operacional-rural');
    await expect(page).toHaveURL(
      new RegExp(`\\/${'divisao-operacional-rural'}`),
    );

    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
