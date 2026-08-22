import { test, expect, Page } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';

async function signInWithPassword(page: Page, email: string, password: string) {
  await page.goto('/auth/sign-in');
  await page.getByTestId('auth-signin-email-input').fill(email);
  await page.getByTestId('auth-signin-password-input').fill(password);
  await page.getByTestId('auth-signin-submit-button').click();
  await page.waitForURL((url) => !url.pathname.includes('/auth/sign-in'), {
    timeout: 10000,
  });
}

test.describe('Member Sessions Card', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('admin sees and revokes their own member sessions', async ({
    page,
    browser,
  }) => {
    // Admin signs up on device 1 (auto-creates org + admin member row).
    const { email, password } = await signUpAndSignIn(page);

    // Device 2 signs in as the same admin — creates a second active session.
    const otherContext = await browser.newContext();
    const otherPage = await otherContext.newPage();
    await signInWithPassword(otherPage, email, password);

    // Navigate to member list, then click the email link for the admin's own row.
    // MemberList.tsx renders the email cell as a <Link to={`/member/${id}`}>,
    // so getByRole('link', { name: email }) targets that anchor precisely.
    await page.goto('/member');
    await page.getByRole('link', { name: email }).first().click();
    await page.waitForURL((url) => /\/member\/[^/]+$/.test(url.pathname), {
      timeout: 10000,
    });

    // Sessions card must show both sessions, one flagged as current.
    await expect(page.getByTestId('member-sessions-item')).toHaveCount(2, {
      timeout: 10000,
    });
    await expect(page.getByTestId('member-sessions-current-badge')).toHaveCount(
      1,
    );

    // Viewing yourself: "Sign out all devices" is hidden (it would skip your
    // own current session and do nothing) — only per-row revoke is offered.
    await expect(
      page.getByTestId('member-sessions-revoke-all-button'),
    ).toHaveCount(0);

    // Per-row revoke: the revoke button only appears on non-current sessions,
    // so clicking .first() removes the device-2 session.
    await page.getByTestId('member-sessions-revoke-button').first().click();
    await expect(page.getByTestId('member-sessions-item')).toHaveCount(1, {
      timeout: 10000,
    });

    await otherContext.close();
  });
});
