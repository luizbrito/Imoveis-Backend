import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('Visita List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/visita');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays visita list when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/visita');
    await expect(page).toHaveURL(new RegExp(`\\/${'visita'}`));

    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
