import { APIError } from 'better-auth';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryEnumerator } from '../../../translation/dictionaryEnumerator';
import { authBackend } from '../../auth/authBackend';

export const invitationFindMyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/member/invitation/my',
  response: '{ invitations: Invitation[] }',
};

export async function invitationFindMyController(context: AppContext) {
  const { currentUser } = context;

  if (!currentUser) {
    return { invitations: [] };
  }

  try {
    const invitationsResponse = await authBackend.api.listUserInvitations({
      headers: context.headers,
    });

    const allInvitations = invitationsResponse || [];

    const existingMemberships =
      await prismaDangerouslyBypassRLS.member.findMany({
        where: {
          userId: currentUser.id,
        },
        select: {
          organizationId: true,
        },
      });

    const existingOrgIds = new Set(
      existingMemberships.map(
        (m: { organizationId: string }) => m.organizationId,
      ),
    );

    const now = new Date();
    const invitations = allInvitations.filter((inv) => {
      return (
        inv.status === 'pending' &&
        new Date(inv.expiresAt) > now &&
        inv.email.toLowerCase() === currentUser.email.toLowerCase() &&
        !existingOrgIds.has(inv.organizationId)
      );
    });

    if (invitations.length === 0) {
      return { invitations: [] };
    }

    const organizationIds = [
      ...new Set(invitations.map((inv) => inv.organizationId)),
    ];

    const organizations =
      await prismaDangerouslyBypassRLS.organization.findMany({
        where: {
          id: { in: organizationIds },
        },
        select: {
          id: true,
          name: true,
        },
      });

    const organizationMap = new Map(
      organizations.map((org: { id: string; name: string }) => [
        org.id,
        org.name,
      ]),
    );

    const invitationsWithOrgs = invitations.map((invitation) => ({
      ...invitation,
      organization: {
        id: invitation.organizationId,
        name: organizationMap.get(invitation.organizationId) || null,
      },
    }));

    return { invitations: invitationsWithOrgs };
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error400(
        dictionaryEnumerator(
          context.dictionary.auth.errors,
          error.body?.code,
        ) ||
          error?.body?.message ||
          context.dictionary.shared.errors.unknown,
      );
    }

    throw error;
  }
}
