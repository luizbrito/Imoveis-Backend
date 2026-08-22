import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('CampanhaAnuncio Importer Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('campanhaAnuncio importer page loads when authenticated', async ({
    page,
  }) => {
    await signUpAndSignIn(page);

    await page.goto('/campanha-anuncio/importer');
    await expect(page).toHaveURL(
      new RegExp(`\\/${'campanha-anuncio'}\\/importer`),
    );
    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/campanha-anuncio/importer');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
