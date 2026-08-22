import { Organization } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { prisma } from '../../../prisma';
import { Error404 } from '../../../shared/errors/Error404';

/**
 * Resolve the target member by id WITHIN the admin's active organization.
 * Returns minimal fields; throws 404 if the id is not a member of this org
 * (this is the org-scoping boundary for all session endpoints).
 */
export async function resolveTargetMemberOr404(
  id: string,
  currentOrganization: Organization,
  context: AppContext,
): Promise<{ id: string; userId: string }> {
  const targetMember = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) =>
      tx.member.findUnique({
        where: {
          id_organizationId: { id, organizationId: currentOrganization.id },
        },
        select: { id: true, userId: true },
      }),
  );

  if (!targetMember) {
    throw new Error404(context.dictionary.member.errors.notFound);
  }

  return targetMember;
}
