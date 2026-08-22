import { describe, it, expect } from 'vitest';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { memberSessionFindManyController } from '../controllers/memberSessionFindManyController';
import { Error403 } from '../../../shared/errors/Error403';
import { Error404 } from '../../../shared/errors/Error404';

describe('memberSessionFindManyController', () => {
  it('lists the target member sessions without exposing token', async () => {
    const { user, organization, member } = await createTestUserWithOrganization(
      {},
      {},
      { role: 'admin' },
    );
    await prismaDangerouslyBypassRLS.session.create({
      data: {
        token: `tok-${user.id}-a`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 3600_000),
        ipAddress: '1.2.3.4',
        userAgent: 'Mozilla/5.0',
      },
    });
    const context = createAuthenticatedContext(user, organization, member, {
      isMcpRequest: true,
    });

    const result = await memberSessionFindManyController(
      { id: member.id },
      context,
    );

    expect(result.length).toBe(1);
    expect(result.every((s) => !('token' in s))).toBe(true);
    expect(result[0].ipAddress).toBe('1.2.3.4');
    // No current session resolvable in unit context -> all isCurrent false
    expect(result[0].isCurrent).toBe(false);
  });

  it('denies the member role (403)', async () => {
    const { user, organization, member } = await createTestUserWithOrganization(
      {},
      {},
      { role: 'member' },
    );
    const context = createAuthenticatedContext(user, organization, member, {
      isMcpRequest: true,
    });
    await expect(
      memberSessionFindManyController({ id: member.id }, context),
    ).rejects.toThrow(Error403);
  });

  it('returns 404 for a member of another org', async () => {
    const a = await createTestUserWithOrganization({}, {}, { role: 'admin' });
    const b = await createTestUserWithOrganization();
    const context = createAuthenticatedContext(
      a.user,
      a.organization,
      a.member,
      {
        isMcpRequest: true,
      },
    );
    await expect(
      memberSessionFindManyController({ id: b.member.id }, context),
    ).rejects.toThrow(Error404);
  });
});
