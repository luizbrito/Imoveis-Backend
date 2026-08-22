import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('API Key List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('API key list page loads when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/api-key');
    await expect(page).toHaveURL(/\/api-key/);
    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/api-key');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
