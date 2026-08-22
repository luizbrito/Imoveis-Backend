import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('InteracaoLead List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/interacao-lead');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays interacaoLead list when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/interacao-lead');
    await expect(page).toHaveURL(new RegExp(`\\/${'interacao-lead'}`));

    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
