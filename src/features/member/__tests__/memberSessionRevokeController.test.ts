import { describe, it, expect } from 'vitest';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { memberSessionRevokeController } from '../controllers/memberSessionRevokeController';
import { Error404 } from '../../../shared/errors/Error404';

describe('memberSessionRevokeController', () => {
  it('revokes the session and writes an MSR row with admin attribution', async () => {
    const { user, organization, member } = await createTestUserWithOrganization(
      {},
      {},
      { role: 'admin' },
    );
    const session = await prismaDangerouslyBypassRLS.session.create({
      data: {
        token: `tok-${user.id}-r`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });
    const context = createAuthenticatedContext(user, organization, member, {
      isMcpRequest: true,
    });

    await memberSessionRevokeController(
      { id: member.id, sessionId: session.id },
      context,
    );

    const gone = await prismaDangerouslyBypassRLS.session.findUnique({
      where: { id: session.id },
    });
    expect(gone).toBeNull();

    const msr = await prismaDangerouslyBypassRLS.auditLog.findFirst({
      where: { operation: 'MSR', entityId: member.id },
    });
    expect(msr).not.toBeNull();
    expect(msr?.memberId).toBe(member.id);
  });

  it('404s when the session does not belong to the target member', async () => {
    const a = await createTestUserWithOrganization({}, {}, { role: 'admin' });
    const b = await createTestUserWithOrganization();
    const otherSession = await prismaDangerouslyBypassRLS.session.create({
      data: {
        token: `tok-${b.user.id}-x`,
        userId: b.user.id,
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });
    const context = createAuthenticatedContext(
      a.user,
      a.organization,
      a.member,
      {
        isMcpRequest: true,
      },
    );
    await expect(
      memberSessionRevokeController(
        { id: a.member.id, sessionId: otherSession.id },
        context,
      ),
    ).rejects.toThrow(Error404);
  });
});
