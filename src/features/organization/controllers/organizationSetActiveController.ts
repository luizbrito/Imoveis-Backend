import { APIError } from 'better-auth';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { Error403 } from '../../../shared/errors/Error403';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryEnumerator } from '../../../translation/dictionaryEnumerator';
import { authBackend } from '../../auth/authBackend';
import { invalidateMember } from '../../auth/authCache';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { env } from '../../../env';

export const organizationSetActiveApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/organization/{id}/set-active',
  params: z.object({
    id: z.string(),
  }),
  response: 'boolean',
};

export async function organizationSetActiveController(
  params: unknown,
  context: AppContext,
) {
  if (!context.currentUser) {
    throw new Error403();
  }

  const { id } = z.object({ id: z.string() }).parse(params);

  try {
    const defaultRole = env.ORGANIZATION_DEFAULT_ROLE;

    const existingMember = await prismaDangerouslyBypassRLS.member.findFirst({
      where: {
        userId: context.currentUser.id,
        organizationId: id,
      },
    });

    if (!existingMember) {
      // Check if there's a pending invitation for this user's email
      const pendingInvitation =
        await prismaDangerouslyBypassRLS.invitation.findFirst({
          where: {
            email: context.currentUser.email,
            organizationId: id,
            status: 'pending',
          },
        });

      if (pendingInvitation) {
        // Accept the invitation instead of adding directly with default role
        await authBackend.api.acceptInvitation({
          body: {
            invitationId: pendingInvitation.id,
          },
          headers: context.headers,
        });
      } else {
        // No invitation found, add with default role if exists
        if (defaultRole) {
          await authBackend.api.addMember({
            body: {
              userId: context.currentUser.id,
              organizationId: id,
              role: defaultRole,
            },
            headers: context.headers,
          });
        }
      }
    }

    const result = await authBackend.api.setActiveOrganization({
      body: {
        organizationId: id,
      },
      headers: context.headers,
    });

    if (!result) {
      throw new Error400(
        context.dictionary.organization.errors.setActiveFailed,
      );
    }

    if (context.currentUser) {
      await invalidateMember(context.currentUser.id, id);
    }

    return true;
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
