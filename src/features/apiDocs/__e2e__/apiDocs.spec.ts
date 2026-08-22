import { test, expect } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';

test.describe('API Docs Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('API docs page loads when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/api-docs');
    await expect(page).toHaveURL(/\/api-docs/);

    // Check that the page loaded successfully
    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/api-docs');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
