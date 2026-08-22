import { test, expect } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';
import { getDictionary } from '../../../translation/getDictionary';
import { defaultLocale } from '../../../translation/locales';

test.describe('Sign Up Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('sign up page loads', async ({ page }) => {
    const dictionary = await getDictionary(defaultLocale);

    await page.goto('/auth/sign-up');
    await expect(page).toHaveTitle(
      new RegExp(dictionary.auth.signUp.title, 'i'),
    );
    await expect(page.getByTestId('auth-signup-submit-button')).toBeVisible();
  });
});
