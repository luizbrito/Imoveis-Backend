import { Page } from '@playwright/test';

/**
 * Sign up new user and complete onboarding flow via UI.
 * Handles both single and multi organization modes.
 */
export async function signUpAndSignIn(page: Page) {
  const timestamp = Date.now();
  const email = `test-${timestamp}@example.com`;
  const password = 'TestPassword123!';

  await page.goto('/auth/sign-up');

  await page.getByTestId('auth-signup-email-input').fill(email);
  await page.getByTestId('auth-signup-password-input').fill(password);
  await page.getByTestId('auth-signup-submit-button').click();

  // In single mode, auto-creates org and skips to profile onboard
  await page.waitForURL(
    (url) =>
      url.pathname.includes('/auth/organization') ||
      url.pathname.includes('/auth/profile-onboard'),
    { timeout: 10000 },
  );

  if (page.url().includes('/auth/organization')) {
    const organizationName = `Test Org ${timestamp}`;
    await page
      .getByTestId('auth-organization-name-input')
      .fill(organizationName);
    await page.getByTestId('auth-organization-submit-button').click();
    await page.waitForURL('**/auth/profile-onboard**', { timeout: 10000 });
  }

  await page.getByTestId('auth-profile-firstname-input').fill('Test');
  await page.getByTestId('auth-profile-lastname-input').fill('User');

  await page.getByTestId('auth-profile-submit-button').click();
  await page.waitForURL('**/', { timeout: 10000 });

  return { email, password };
}
