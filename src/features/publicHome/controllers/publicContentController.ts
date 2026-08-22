import { Context } from 'hono';
import { PublicContent, publicSiteMetadataSchema } from '../publicHomeSchemas';
import { publicOrganizationResolve } from '../publicOrganizationResolve';

export async function publicContentController(c: Context): Promise<PublicContent> {
  const organization = await publicOrganizationResolve(c);
  const metadata = publicSiteMetadataSchema.safeParse(
    organization?.metadata && typeof organization.metadata === 'object'
      ? (organization.metadata as Record<string, unknown>).publicSite
      : undefined,
  );
  const site = metadata.success ? metadata.data : {};

  return {
    testimonials: site.testimonials ?? [],
    settings: {
      organizationName: organization?.name ?? '',
      description: site.description ?? null,
      phone: site.phone ?? null,
      email: site.email ?? null,
      address: site.address ?? null,
      whatsapp: site.whatsapp ?? null,
      social: {
        instagram: site.social?.instagram ?? null,
        facebook: site.social?.facebook ?? null,
        linkedin: site.social?.linkedin ?? null,
        youtube: site.social?.youtube ?? null,
      },
    },
  };
}
