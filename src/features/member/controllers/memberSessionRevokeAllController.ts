import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { authBackend } from '../../auth/authBackend';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { revokeSessionById } from '../../auth/authSessionRevoke';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { resolveTargetMemberOr404 } from './memberSessionShared';

export async function memberSessionRevokeAllController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    { memberSession: ['revoke'] },
    context,
  );

  const { id } = z.object({ id: z.string() }).parse(params);
  const targetMember = await resolveTargetMemberOr404(
    id,
    currentOrganization,
    context,
  );

  const current = await authBackend.api.getSession({
    headers: context.headers,
  });
  const currentSessionId = current?.session?.id ?? null;

  const sessions = await prismaDangerouslyBypassRLS.session.findMany({
    where: { userId: targetMember.userId },
    select: { id: true },
  });

  let revokedCount = 0;
  try {
    for (const s of sessions) {
      if (s.id === currentSessionId) {
        continue; // keep the requester's own current session
      }
      // Count only sessions actually deleted — a session that disappeared
      // between findMany and here (self sign-out, expiry, a concurrent
      // revoke-all) returns false and must not inflate the count.
      const revoked = await revokeSessionById(s.id);
      if (revoked) {
        revokedCount++;
      }
    }
  } finally {
    // Single MSR row carrying the count (admin attribution; no synthetic SO).
    // Written in `finally` so a mid-loop failure still records the sessions
    // already revoked; skipped entirely when nothing was revoked so no-op
    // calls don't leave misleading "revoked member sessions" audit rows.
    if (revokedCount > 0) {
      await auditLogCreate({
        entityId: targetMember.id,
        entityName: 'Member',
        operation: auditLogOperations.memberSessionRevoked,
        context,
        newData: { revokedCount },
      });
    }
  }

  return { success: true as const, revokedCount };
}
