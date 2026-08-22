import { test, expect } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('Password Reset Request Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('password reset request page loads', async ({ page }) => {
    await page.goto('/auth/password-reset/request');
    await expect(
      page.getByTestId('auth-password-reset-submit-button'),
    ).toBeVisible();
  });
});
