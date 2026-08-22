import { expect, test } from '@playwright/test';
import { cleanTestDatabase } from '../../../test/testPrismaClient';

test.describe('AtivoIncluidoVendaRural Edit Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/ativo-incluido-venda-rural/test-id');
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
