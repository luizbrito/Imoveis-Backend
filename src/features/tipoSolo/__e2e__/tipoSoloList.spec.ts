import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('TipoSolo List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/tipo-solo');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays tipoSolo list when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/tipo-solo');
    await expect(page).toHaveURL(new RegExp(`\\/${'tipo-solo'}`));

    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
