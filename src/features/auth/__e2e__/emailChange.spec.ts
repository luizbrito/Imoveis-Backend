import { test, expect } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';

test.describe('Email Change Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('email change page loads when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/auth/email-change');
    await expect(page).toHaveURL(/\/auth\/email-change/);

    // Check that the page loaded successfully
    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/auth/email-change');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays current email and allows changing email', async ({ page }) => {
    const { email } = await signUpAndSignIn(page);

    await page.goto('/auth/email-change');
    await expect(page).toHaveURL(/\/auth\/email-change/);

    // Check current email is displayed
    const currentEmailInput = page.locator('#currentEmail');
    await expect(currentEmailInput).toHaveValue(email);
    await expect(currentEmailInput).toBeDisabled();

    // New email field should be enabled
    const newEmailInput = page.locator('#newEmail');
    await expect(newEmailInput).toBeEnabled();
  });
});
