import { PrismaClient } from '../../prisma/generated/client';
import { env } from '../../env';
import { getDictionary } from '../../translation/getDictionary';
import { defaultLocale } from '../../translation/locales';

// Automatically creates or joins the default organization for new users
// in single-organization mode. Called during sign-up/sign-in lifecycle.
// Runs in session.create.before so activeOrganizationId can be set on the session directly.
// Returns { organizationId, memberId } if an org was created/joined, or null.
export async function authSingleOrganizationSetup({
  user,
  auth,
  prisma,
}: {
  user: { id: string; email: string };
  auth: any;
  prisma: PrismaClient;
}): Promise<{ organizationId: string; memberId: string } | null> {
  if (env.ORGANIZATION_MODE !== 'single') {
    return null;
  }

  // Skip if user already has a member record (already in an organization)
  const existingMember = await prisma.member.findFirst({
    where: { userId: user.id },
  });

  if (existingMember) {
    return null;
  }

  try {
    // Check if the shared default organization exists
    let organization = await prisma.organization.findUnique({
      where: { slug: 'default' },
    });

    if (!organization) {
      // First user in the system - create the default organization
      // Create org via Better Auth API (system action: no session needed when userId is passed)
      const dictionary = await getDictionary(defaultLocale);
      const createdOrg = await auth.api.createOrganization({
        body: {
          name: dictionary.projectName,
          slug: 'default',
          userId: user.id,
        },
      });

      const member = await prisma.member.findFirst({
        where: { userId: user.id, organizationId: createdOrg.id },
      });

      return { organizationId: createdOrg.id, memberId: member!.id };
    } else {
      // Default organization exists - check for pending invitation first
      const pendingInvitation = await prisma.invitation.findFirst({
        where: {
          email: user.email,
          organizationId: organization.id,
          status: 'pending',
        },
      });

      if (pendingInvitation) {
        await prisma.invitation.update({
          where: { id: pendingInvitation.id },
          data: { status: 'accepted' },
        });
        const member = await prisma.member.create({
          data: {
            userId: user.id,
            organizationId: pendingInvitation.organizationId,
            role: pendingInvitation.role ?? 'member',
          },
        });
        return {
          organizationId: pendingInvitation.organizationId,
          memberId: member.id,
        };
      } else {
        // No invitation found, add user as member with default role
        const defaultRole = env.ORGANIZATION_DEFAULT_ROLE;

        if (defaultRole) {
          const member = await prisma.member.create({
            data: {
              userId: user.id,
              organizationId: organization.id,
              role: defaultRole,
            },
          });
          return { organizationId: organization.id, memberId: member.id };
        }
      }

      return null;
    }
  } catch (error) {
    console.error(
      'Failed to auto-create organization for user:',
      user.id,
      error,
    );
    return null;
  }
}
