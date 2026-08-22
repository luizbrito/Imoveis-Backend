import { vi } from 'vitest';
import type { AppContext } from '../shared/controller/appContext';
import type { User, Organization, Member } from '../prisma/generated/client';
import { dictionary as enDictionary } from '../translation/en/en';
import type { Dictionary } from '../translation/locales';

export function createMockDictionary(): Dictionary {
  return enDictionary;
}

export function createMockContext(
  overrides: Partial<AppContext> = {},
): AppContext {
  return {
    dictionary: createMockDictionary(),
    locale: 'en',
    currentUser: null,
    currentMember: null,
    currentOrganization: null,
    headers: new Headers(),
    ...overrides,
  } as AppContext;
}

/**
 * By default, sets isMcpRequest to true to bypass Better Auth session checks
 */
export function createAuthenticatedContext(
  user: User,
  organization: Organization,
  member: Member,
  overrides: Partial<AppContext> = {},
): AppContext {
  return {
    dictionary: createMockDictionary(),
    locale: 'en',
    currentUser: user as any,
    currentMember: member as any,
    currentOrganization: organization,
    headers: new Headers(),
    isMcpRequest: true,
    ...overrides,
  };
}

export function createMockRequest(
  options: {
    method?: string;
    url?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {},
) {
  const {
    method = 'GET',
    url = 'http://localhost/api/test',
    body,
    headers = {},
  } = options;

  return {
    method,
    url,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
    header: vi.fn((key: string) => headers[key]),
    headers: new Headers(headers),
  };
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createMockFile(
  options: {
    name?: string;
    size?: number;
    type?: string;
    content?: string;
  } = {},
) {
  const {
    name = 'test.txt',
    size = 1024,
    type = 'text/plain',
    content = 'test content',
  } = options;

  return {
    name,
    size,
    type,
    content,
    arrayBuffer: vi.fn().mockResolvedValue(Buffer.from(content)),
    text: vi.fn().mockResolvedValue(content),
  };
}

export function mockStripeCheckoutSession() {
  return {
    id: 'cs_test_' + Math.random().toString(36).substring(7),
    url:
      'https://checkout.stripe.com/test_' +
      Math.random().toString(36).substring(7),
    customer: 'cus_test_' + Math.random().toString(36).substring(7),
    mode: 'subscription' as const,
    status: 'open' as const,
  };
}

export function mockStripePortalSession() {
  return {
    id: 'ps_test_' + Math.random().toString(36).substring(7),
    url:
      'https://billing.stripe.com/session/test_' +
      Math.random().toString(36).substring(7),
  };
}

export function mockStripeWebhookEvent(type: string, data: any) {
  return {
    id: 'evt_test_' + Math.random().toString(36).substring(7),
    type,
    data: {
      object: data,
    },
    created: Math.floor(Date.now() / 1000),
  };
}

export function mockFileUploadCredentials() {
  return {
    url: 'https://storage.example.com/upload',
    fields: {
      key: 'uploads/test-file-' + Math.random().toString(36).substring(7),
      bucket: 'test-bucket',
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': 'test-credentials',
      'X-Amz-Date': new Date().toISOString(),
      Policy: 'base64-encoded-policy',
      'X-Amz-Signature': 'test-signature',
    },
  };
}

export function mockFileDownloadUrl(fileName: string = 'test-file.pdf') {
  return `https://storage.example.com/downloads/${fileName}?signature=test-signature`;
}

export function mockEmailQueueJob() {
  return {
    add: vi.fn().mockResolvedValue({
      id: 'job-' + Math.random().toString(36).substring(7),
      name: 'send-email',
      data: {},
    }),
  };
}

export function mockBetterAuthInvitation() {
  return {
    id: 'inv_' + Math.random().toString(36).substring(7),
    email: `test-${Date.now()}@example.com`,
    token: 'token_' + Math.random().toString(36).substring(7),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'pending' as const,
  };
}
