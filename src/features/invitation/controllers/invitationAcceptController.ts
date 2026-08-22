import { APIError } from 'better-auth';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { Error403 } from '../../../shared/errors/Error403';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryEnumerator } from '../../../translation/dictionaryEnumerator';
import { authBackend } from '../../auth/authBackend';
import { prismaDangerouslyBypassRLS } from '../../../prisma';

export const invitationAcceptApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/member/invitation/{id}/accept',
  params: z.object({
    id: z.string(),
  }),
  response: 'Member',
};

export async function invitationAcceptController(
  params: unknown,
  context: AppContext,
) {
  if (!context.currentUser) {
    throw new Error403();
  }

  const { id } = z.object({ id: z.string() }).parse(params);

  // Check if user is already an active member of the organization
  // This prevents duplicate membership errors and provides better UX
  try {
    // Fetch the invitation to get organization details
    // Bypass RLS since invitation acceptance happens before org membership
    const invitation = await prismaDangerouslyBypassRLS.invitation.findUnique({
      where: { id },
      select: { organizationId: true, email: true, status: true },
    });

    if (invitation) {
      // Check if user is already an active member of the organization
      const existingMember = await prismaDangerouslyBypassRLS.member.findFirst({
        where: {
          userId: context.currentUser.id,
          organizationId: invitation.organizationId,
          disabled: false,
        },
      });

      if (existingMember) {
        // User is already an active member, switch to that organization and return success
        await authBackend.api.setActiveOrganization({
          body: {
            organizationId: invitation.organizationId,
          },
          headers: context.headers,
        });

        return {
          member: existingMember,
          invitation,
        };
      }
    }
  } catch (error) {
    // If there's an error checking existing membership (e.g., invalid UUID format),
    // continue with normal invitation acceptance flow
    console.log('Error checking existing membership:', error);
  }

  try {
    const result = await authBackend.api.acceptInvitation({
      body: {
        invitationId: id,
      },
      headers: context.headers,
    });

    if (!result) {
      throw new Error400(context.dictionary.invitation.errors.acceptFailed);
    }

    // Auto-switch user context to the newly joined organization for immediate access
    if (result.invitation?.organizationId) {
      await authBackend.api.setActiveOrganization({
        body: {
          organizationId: result.invitation.organizationId,
        },
        headers: context.headers,
      });
    }

    return result;
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
