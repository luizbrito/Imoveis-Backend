import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('InteracaoLead New Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('interacaoLead new page loads when authenticated', async ({ page }) => {
    await signUpAndSignIn(page);

    await page.goto('/interacao-lead/new');
    await expect(page).toHaveURL(new RegExp(`\\/${'interacao-lead'}\\/new`));
    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/interacao-lead/new');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
