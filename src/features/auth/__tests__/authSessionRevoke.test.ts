import { describe, it, expect, beforeEach } from 'vitest';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { revokeSessionById } from '../authSessionRevoke';

describe('revokeSessionById', () => {
  it('deletes the target session row and returns true', async () => {
    const { user } = await createTestUserWithOrganization();

    const session = await prismaDangerouslyBypassRLS.session.create({
      data: {
        token: `tok-${user.id}-${user.email}`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    const revoked = await revokeSessionById(session.id);
    expect(revoked).toBe(true);

    const after = await prismaDangerouslyBypassRLS.session.findUnique({
      where: { id: session.id },
    });
    expect(after).toBeNull();
  });

  it('returns false for an unknown session id', async () => {
    await expect(
      revokeSessionById('00000000-0000-0000-0000-000000000000'),
    ).resolves.toBe(false);
  });
});
