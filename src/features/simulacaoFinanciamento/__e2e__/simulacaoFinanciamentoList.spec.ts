import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('SimulacaoFinanciamento List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/simulacao-financiamento');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays simulacaoFinanciamento list when authenticated', async ({
    page,
  }) => {
    await signUpAndSignIn(page);

    await page.goto('/simulacao-financiamento');
    await expect(page).toHaveURL(new RegExp(`\\/${'simulacao-financiamento'}`));

    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
