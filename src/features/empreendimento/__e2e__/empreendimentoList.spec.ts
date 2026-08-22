import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('Empreendimento List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/empreendimento');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays empreendimento list when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/empreendimento');
    await expect(page).toHaveURL(new RegExp(`\\/${'empreendimento'}`));

    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
