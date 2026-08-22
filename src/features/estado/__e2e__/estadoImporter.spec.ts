import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('Estado Importer Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('estado importer page loads when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/estado/importer');
    await expect(page).toHaveURL(new RegExp(`\\/${'estado'}\\/importer`));
    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/estado/importer');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
