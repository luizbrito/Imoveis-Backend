import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('DocumentoPessoa List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/documento-pessoa');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays documentoPessoa list when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/documento-pessoa');
    await expect(page).toHaveURL(new RegExp(`\\/${'documento-pessoa'}`));

    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
