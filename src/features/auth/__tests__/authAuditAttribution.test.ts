import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../shared/lib/sendEmail', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

// Wrap the member cache so the cache-hit branches of resolveAuditMemberId can
// be exercised (the test env has no Redis, so the real getCachedMember always
// returns undefined). Default behavior matches the real Redis-off contract.
vi.mock('../authCache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../authCache')>();
  return {
    ...actual,
    getCachedMember: vi.fn(async () => undefined),
    setCachedMember: vi.fn(actual.setCachedMember),
  };
});

import { authBackend } from '../authBackend';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { getCachedMember, setCachedMember } from '../authCache';
import { cookiesFromSetCookie } from '../../../test/testAuthCookies';

const PASSWORD = 'TestPassword123!';

let counter = 0;
async function signUp() {
  counter += 1;
  const email = `audit-attr-${counter}@example.com`;
  const result = await authBackend.api.signUpEmail({
    body: { email, password: PASSWORD, name: 'Audit Attr User' },
    returnHeaders: true,
  });
  const headers = new Headers({
    cookie: cookiesFromSetCookie(result.headers.get('set-cookie')),
  });
  const user = await prismaDangerouslyBypassRLS.user.findUniqueOrThrow({
    where: { email },
  });
  return { email, headers, userId: user.id };
}

async function signIn(email: string) {
  const result = await authBackend.api.signInEmail({
    body: { email, password: PASSWORD },
    returnHeaders: true,
  });
  return new Headers({
    cookie: cookiesFromSetCookie(result.headers.get('set-cookie')),
  });
}

// Sign-up in multi-org mode leaves no active organization. Creating exactly
// one org makes the session-create hook auto-select it on the NEXT sign-in.
async function arrangeUserWithOrganization() {
  const { email, headers, userId } = await signUp();
  await authBackend.api.createOrganization({
    body: { name: `Audit Org ${counter}`, slug: `audit-org-${counter}` },
    headers,
  });
  const member = await prismaDangerouslyBypassRLS.member.findFirstOrThrow({
    where: { userId },
  });
  const orgHeaders = await signIn(email);
  return { email, userId, memberId: member.id, orgHeaders };
}

async function latestAuditRow(
  operation: string,
  userId: string,
  extraWhere: Record<string, unknown> = {},
) {
  return prismaDangerouslyBypassRLS.auditLog.findFirst({
    where: { operation, userId, ...extraWhere },
    orderBy: { timestamp: 'desc' },
  });
}

describe('authAuditAttribution', () => {
  it('attributes sign-in audit rows to the member when an org is active', async () => {
    const { userId, memberId } = await arrangeUserWithOrganization();

    // sign-up also writes an org-less SI row; scope to the org-active one
    const row = await latestAuditRow('SI', userId, {
      organizationId: { not: null },
    });
    expect(row).not.toBeNull();
    expect(row!.memberId).toBe(memberId);
  });

  it('attributes sign-out audit rows to the member', async () => {
    const { userId, memberId, orgHeaders } =
      await arrangeUserWithOrganization();

    await authBackend.api.signOut({ headers: orgHeaders });

    const row = await latestAuditRow('SO', userId);
    expect(row).not.toBeNull();
    expect(row!.memberId).toBe(memberId);
  });

  it('attributes 2FA enable/disable audit rows to the member', async () => {
    const { userId, memberId, orgHeaders } =
      await arrangeUserWithOrganization();

    const enableResult = await authBackend.api.enableTwoFactor({
      body: { password: PASSWORD },
      headers: orgHeaders,
    });
    expect(enableResult.totpURI).toContain('otpauth://totp/');

    await authBackend.api.disableTwoFactor({
      body: { password: PASSWORD },
      headers: orgHeaders,
    });

    const tfe = await latestAuditRow('TFE', userId);
    expect(tfe).not.toBeNull();
    expect(tfe!.memberId).toBe(memberId);

    const tfd = await latestAuditRow('TFD', userId);
    expect(tfd).not.toBeNull();
    expect(tfd!.memberId).toBe(memberId);
  });

  it('keeps memberId null for sessions without an active organization', async () => {
    const { userId } = await signUp();

    const row = await latestAuditRow('SI', userId);
    expect(row).not.toBeNull();
    expect(row!.memberId).toBeNull();
  });

  it('uses the cached member id on a cache hit without writing the cache', async () => {
    const { email, headers, userId } = await signUp();
    await authBackend.api.createOrganization({
      body: {
        name: `Audit Cache Org ${counter}`,
        slug: `audit-cache-org-${counter}`,
      },
      headers,
    });

    const cachedMemberId = '00000000-0000-4000-8000-000000000001';
    vi.mocked(setCachedMember).mockClear();
    vi.mocked(getCachedMember).mockResolvedValueOnce({ id: cachedMemberId });

    await signIn(email);

    const row = await latestAuditRow('SI', userId, {
      organizationId: { not: null },
    });
    expect(row).not.toBeNull();
    expect(row!.memberId).toBe(cachedMemberId);
    expect(setCachedMember).not.toHaveBeenCalled();
  });

  it('treats the cached "not a member" sentinel as null without a DB lookup', async () => {
    const { email, headers, userId } = await signUp();
    await authBackend.api.createOrganization({
      body: {
        name: `Audit Sentinel Org ${counter}`,
        slug: `audit-sentinel-org-${counter}`,
      },
      headers,
    });

    const findFirstSpy = vi.spyOn(
      prismaDangerouslyBypassRLS.member,
      'findFirst',
    );
    vi.mocked(getCachedMember).mockResolvedValueOnce(null);

    await signIn(email);

    const row = await latestAuditRow('SI', userId, {
      organizationId: { not: null },
    });
    expect(row).not.toBeNull();
    expect(row!.memberId).toBeNull();
    expect(findFirstSpy).not.toHaveBeenCalled();
    findFirstSpy.mockRestore();
  });
});
