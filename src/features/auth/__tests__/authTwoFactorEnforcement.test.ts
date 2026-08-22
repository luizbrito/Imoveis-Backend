import { describe, expect, it, vi } from 'vitest';
import { authTwoFactorEnforcement } from '../authTwoFactorEnforcement';
import { Error403 } from '../../../shared/errors/Error403';

vi.mock('../../../shared/lib/sendEmail', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

import { authBackend } from '../authBackend';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { cookiesFromSetCookie } from '../../../test/testAuthCookies';

const PASSWORD = 'TestPassword123!';
let integrationCounter = 0;

describe('require2fa end-to-end through Better Auth', () => {
  it('persists require2fa via updateOrganization and serializes it back', async () => {
    integrationCounter += 1;
    const email = `enforce-${integrationCounter}@example.com`;
    const signUpResult = await authBackend.api.signUpEmail({
      body: { email, password: PASSWORD, name: 'Enforce User' },
      returnHeaders: true,
    });
    const headers = new Headers({
      cookie: cookiesFromSetCookie(signUpResult.headers.get('set-cookie')),
    });

    const org = await authBackend.api.createOrganization({
      body: {
        name: `Enforce Org ${integrationCounter}`,
        slug: `enforce-org-${integrationCounter}`,
      },
      headers,
    });

    await authBackend.api.updateOrganization({
      body: {
        organizationId: org!.id,
        data: { require2fa: true } as any,
      },
      headers,
    });

    const row = await prismaDangerouslyBypassRLS.organization.findUniqueOrThrow(
      { where: { id: org!.id } },
    );
    expect(row.require2fa).toBe(true);
  });
});

describe('require2fa blocks Better Auth native org endpoints', () => {
  async function arrangeEnforcedUser() {
    integrationCounter += 1;
    const email = `enforce-hook-${integrationCounter}@example.com`;
    const signUpResult = await authBackend.api.signUpEmail({
      body: { email, password: PASSWORD, name: 'Enforce Hook User' },
      returnHeaders: true,
    });
    const headers = new Headers({
      cookie: cookiesFromSetCookie(signUpResult.headers.get('set-cookie')),
    });

    const org = await authBackend.api.createOrganization({
      body: {
        name: `Hook Org ${integrationCounter}`,
        slug: `hook-org-${integrationCounter}`,
      },
      headers,
    });

    // the sign-up session predates the org; make it the active one
    await authBackend.api.setActiveOrganization({
      body: { organizationId: org!.id },
      headers,
    });

    await prismaDangerouslyBypassRLS.organization.update({
      where: { id: org!.id },
      data: { require2fa: true },
    });

    return { headers, orgId: org!.id };
  }

  it('blocks roster and update endpoints for un-2FA members of an enforcing org', async () => {
    const { headers, orgId } = await arrangeEnforcedUser();

    await expect(
      authBackend.api.getFullOrganization({ headers }),
    ).rejects.toThrow(/ORGANIZATION_REQUIRES_TWO_FACTOR/);

    await expect(
      authBackend.api.updateOrganization({
        body: { organizationId: orgId, data: { name: 'Renamed' } },
        headers,
      }),
    ).rejects.toThrow(/ORGANIZATION_REQUIRES_TWO_FACTOR/);
  });

  it('keeps set-active reachable as the multi-org escape hatch', async () => {
    const { headers, orgId } = await arrangeEnforcedUser();

    await expect(
      authBackend.api.setActiveOrganization({
        body: { organizationId: orgId },
        headers,
      }),
    ).resolves.toBeTruthy();
  });
});

function contextWith(overrides: Record<string, unknown>) {
  return {
    currentUser: { id: 'u1', twoFactorEnabled: false },
    currentOrganization: { id: 'o1', require2fa: true },
    apiKey: undefined,
    ...overrides,
  } as any;
}

describe('authTwoFactorEnforcement', () => {
  it('throws 403 ORGANIZATION_REQUIRES_TWO_FACTOR when org requires and user lacks 2FA', () => {
    expect(() => authTwoFactorEnforcement(contextWith({}))).toThrowError(
      Error403,
    );
    expect(() => authTwoFactorEnforcement(contextWith({}))).toThrowError(
      'ORGANIZATION_REQUIRES_TWO_FACTOR',
    );
  });

  it('allows when the user has 2FA enabled', () => {
    expect(() =>
      authTwoFactorEnforcement(
        contextWith({ currentUser: { id: 'u1', twoFactorEnabled: true } }),
      ),
    ).not.toThrow();
  });

  it('allows when the organization does not require 2FA', () => {
    expect(() =>
      authTwoFactorEnforcement(
        contextWith({ currentOrganization: { id: 'o1', require2fa: false } }),
      ),
    ).not.toThrow();
  });

  it('allows API-key-authenticated requests regardless of 2FA', () => {
    expect(() =>
      authTwoFactorEnforcement(contextWith({ apiKey: { id: 'k1' } })),
    ).not.toThrow();
  });

  it('allows when there is no active organization', () => {
    expect(() =>
      authTwoFactorEnforcement(contextWith({ currentOrganization: null })),
    ).not.toThrow();
  });

  it('allows when there is no signed-in user', () => {
    expect(() =>
      authTwoFactorEnforcement(
        contextWith({ currentUser: null, currentOrganization: null }),
      ),
    ).not.toThrow();
  });
});
