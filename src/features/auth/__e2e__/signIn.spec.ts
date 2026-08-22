import { test, expect } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';
import { getDictionary } from '../../../translation/getDictionary';
import { defaultLocale } from '../../../translation/locales';

test.describe('Sign In Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('sign in page loads', async ({ page }) => {
    const dictionary = await getDictionary(defaultLocale);

    await page.goto('/auth/sign-in');
    await expect(page).toHaveTitle(
      new RegExp(dictionary.auth.signIn.title, 'i'),
    );
    await expect(page.getByTestId('auth-signin-submit-button')).toBeVisible();
  });
});
