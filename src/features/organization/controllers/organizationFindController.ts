import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { prisma } from '../../../prisma';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';

export const organizationFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/organization/{id}',
  params: z.object({
    id: z.string(),
  }),
  response: 'Organization',
};

export async function organizationFindController(
  params: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      organization: ['read'],
    },
    context,
  );

  const { id } = z.object({ id: z.string() }).parse(params);

  const organization = await prisma.organization.findUniqueOrThrow({
    where: {
      id,
    },
  });

  return organization;
}
