import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('PortalImobiliario Importer Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('portalImobiliario importer page loads when authenticated', async ({
    page,
  }) => {
    await signUpAndSignIn(page);

    await page.goto('/portal-imobiliario/importer');
    await expect(page).toHaveURL(
      new RegExp(`\\/${'portal-imobiliario'}\\/importer`),
    );
    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/portal-imobiliario/importer');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
