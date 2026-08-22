import type { Organization } from '../../prisma/generated/client';
import { prismaDangerouslyBypassRLS } from '../../prisma';

/**
 * Get organization based on x-organization-id header from request
 */
export async function organizationFromRequest(
  request?: Request,
): Promise<Organization | null> {
  try {
    if (request?.headers) {
      const organizationId = request.headers.get('x-organization-id');

      if (organizationId) {
        const organization =
          await prismaDangerouslyBypassRLS.organization.findUnique({
            where: {
              id: organizationId,
            },
          });

        return organization;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}
