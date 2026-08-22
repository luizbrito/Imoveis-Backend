import {
  ApiKey,
  Organization,
  Subscription,
} from '../../prisma/generated/client';
import { Context } from 'hono';
import {
  authMiddlewareForApiKey,
  authMiddlewareForMcp,
  authMiddlewareForSession,
} from '../../features/auth/authMiddleware';
import { authTwoFactorEnforcement } from '../../features/auth/authTwoFactorEnforcement';
import { MemberWithRelationships } from '../../features/member/memberSchemas';
import { UserWithMembers } from '../../features/user/userSchemas';
import { dictionaryMiddleware } from '../../translation/dictionaryMiddleware';
import { Dictionary, Locale } from '../../translation/locales';
import { dictionaryValidateLocale } from '../../translation/dictionaryValidateLocale';

export interface AppAuthContextOptional {
  currentUser?: UserWithMembers | null;
  currentMember?: MemberWithRelationships | null;
  currentOrganization?: Organization | null;
  currentSubscription?: Subscription | null;
  apiKey?: ApiKey | null;
}

export interface AppContext extends AppAuthContextOptional {
  locale: Locale;
  dictionary: Dictionary;
  headers: Headers;
  isMcpRequest?: boolean;
}

export interface AppAuthContext extends AppAuthContextOptional {
  currentUser: UserWithMembers;
  currentMember: MemberWithRelationships;
  currentOrganization: Organization;
}

// Enable JSON serialization of BigInt values
// Without this, JSON.stringify throws when encountering BigInt types
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function appContextForMcp(
  userId: string,
  organizationId: string,
  language: string,
  c: Context,
) {
  const actualLocale = dictionaryValidateLocale(language);
  let context = await dictionaryMiddleware(actualLocale, {});
  context = await authMiddlewareForMcp(userId, organizationId, c, context);
  // MCP tools act with the human user's delegated OAuth identity (not a machine
  // API key), so the organization's 2FA hard-block applies exactly as it does
  // to the REST chokepoint in appContext() below.
  authTwoFactorEnforcement(context);
  return context;
}

export async function appContext(
  c: Context,
  options?: { skipTwoFactorEnforcement?: boolean },
) {
  const headerLocale = c.req.header('Accept-Language')?.split(',')[0];
  const actualLocale = dictionaryValidateLocale(headerLocale);
  let context = await dictionaryMiddleware(actualLocale, {});
  context.headers = c.req.raw.headers;
  const apiKeyHeader = context.headers.get('x-api-key');

  if (apiKeyHeader) {
    context = await authMiddlewareForApiKey(apiKeyHeader, context);
  } else {
    context = await authMiddlewareForSession(c, context);
  }

  if (!options?.skipTwoFactorEnforcement) {
    authTwoFactorEnforcement(context);
  }

  return context;
}
