import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('LogisticaRural New Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('logisticaRural new page loads when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/logistica-rural/new');
    await expect(page).toHaveURL(new RegExp(`\\/${'logistica-rural'}\\/new`));
    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/logistica-rural/new');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
