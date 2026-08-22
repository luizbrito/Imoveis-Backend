import { expect, test } from '@playwright/test';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('DocumentacaoRuralBrasil List Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/documentacao-rural-brasil');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('displays documentacaoRuralBrasil list when authenticated', async ({
    page,
  }) => {
    await signUpAndSignIn(page);

    await page.goto('/documentacao-rural-brasil');
    await expect(page).toHaveURL(
      new RegExp(`\\/${'documentacao-rural-brasil'}`),
    );

    await expect(page.getByTestId('page-header-title')).toBeVisible();
  });
});
