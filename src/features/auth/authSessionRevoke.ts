import { prismaDangerouslyBypassRLS } from '../../prisma';
import { env } from '../../env';
import { redisConnection } from '../../shared/lib/redisConnection';

/**
 * Revoke a single session by id. Mechanical only — callers write audit rows.
 * Returns true when a session row was found and deleted, false when the id
 * matched nothing (already revoked / expired) so callers can count only the
 * sessions they actually revoked.
 *
 * Sessions are user-level (no org RLS), so we use the bypass client; org-scope
 * is enforced by the caller resolving the target member within the org.
 *
 * NOTE: Better Auth's `session.delete.after` databaseHook does NOT fire for raw
 * Prisma deletes (it is wired into BA's adapter, not Prisma middleware), so the
 * SO audit row is written by the controller, not here.
 */
export async function revokeSessionById(sessionId: string): Promise<boolean> {
  const session = await prismaDangerouslyBypassRLS.session.findUnique({
    where: { id: sessionId },
    select: { id: true, token: true, userId: true },
  });

  if (!session) {
    return false;
  }

  await prismaDangerouslyBypassRLS.session.delete({ where: { id: sessionId } });

  // Purge Better Auth secondary-storage (Redis) copy when configured. BA keys
  // the live session record by its token (verified against the installed
  // better-auth dist: node_modules/better-auth/dist/db/internal-adapter.mjs).
  // Deleting the token key logs the session out; the `active-sessions-<userId>`
  // list self-heals (BA skips entries whose token key is gone and rewrites the
  // list with its TTL on the next login), so we do not touch it here.
  if (env.REDIS_URL) {
    await redisConnection.del(session.token);
  }

  return true;
}
