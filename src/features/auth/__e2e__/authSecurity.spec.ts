import { test, expect, Page } from '@playwright/test';
import * as OTPAuth from 'otpauth';
import { cleanTestDatabase } from '../../../test/testPrismaClient';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';

async function enableTwoFactor(page: Page, password: string) {
  await page.goto('/auth/security');
  await page.getByTestId('security-2fa-enable-button').click();
  await page.getByTestId('security-2fa-password-input').fill(password);
  await page.getByTestId('security-2fa-continue-button').click();

  const secret = (
    await page.getByTestId('security-2fa-manual-secret').textContent()
  )?.trim();
  expect(secret).toBeTruthy();

  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret!),
    digits: 6,
    period: 30,
  });

  await page.getByTestId('security-2fa-code-input').fill(totp.generate());
  await page.getByTestId('security-2fa-verify-button').click();

  await expect(page.getByTestId('security-2fa-backup-codes')).toBeVisible();
  const backupCodes = (
    (await page.getByTestId('security-2fa-backup-codes').innerText()) || ''
  )
    .split(/\s+/)
    .filter(Boolean);

  // Checkbox is Base UI's Root (button role) — click toggles it
  await page.getByTestId('security-2fa-confirm-saved-checkbox').click();
  await page.getByTestId('security-2fa-done-button').click();

  await expect(page.getByTestId('security-2fa-status-badge')).toHaveText(
    'Enabled',
  );

  return { totp, backupCodes };
}

async function signOut(page: Page) {
  await page.goto('/auth/sign-out');
  await page.waitForURL('**/auth/sign-in**', { timeout: 10000 });
}

async function signInWithPassword(page: Page, email: string, password: string) {
  await page.goto('/auth/sign-in');
  await page.getByTestId('auth-signin-email-input').fill(email);
  await page.getByTestId('auth-signin-password-input').fill(password);
  await page.getByTestId('auth-signin-submit-button').click();
}

test.describe('Security: 2FA and sessions', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('enable 2FA, sign in with TOTP, trust device skips next challenge', async ({
    page,
  }) => {
    const { email, password } = await signUpAndSignIn(page);
    const { totp } = await enableTwoFactor(page, password);

    await signOut(page);
    await signInWithPassword(page, email, password);

    await page.waitForURL('**/auth/two-factor-verify**', { timeout: 10000 });
    // Trust device checkbox is Base UI Root (button role) — click toggles it
    await page.getByTestId('auth-2fa-trust-device-checkbox').click();
    // Generate TOTP immediately before fill to minimise clock-skew risk
    await page.getByTestId('auth-2fa-code-input').fill(totp.generate());
    await page.getByTestId('auth-2fa-verify-button').click();
    await page.waitForURL((url) => !url.pathname.includes('/auth/'), {
      timeout: 10000,
    });

    // Trusted device: next sign-in must skip the 2FA challenge entirely
    await signOut(page);
    await signInWithPassword(page, email, password);
    // Should land in the app, not on the 2FA verify page
    await page.waitForURL((url) => !url.pathname.includes('/auth/sign-in'), {
      timeout: 10000,
    });
    expect(page.url()).not.toContain('two-factor-verify');
  });

  test('sign in with a backup code (single use)', async ({ page }) => {
    const { email, password } = await signUpAndSignIn(page);
    const { backupCodes } = await enableTwoFactor(page, password);

    await signOut(page);
    await signInWithPassword(page, email, password);
    await page.waitForURL('**/auth/two-factor-verify**', { timeout: 10000 });

    await page.getByTestId('auth-2fa-use-backup-link').click();
    await page.getByTestId('auth-2fa-code-input').fill(backupCodes[0]);
    await page.getByTestId('auth-2fa-verify-button').click();
    await page.waitForURL((url) => !url.pathname.includes('/auth/'), {
      timeout: 10000,
    });
  });

  test('sessions list shows other sessions and revokes them', async ({
    page,
    browser,
  }) => {
    const { email, password } = await signUpAndSignIn(page);

    // Second and third device/browser contexts sign in
    const otherContext = await browser.newContext();
    const otherPage = await otherContext.newPage();
    await signInWithPassword(otherPage, email, password);
    await otherPage.waitForURL(
      (url) => !url.pathname.includes('/auth/sign-in'),
      { timeout: 10000 },
    );

    const thirdContext = await browser.newContext();
    const thirdPage = await thirdContext.newPage();
    await signInWithPassword(thirdPage, email, password);
    await thirdPage.waitForURL(
      (url) => !url.pathname.includes('/auth/sign-in'),
      { timeout: 10000 },
    );

    await page.goto('/auth/security');
    await expect(page.getByTestId('security-sessions-item')).toHaveCount(3);
    await expect(
      page.getByTestId('security-sessions-current-badge'),
    ).toHaveCount(1);

    // Per-row revoke removes a single other session
    await page.getByTestId('security-sessions-revoke-button').first().click();
    await expect(page.getByTestId('security-sessions-item')).toHaveCount(2);

    // Revoke-all-others removes the rest, keeping only the current session
    await page.getByTestId('security-sessions-revoke-others-button').click();
    // ConfirmDialog renders a destructive Button with confirmText = t.revokeOthers
    await page
      .getByRole('button', { name: 'Sign out all other devices' })
      .click();

    await expect(page.getByTestId('security-sessions-item')).toHaveCount(1);
    await otherContext.close();
    await thirdContext.close();
  });
});
