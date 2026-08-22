import { test, expect, Page } from '@playwright/test';
import * as OTPAuth from 'otpauth';
import {
  cleanTestDatabase,
  testPrismaClient,
} from '../../../test/testPrismaClient';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';

async function completeWizard(page: Page, password: string) {
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
  await page.getByTestId('security-2fa-confirm-saved-checkbox').click();
  await page.getByTestId('security-2fa-done-button').click();
}

test.describe('Organization 2FA enforcement', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('toggling the requirement forces members without 2FA into setup', async ({
    page,
  }) => {
    const { password } = await signUpAndSignIn(page);

    // flip the flag directly (the UI toggle is covered by the unit-tested
    // update path; this test focuses on the enforcement funnel)
    const prisma = testPrismaClient();
    const org = await prisma.organization.findFirstOrThrow();
    await prisma.organization.update({
      where: { id: org.id },
      data: { require2fa: true },
    });

    // any app navigation now funnels to the forced page
    await page.goto('/auth/profile');
    await page.waitForURL('**/auth/two-factor-required**', { timeout: 10000 });
    await expect(
      page.getByTestId('auth-2fa-required-password-setup-button'),
    ).toBeVisible();

    // complete the embedded wizard and get released back into the app
    await completeWizard(page, password);
    await page.waitForURL((url) => url.pathname === '/', { timeout: 10000 });

    // and the app is reachable again
    await page.goto('/auth/profile');
    await expect(page).toHaveURL(/\/auth\/profile/);
  });

  test('members with 2FA are unaffected by the requirement', async ({
    page,
  }) => {
    const { password } = await signUpAndSignIn(page);

    await page.goto('/auth/security');
    await completeWizard(page, password);

    const prisma = testPrismaClient();
    const org = await prisma.organization.findFirstOrThrow();
    await prisma.organization.update({
      where: { id: org.id },
      data: { require2fa: true },
    });

    await page.goto('/auth/profile');
    await expect(page).toHaveURL(/\/auth\/profile/);
  });

  test('org settings toggle persists the requirement', async ({ page }) => {
    const { password } = await signUpAndSignIn(page);

    // admin needs 2FA first or the toggle locks them out mid-test
    await page.goto('/auth/security');
    await completeWizard(page, password);

    const prisma = testPrismaClient();
    const org = await prisma.organization.findFirstOrThrow();

    await page.goto(`/organization/${org.id}/edit`);
    await page.getByTestId('organization-require2fa-switch').click();
    // the form's save button — matches the existing submit control on the page
    await page.getByRole('button', { name: /save/i }).click();

    await expect
      .poll(async () => {
        const updated = await prisma.organization.findUniqueOrThrow({
          where: { id: org.id },
        });
        return updated.require2fa;
      })
      .toBe(true);
  });
});
