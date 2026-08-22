import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { authBackend } from '../../auth/authBackend';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { revokeSessionById } from '../../auth/authSessionRevoke';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { resolveTargetMemberOr404 } from './memberSessionShared';
import { Error400 } from '../../../shared/errors/Error400';
import { Error404 } from '../../../shared/errors/Error404';

export async function memberSessionRevokeController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    { memberSession: ['revoke'] },
    context,
  );

  const { id, sessionId } = z
    .object({ id: z.string(), sessionId: z.string() })
    .parse(params);

  const targetMember = await resolveTargetMemberOr404(
    id,
    currentOrganization,
    context,
  );

  const session = await prismaDangerouslyBypassRLS.session.findUnique({
    where: { id: sessionId },
    select: { id: true, userId: true },
  });
  if (!session || session.userId !== targetMember.userId) {
    throw new Error404(
      context.dictionary.member.sessions.errors.sessionNotFound,
    );
  }

  // Refuse revoking the requester's own current session.
  const current = await authBackend.api.getSession({
    headers: context.headers,
  });
  if (current?.session?.id === sessionId) {
    throw new Error400(
      context.dictionary.member.sessions.errors.cannotRevokeCurrent,
    );
  }

  await revokeSessionById(sessionId);

  // MSR row — admin attribution ("which admin acted"). Single audit record for
  // an admin-initiated revoke; we deliberately do NOT synthesize an SO row
  // (target-as-actor would misleadingly read as a self sign-out — see Q1).
  await auditLogCreate({
    entityId: targetMember.id,
    entityName: 'Member',
    operation: auditLogOperations.memberSessionRevoked,
    context,
    newData: { sessionId },
  });

  return { success: true as const };
}
