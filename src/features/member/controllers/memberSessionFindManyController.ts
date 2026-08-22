import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { authBackend } from '../../auth/authBackend';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { resolveTargetMemberOr404 } from './memberSessionShared';

export async function memberSessionFindManyController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    { memberSession: ['read'] },
    context,
  );

  const { id } = z.object({ id: z.string() }).parse(params);
  const targetMember = await resolveTargetMemberOr404(
    id,
    currentOrganization,
    context,
  );

  // Requester's current session, to flag isCurrent (only meaningful when the
  // admin is viewing their own member page).
  const current = await authBackend.api.getSession({
    headers: context.headers,
  });
  const currentSessionId = current?.session?.id ?? null;

  // Sessions are user-level -> bypass RLS. token is intentionally NOT selected.
  const sessions = await prismaDangerouslyBypassRLS.session.findMany({
    where: { userId: targetMember.userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      ipAddress: true,
      userAgent: true,
    },
  });

  return sessions.map((s) => ({
    id: s.id,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    isCurrent: s.id === currentSessionId,
  }));
}
