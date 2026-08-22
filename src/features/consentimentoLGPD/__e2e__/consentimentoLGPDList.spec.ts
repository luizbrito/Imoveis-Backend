import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('ConsentimentoLGPD List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/consentimento-l-g-p-d');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays consentimentoLGPD list when authenticated', async ({
    page,
  }) => {
    await signUpAndSignIn(page);

    await page.goto('/consentimento-l-g-p-d');
    await expect(page).toHaveURL(new RegExp(`\\/${'consentimento-l-g-p-d'}`));

    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
