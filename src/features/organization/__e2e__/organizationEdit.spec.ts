import { test, expect } from '@playwright/test';
import {
  cleanTestDatabase,
  testPrismaClient,
} from '../../../test/testPrismaClient';
import { signUpAndSignIn } from '../../../test/testE2eHelpers';

test.describe('Organization Edit Page', () => {
  test.beforeEach(async () => {
    await cleanTestDatabase();
  });

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto(`/organization/test-id/edit`);
    await page.waitForURL('**/auth/sign-in**');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('allows authenticated user to access organization edit page', async ({
    page,
  }) => {
    // Sign up to create an organization in the database
    await signUpAndSignIn(page);

    // Fetch the created organization from the database
    const prisma = testPrismaClient();
    const organization = await prisma.organization.findFirst();

    if (!organization) {
      throw new Error('No organization found in database');
    }

    // Navigate to the organization edit page while authenticated
    await page.goto(`/organization/${organization.id}/edit`);

    // Verify we're on the edit page (not redirected)
    await expect(page).toHaveURL(`/organization/${organization.id}/edit`);

    // Verify the organization name appears on the page
    await expect(page.getByText(organization.name)).toBeVisible();
  });
});
