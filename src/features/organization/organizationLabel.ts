import { Organization } from '../../prisma/generated/client';

export function organizationLabel(organization?: Organization | null) {
  return organization?.name;
}
