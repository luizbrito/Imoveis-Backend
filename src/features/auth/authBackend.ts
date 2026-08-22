import { betterAuth } from 'better-auth/minimal';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { apiKey } from '@better-auth/api-key';
import { captcha, mcp, openAPI } from 'better-auth/plugins';
import { organization } from 'better-auth/plugins/organization';
import { twoFactor } from 'better-auth/plugins/two-factor';
import { dictionary as enDictionary } from '../../translation/en/en';
import { prismaDangerouslyBypassRLS } from '../../prisma';
import { getFrontendUrl } from '../../shared/lib/getFrontendUrl';
import { redisConnection } from '../../shared/lib/redisConnection';
import { sendEmail } from '../../shared/lib/sendEmail';
import { dictionaryFormat } from '../../translation/dictionaryFormat';
import { dictionaryLocaleFromRequest } from '../../translation/dictionaryLocaleFromRequest';
import { getDictionary } from '../../translation/getDictionary';
import { auditLogCreate } from '../auditLog/auditLogCreate';
import { auditLogOperations } from '../auditLog/auditLogOperations';
import { memberCanRemoveAdmin } from '../member/memberCanRemoveAdmin';
import { sendNotification } from '../notification/notificationService';
import { organizationFromRequest } from '../organization/organizationFromRequest';
import { accessControl, roles, rolesIds } from '../permissions';
import { subscriptionCancelOnStripe } from '../subscription/subscriptionCancelOnStripe';
import {
  getCachedMember,
  invalidateMember,
  invalidateOrganizationAndMembers,
} from './authCache';
import {
  apiKeyMaxExpiresInDays,
  apiKeyMinExpiresInDays,
  ORGANIZATION_REQUIRES_TWO_FACTOR,
} from './authConstants';
import { authAutoSelectOrganization } from './authSingleOrganizationSetSession';
import { authSingleOrganizationSetup } from './authSingleOrganizationSetup';
import { invitationComputeStatus } from '../invitation/invitationComputedStatus';
import { InvitationStatus } from '../invitation/invitationSchemas';
import { trustedOrigins } from './authTrustedOrigins';
import { env } from '../../env';
import { defaultLocale } from '../../translation/locales';

// TFE fires on successful /two-factor/enable (the password-confirmed action
// that initiates setup), not when twoFactorEnabled flips on first verify.
const twoFactorAuditOperations = {
  '/two-factor/enable': auditLogOperations.twoFactorEnabled,
  '/two-factor/disable': auditLogOperations.twoFactorDisabled,
  '/two-factor/generate-backup-codes':
    auditLogOperations.twoFactorBackupCodesRegenerated,
} satisfies Record<
  string,
  (typeof auditLogOperations)[keyof typeof auditLogOperations]
>;

// Resolves the acting member for audit attribution at event time.
// Reads the middleware's member cache but never writes it (the middleware
// caches the full member with includes; writing a partial object here
// would poison that cache). Falls back to a direct lookup on cache miss.
async function resolveAuditMemberId(
  userId: string,
  organizationId: string | null | undefined,
): Promise<string | null> {
  if (!organizationId) {
    return null;
  }

  const cached = await getCachedMember(userId, organizationId);
  if (cached !== undefined) {
    return cached?.id ?? null;
  }

  const member = await prismaDangerouslyBypassRLS.member.findFirst({
    where: { userId, organizationId },
    select: { id: true },
  });
  return member?.id ?? null;
}

// Better Auth's native organization endpoints bypass the app's appContext()
// chokepoint, so the org 2FA hard-block is mirrored here for every endpoint
// that reads or mutates org/roster/invitation/role data. Endpoints NOT listed
// are the ones a user without 2FA legitimately needs (set-active — multi-org
// escape hatch, leave, invitation accept/reject, list — own org names only,
// and the active-member/permission lookups), so the app's onboarding and
// org-switching flows keep working.
//
// This is an explicit block-list rather than deny-by-default over
// `/organization/*`: the allow-set can only be validated against a running
// generated app (this template does not run in place), and over-blocking an
// onboarding endpoint would break every generated app. Better Auth is pinned,
// so new native endpoints arrive only on a deliberate, re-reviewable upgrade.
const orgTwoFactorBlockedPaths = [
  '/organization/get-full-organization',
  '/organization/update',
  '/organization/delete',
  '/organization/remove-member',
  '/organization/update-member-role',
  '/organization/invite-member',
  '/organization/list-members',
  '/organization/list-invitations',
  '/organization/cancel-invitation',
  '/organization/create-role',
  '/organization/update-role',
  '/organization/delete-role',
  '/organization/list-roles',
  '/organization/get-role',
];

export const authBackend = betterAuth({
  database: prismaAdapter(prismaDangerouslyBypassRLS, {
    provider: 'postgresql',
  }),
  ...(env.REDIS_URL
    ? {
        secondaryStorage: {
          get: async (key) => {
            return await redisConnection.get(key);
          },
          set: async (key, value, ttl) => {
            if (ttl) {
              await redisConnection.set(key, value, 'EX', ttl);
            } else {
              await redisConnection.set(key, value);
            }
          },
          delete: async (key) => {
            await redisConnection.del(key);
          },
        },
      }
    : {}),
  // When REDIS_URL is set, sessions are written to secondary storage (Redis).
  // Keep writing them to Postgres too so the admin member-session feature —
  // which queries the Session table via Prisma — has a queryable source of
  // truth and revocation deletes the DB row. Harmless when Redis is unset
  // (Postgres is already the primary store). Sessions created before this was
  // enabled live only in Redis and appear once the user re-authenticates.
  session: {
    storeSessionInDatabase: true,
  },
  plugins: [
    ...(env.RECAPTCHA_SECRET_KEY
      ? [
          captcha({
            provider: 'google-recaptcha',
            secretKey: env.RECAPTCHA_SECRET_KEY,
            endpoints: [
              '/sign-up/email',
              '/sign-in/email',
              '/forget-password',
              '/reset-password',
              '/send-verification-email',
              '/verify-email',
            ],
          }),
        ]
      : []),

    organization({
      ac: accessControl,
      roles: roles,
      creatorRole: rolesIds.admin,
      defaultRole: env.ORGANIZATION_DEFAULT_ROLE || undefined,
      schema: {
        organization: {
          additionalFields: {
            logosDark: {
              type: 'json',
              required: false,
              input: true,
            },
            logosLight: {
              type: 'json',
              required: false,
              input: true,
            },
            backgroundImageDark: {
              type: 'json',
              required: false,
              input: true,
            },
            backgroundImageLight: {
              type: 'json',
              required: false,
              input: true,
            },
            require2fa: {
              type: 'boolean',
              required: false,
              input: true,
            },
            updatedAt: {
              type: 'date',
              required: true,
              defaultValue: () => new Date(),
              input: false,
            },
            createdByUserId: {
              type: 'string',
              required: false,
              input: false,
            },
            updatedByUserId: {
              type: 'string',
              required: false,
              input: false,
            },
          },
        },
        member: {
          modelName: 'Member',
          additionalFields: {
            updatedAt: {
              type: 'date',
              required: true,
              defaultValue: () => new Date(),
              input: false,
            },
            firstName: {
              type: 'string',
              input: true,
              required: false,
            },
            lastName: {
              type: 'string',
              input: true,
              required: false,
            },
            fullName: {
              type: 'string',
              input: false,
              required: false,
            },
            avatars: {
              type: 'json',
              input: true,
              required: false,
            },
            disabled: {
              type: 'boolean',
              required: false,
              defaultValue: false,
              input: false,
            },
            status: {
              type: 'string',
              required: false,
              input: false,
            },
            importHash: {
              type: 'string',
              input: false,
              required: false,
            },
            createdByUserId: {
              type: 'string',
              required: false,
              input: false,
            },
            createdByMemberId: {
              type: 'string',
              required: false,
              input: false,
            },
            updatedByUserId: {
              type: 'string',
              required: false,
              input: false,
            },
            updatedByMemberId: {
              type: 'string',
              required: false,
              input: false,
            },
          },
        },
        invitation: {
          modelName: 'invitation',
        },
      },

      allowUserToCreateOrganization: true,
      organizationLimit: env.ORGANIZATION_MODE === 'single' ? 1 : 100,
      memberLimit: 1000,
      invitationExpiresIn: 60 * 60 * 48, // 48 hours

      async sendInvitationEmail(data, request) {
        const locale = dictionaryLocaleFromRequest(request);
        const dictionary = await getDictionary(locale);
        const frontendUrl = getFrontendUrl(data.organization.slug);

        const existingUser = await prismaDangerouslyBypassRLS.user.findFirst({
          where: { email: data.email },
          select: { id: true },
        });

        const inviteLink = `${frontendUrl}/auth/invitation?token=${data.id}&email=${encodeURIComponent(data.email)}${existingUser ? '&existingUser=true' : ''}`;

        const isSingleMode = env.ORGANIZATION_MODE === 'single';
        const emailTemplate = isSingleMode
          ? dictionary.emails.invitationEmail.singleOrganization
          : dictionary.emails.invitationEmail.multiOrganization;

        const subject = isSingleMode
          ? dictionaryFormat(emailTemplate.subject, data.organization.name)
          : dictionaryFormat(
              emailTemplate.subject,
              dictionary.projectName,
              data.organization.name,
            );

        const content = isSingleMode
          ? dictionaryFormat(
              emailTemplate.content,
              data.organization.name,
              inviteLink,
            )
          : dictionaryFormat(
              emailTemplate.content,
              dictionary.projectName,
              inviteLink,
              data.organization.name,
            );

        await sendEmail(data.email, null, subject, content, 'HTML');
      },

      organizationHooks: {
        afterCreateOrganization: async ({ organization, member, user }) => {
          await prismaDangerouslyBypassRLS.organization.update({
            where: { id: organization.id },
            data: {
              createdByUserId: user.id,
            },
          });

          await auditLogCreate({
            entityId: organization.id,
            entityName: 'Organization',
            operation: auditLogOperations.create,
            organizationId: organization.id,
            userId: user.id,
            memberId: member.id,
            newData: organization,
          });
        },

        afterUpdateOrganization: async ({ organization, user }) => {
          if (organization) {
            await prismaDangerouslyBypassRLS.organization.update({
              where: { id: organization.id },
              data: {
                updatedByUserId: user.id,
              },
            });

            await auditLogCreate({
              entityId: organization.id,
              entityName: 'Organization',
              operation: auditLogOperations.update,
              organizationId: organization.id,
              userId: user.id,
              newData: organization,
            });

            await invalidateOrganizationAndMembers(organization.id);
          }
        },

        beforeDeleteOrganization: async ({ organization, user }) => {
          await subscriptionCancelOnStripe({
            organizationId: organization.id,
          });

          await auditLogCreate({
            entityId: organization.id,
            entityName: 'Organization',
            operation: auditLogOperations.delete,
            organizationId: organization.id,
            userId: user.id,
            oldData: organization,
          });

          await invalidateOrganizationAndMembers(organization.id);
        },

        beforeAddMember: async ({ user, organization }) => {
          // Prevent disabled members from rejoining
          const disabledMember =
            await prismaDangerouslyBypassRLS.member.findFirst({
              where: {
                userId: user.id,
                organizationId: organization.id,
                disabled: true,
              },
            });

          if (disabledMember) {
            throw new APIError('BAD_REQUEST', {
              message: 'MEMBER_DISABLED_CANNOT_REJOIN',
            });
          }
        },

        afterAddMember: async ({ member, user, organization }) => {
          const updateData: any = {};

          if (member.firstName || member.lastName) {
            updateData.fullName = [member.firstName, member.lastName]
              .filter(Boolean)
              .join(' ');
          }

          updateData.createdByUserId = user.id;

          if (Object.keys(updateData).length > 0) {
            await prismaDangerouslyBypassRLS.member.update({
              where: { id: member.id },
              data: updateData,
            });
          }

          await auditLogCreate({
            entityId: member.id,
            entityName: 'Member',
            operation: auditLogOperations.create,
            organizationId: organization.id,
            userId: user.id,
            memberId: member.id,
            newData: member,
          });

          await invalidateMember(member.userId, organization.id);

          // Send notification to admin members about new member
          await sendNotification({
            organizationId: organization.id,
            roles: ['admin'],
            payload: {
              type: 'memberAdded',
              memberName: user.name || user.email,
              memberEmail: user.email,
              organizationName: '', // Will be populated by worker
            },
            senderUserId: user.id,
            locale: defaultLocale, // Hook doesn't have request context, use default
          });
        },

        beforeRemoveMember: async ({ member, organization }) => {
          // Prevent deleting admin if organization has active subscription
          // (only when SUBSCRIPTION_MODE is 'organization')
          // Note: CANNOT_REMOVE_SELF is checked in controllers with AppContext
          try {
            await memberCanRemoveAdmin(member, organization.id);
          } catch (error: any) {
            if (error.name === 'CANNOT_REMOVE_ADMIN_WITH_SUBSCRIPTION') {
              throw new APIError('BAD_REQUEST', {
                message: 'CANNOT_REMOVE_ADMIN_WITH_SUBSCRIPTION',
              });
            }
            if (error.name === 'CANNOT_REMOVE_SELF') {
              throw new APIError('BAD_REQUEST', {
                message: 'CANNOT_REMOVE_SELF',
              });
            }
            throw error;
          }
        },

        afterRemoveMember: async ({ member, user, organization }) => {
          await auditLogCreate({
            entityId: member.id,
            entityName: 'Member',
            operation: auditLogOperations.delete,
            organizationId: organization.id,
            userId: user.id,
            memberId: member.id,
            oldData: member,
          });

          await invalidateMember(member.userId, organization.id);

          await subscriptionCancelOnStripe({
            organizationId: organization.id,
            userId: member.userId,
          });
        },

        afterCreateInvitation: async ({
          invitation,
          inviter,
          organization,
        }) => {
          const inviterMember =
            await prismaDangerouslyBypassRLS.member.findFirstOrThrow({
              where: {
                organizationId: organization.id,
                userId: inviter.id,
              },
            });

          await auditLogCreate({
            entityId: invitation.id,
            entityName: 'Invitation',
            operation: auditLogOperations.create,
            organizationId: organization.id,
            userId: inviter.userId,
            memberId: inviterMember.id,
            newData: invitation,
          });
        },

        beforeAcceptInvitation: async ({ invitation, user }) => {
          if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
            throw new APIError('BAD_REQUEST', {
              code: 'INVITATION_EMAIL_MISMATCH',
            });
          }

          if (new Date() > new Date(invitation.expiresAt)) {
            throw new APIError('BAD_REQUEST', {
              code: 'INVITATION_EXPIRED',
            });
          }

          if (invitation.status !== 'pending') {
            throw new APIError('BAD_REQUEST', {
              code: 'INVITATION_NOT_PENDING',
            });
          }
        },

        afterAcceptInvitation: async ({
          invitation,
          member,
          user,
          organization,
        }) => {
          await auditLogCreate({
            entityId: invitation.id,
            entityName: 'Invitation',
            operation: auditLogOperations.update,
            organizationId: organization.id,
            userId: user.id,
            memberId: member.id,
            oldData: { ...invitation, status: 'pending' },
            newData: { ...invitation, status: 'accepted' },
          });
        },

        afterRejectInvitation: async ({ invitation, user, organization }) => {
          await auditLogCreate({
            entityId: invitation.id,
            entityName: 'Invitation',
            operation: auditLogOperations.update,
            organizationId: organization.id,
            userId: user.id,
            oldData: { ...invitation, status: 'pending' },
            newData: { ...invitation, status: 'rejected' },
          });
        },

        afterCancelInvitation: async ({
          invitation,
          cancelledBy,
          organization,
        }) => {
          const cancelledByMember =
            await prismaDangerouslyBypassRLS.member.findFirstOrThrow({
              where: {
                organizationId: organization.id,
                userId: cancelledBy.id,
              },
            });

          await auditLogCreate({
            entityId: invitation.id,
            entityName: 'Invitation',
            operation: auditLogOperations.update,
            organizationId: organization.id,
            userId: cancelledBy.id,
            memberId: cancelledByMember.id,
            oldData: { ...invitation, status: 'pending' },
            newData: { ...invitation, status: 'cancelled' },
          });
        },
      },
    }),

    twoFactor({
      issuer: enDictionary.projectName,
      schema: {
        twoFactor: {
          modelName: 'TwoFactor',
        },
      },
      otpOptions: {
        storeOTP: 'encrypted',
        async sendOTP({ user, otp }, ctx) {
          const request = ctx?.request;
          const locale = dictionaryLocaleFromRequest(request);
          const dictionary = await getDictionary(locale);
          const organization = await organizationFromRequest(request);
          const brandName = organization?.name || dictionary.projectName;

          const subject = dictionaryFormat(
            dictionary.emails.twoFactorOtpEmail.subject,
            brandName,
          );
          const content = dictionaryFormat(
            dictionary.emails.twoFactorOtpEmail.content,
            brandName,
            otp,
          );

          await sendEmail(user.email, null, subject, content, 'HTML');
        },
      },
    }),

    apiKey({
      enableSessionForAPIKeys: true,
      enableMetadata: true,
      apiKeyHeaders: ['x-api-key'],
      defaultKeyLength: 64,
      rateLimit: {
        enabled: true,
        timeWindow: 1000 * 60 * 60 * 24,
        maxRequests: 1000,
      },
      keyExpiration: {
        defaultExpiresIn: null,
        minExpiresIn: apiKeyMinExpiresInDays,
        maxExpiresIn: apiKeyMaxExpiresInDays,
      },
      ...(env.REDIS_URL
        ? {
            storage: 'secondary-storage' as const,
            fallbackToDatabase: true,
          }
        : {}),
      schema: {
        apikey: {
          modelName: 'ApiKey',
        },
      },
    }),

    openAPI({
      path: '/reference',
      disableDefaultReference: false,
    }),

    mcp({
      loginPage: `${getFrontendUrl()}/auth/sign-in`,
      oidcConfig: {
        loginPage: `${getFrontendUrl()}/auth/sign-in`,
        allowDynamicClientRegistration: true,
        useJWTPlugin: true,
      },
    }),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: !env.AUTH_BYPASS_EMAIL_VERIFICATION,
    sendResetPassword: async ({ user, token }, request) => {
      const locale = dictionaryLocaleFromRequest(request);
      const dictionary = await getDictionary(locale);
      const organization = await organizationFromRequest(request);
      const frontendUrl = `${getFrontendUrl(organization?.slug)}/auth/password-reset/confirm?token=${token}`;
      const brandName = organization?.name || dictionary.projectName;

      const subject = dictionaryFormat(
        dictionary.emails.passwordResetEmail.subject,
        brandName,
      );
      const content = dictionaryFormat(
        dictionary.emails.passwordResetEmail.content,
        brandName,
        frontendUrl,
      );
      await sendEmail(user.email, null, subject, content, 'HTML');

      await auditLogCreate({
        entityId: user.id,
        entityName: 'User',
        operation: auditLogOperations.passwordResetRequest,
        userId: user.id,
        newData: { email: user.email },
      });
    },
    onPasswordReset: async ({ user }, _request) => {
      await auditLogCreate({
        entityId: user.id,
        entityName: 'User',
        operation: auditLogOperations.passwordResetConfirm,
        userId: user.id,
        newData: { email: user.email },
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, token }, request) => {
      if (user.emailVerified) {
        return;
      }
      const locale = dictionaryLocaleFromRequest(request);
      const dictionary = await getDictionary(locale);
      const organization = await organizationFromRequest(request);
      const brandName = organization?.name || dictionary.projectName;

      const frontendUrl = `${getFrontendUrl(organization?.slug)}/auth/verify-email/confirm?token=${token}`;

      const subject = dictionaryFormat(
        dictionary.emails.verifyEmailEmail.subject,
        brandName,
      );
      const content = dictionaryFormat(
        dictionary.emails.verifyEmailEmail.content,
        brandName,
        frontendUrl,
      );
      await sendEmail(user.email, null, subject, content, 'HTML');
    },
    autoSignInAfterVerification: true,
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async (
        { user, newEmail, token },
        request,
      ) => {
        const locale = dictionaryLocaleFromRequest(request);
        const dictionary = await getDictionary(locale);
        const organization = await organizationFromRequest(request);
        const frontendUrl = `${getFrontendUrl(organization?.slug)}/auth/email-change/confirm?token=${token}&newEmail=${encodeURIComponent(newEmail)}`;
        const brandName = organization?.name || dictionary.projectName;

        const subject = dictionaryFormat(
          dictionary.emails.emailChangeEmail.subject,
          brandName,
        );
        const content = dictionaryFormat(
          dictionary.emails.emailChangeEmail.content,
          brandName,
          frontendUrl,
          newEmail,
        );

        await sendEmail(user.email, null, subject, content, 'HTML');

        await auditLogCreate({
          entityId: user.id,
          entityName: 'User',
          operation: auditLogOperations.emailChangeRequest,
          userId: user.id,
          newData: { newEmail },
        });
      },
    },
  },
  socialProviders: {
    google: {
      clientId: env.AUTH_GOOGLE_ID || '',
      clientSecret: env.AUTH_GOOGLE_SECRET || '',
      enabled: Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET),
    },
  },
  secret: env.AUTH_SECRET || '',
  baseURL: env.BACKEND_URL || 'http://localhost:3011',
  trustedOrigins,

  databaseHooks: {
    session: {
      create: {
        before: async (session: any) => {
          // If it's multi-domain mode, do not auto-select organization,
          // it will pick from the domain
          if (env.ORGANIZATION_MODE === 'multi-domain') {
            return { data: session };
          }

          // Auto-select organization when user has exactly one membership
          let member = await authAutoSelectOrganization({
            userId: session.userId,
            prisma: prismaDangerouslyBypassRLS,
          });

          // Auto-create org for new users in single-org mode
          if (!member) {
            const user =
              await prismaDangerouslyBypassRLS.user.findUniqueOrThrow({
                where: { id: session.userId },
                select: { id: true, email: true },
              });

            const result = await authSingleOrganizationSetup({
              user,
              auth: authBackend,
              prisma: prismaDangerouslyBypassRLS,
            });

            if (result) {
              member = result;
            }
          }

          // Set activeOrganizationId on the session before it's created
          if (member) {
            return {
              data: {
                ...session,
                activeOrganizationId: member.organizationId,
              },
            };
          }

          return { data: session };
        },
        after: async (session: any) => {
          await auditLogCreate({
            entityId: session.userId,
            entityName: 'User',
            operation: auditLogOperations.signIn,
            userId: session.userId,
            organizationId: session.activeOrganizationId ?? null,
            memberId: await resolveAuditMemberId(
              session.userId,
              session.activeOrganizationId,
            ),
            newData: { sessionId: session.id },
          });
        },
      },
      delete: {
        after: async (session: any) => {
          await auditLogCreate({
            entityId: session.userId,
            entityName: 'User',
            operation: auditLogOperations.signOut,
            userId: session.userId,
            organizationId: session.activeOrganizationId ?? null,
            memberId: await resolveAuditMemberId(
              session.userId,
              session.activeOrganizationId,
            ),
            oldData: { sessionId: session.id },
          });
        },
      },
    },
    user: {
      create: {
        before: async (user: any, ctx: any) => {
          const invitationToken = ctx?.headers?.get?.('x-invitation-token');

          if (!invitationToken) {
            return { data: user };
          }

          try {
            const invitation =
              await prismaDangerouslyBypassRLS.invitation.findUnique({
                where: { id: invitationToken },
                select: { email: true, status: true, expiresAt: true },
              });

            if (
              invitation &&
              invitationComputeStatus(invitation) ===
                InvitationStatus.pending &&
              invitation.email.toLowerCase() === user.email.toLowerCase()
            ) {
              return { data: { ...user, emailVerified: true } };
            }
          } catch (err) {
            console.error(
              'Failed to validate invitation token during signup',
              err,
            );
          }

          return { data: user };
        },
        after: async (user: any) => {
          await auditLogCreate({
            entityId: user.id,
            entityName: 'User',
            operation: auditLogOperations.signUp,
            userId: user.id,
            newData: { email: user.email },
          });
        },
      },
      update: {
        after: async (user: any, oldUser: any) => {
          if (user.email !== oldUser.email) {
            await auditLogCreate({
              entityId: user.id,
              entityName: 'User',
              operation: auditLogOperations.emailChangeConfirm,
              userId: user.id,
              oldData: { email: oldUser.email },
              newData: { email: user.email },
            });
          }
        },
      },
    },
    verification: {
      update: {
        after: async (verification: any) => {
          if (verification.value) {
            await auditLogCreate({
              entityId: verification.identifier,
              entityName: 'User',
              operation: auditLogOperations.verifyEmailConfirm,
              userId: verification.identifier,
              newData: { verified: true, value: verification.value },
            });
          }
        },
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (!orgTwoFactorBlockedPaths.includes(ctx.path)) {
        return;
      }

      // getSession's path is outside the blocklist, so no recursion
      const session = await authBackend.api.getSession({
        headers: ctx.headers ?? new Headers(),
      });

      if (!session?.user || (session.user as any).twoFactorEnabled) {
        return;
      }

      // Resolve the TARGET organization the way Better Auth's own handlers do:
      // an explicit organizationId/organizationSlug in the request body or
      // query overrides the session's active org. Without this, a user whose
      // active org does not enforce 2FA could act on an enforcing org by
      // passing its id/slug directly, and a user with no active org would
      // slip through entirely.
      const body = (ctx.body ?? {}) as {
        organizationId?: string;
        organizationSlug?: string;
      };
      const query = (ctx.query ?? {}) as {
        organizationId?: string;
        organizationSlug?: string;
      };
      const organizationSlug = query.organizationSlug || body.organizationSlug;
      const organizationId =
        query.organizationId ||
        body.organizationId ||
        ((session.session as any)?.activeOrganizationId as string | undefined);

      const organization =
        organizationSlug || organizationId
          ? await prismaDangerouslyBypassRLS.organization.findFirst({
              where: organizationSlug
                ? { slug: organizationSlug }
                : { id: organizationId },
              select: { require2fa: true },
            })
          : null;

      // Fail closed: these endpoints all act on a specific existing org, so if
      // the target can't be resolved we block rather than risk a bypass.
      if (!organization || organization.require2fa) {
        throw new APIError('FORBIDDEN', {
          message: ORGANIZATION_REQUIRES_TWO_FACTOR,
        });
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      const isAuthPath =
        ctx.path === '/sign-in/email' || ctx.path.startsWith('/callback');
      const returned = ctx.context.returned;

      if (isAuthPath && returned instanceof APIError) {
        const email = ctx.body?.email as string | undefined;
        await auditLogCreate({
          entityId: '00000000-0000-0000-0000-000000000000',
          entityName: 'User',
          operation: auditLogOperations.signInFailed,
          newData: {
            email,
            error: returned.message,
            statusCode: returned.status,
            path: ctx.path,
            ipAddress:
              ctx.headers?.get('x-forwarded-for') ||
              ctx.headers?.get('x-real-ip'),
            userAgent: ctx.headers?.get('user-agent'),
          },
        });
      }

      const twoFactorAuditOperation =
        twoFactorAuditOperations[
          ctx.path as keyof typeof twoFactorAuditOperations
        ];
      if (twoFactorAuditOperation && !(returned instanceof APIError)) {
        const session: any = ctx.context.session ?? ctx.context.newSession;
        if (session?.user?.id) {
          await auditLogCreate({
            entityId: session.user.id,
            entityName: 'User',
            operation: twoFactorAuditOperation,
            userId: session.user.id,
            organizationId: session.session?.activeOrganizationId ?? null,
            memberId: await resolveAuditMemberId(
              session.user.id,
              session.session?.activeOrganizationId,
            ),
            newData: { path: ctx.path },
          });
        }
      }
    }),
  },

  advanced: {
    cookiePrefix: 'project',
    database: {
      // Let database generate UUIDs instead of Better Auth generating IDs
      generateId: false,
    },
  },
});
