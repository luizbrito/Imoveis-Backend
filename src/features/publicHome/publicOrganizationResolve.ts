import { Context } from 'hono';
import { env } from '../../env';
import { prismaDangerouslyBypassRLS } from '../../prisma';

export async function publicOrganizationResolve(c: Context) {
  const requestedId = c.req.header('x-organization-id');
  const requestedSlug = c.req.query('organizationSlug');

  let organization = requestedId
    ? await prismaDangerouslyBypassRLS.organization.findUnique({
        where: { id: requestedId },
      })
    : requestedSlug
      ? await prismaDangerouslyBypassRLS.organization.findUnique({
          where: { slug: requestedSlug },
        })
      : env.ORGANIZATION_MODE === 'single'
        ? await prismaDangerouslyBypassRLS.organization.findFirst()
        : null;

  if (!organization && !requestedId && !requestedSlug) {
    const organizations =
      await prismaDangerouslyBypassRLS.organization.findMany({ take: 2 });
    organization = organizations.length === 1 ? organizations[0] : null;
  }

  return organization;
}
