import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('API Key New Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('API key new page loads when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/api-key/new');
    await expect(page).toHaveURL(/\/api-key\/new/);
    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/api-key/new');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
