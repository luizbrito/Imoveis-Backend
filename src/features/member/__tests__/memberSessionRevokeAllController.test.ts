import { describe, it, expect } from 'vitest';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { memberSessionRevokeAllController } from '../controllers/memberSessionRevokeAllController';

describe('memberSessionRevokeAllController', () => {
  it('revokes all sessions and reports the count', async () => {
    const { user, organization, member } = await createTestUserWithOrganization(
      {},
      {},
      { role: 'admin' },
    );
    for (const n of [1, 2, 3]) {
      await prismaDangerouslyBypassRLS.session.create({
        data: {
          token: `tok-${user.id}-${n}`,
          userId: user.id,
          expiresAt: new Date(Date.now() + 3600_000),
        },
      });
    }
    const context = createAuthenticatedContext(user, organization, member, {
      isMcpRequest: true,
    });

    const result = await memberSessionRevokeAllController(
      { id: member.id },
      context,
    );

    // No resolvable current session in unit context -> all three revoked.
    expect(result.revokedCount).toBe(3);
    const remaining = await prismaDangerouslyBypassRLS.session.count({
      where: { userId: user.id },
    });
    expect(remaining).toBe(0);

    const msr = await prismaDangerouslyBypassRLS.auditLog.findFirst({
      where: { operation: 'MSR', entityId: member.id },
    });
    expect((msr?.newData as any)?.revokedCount).toBe(3);
  });
});
