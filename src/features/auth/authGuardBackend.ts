import { Role } from 'better-auth/plugins/access';
import { AppContext } from '../../shared/controller/appContext';
import { Error403 } from '../../shared/errors/Error403';
import { roles, rolesIds, type PartialPermissions } from '../permissions';
import { authBackend } from './authBackend';

/**
 * Backend authorization guard with multi-layer permission checks
 *
 * Security model:
 * 1. User must be authenticated and belong to an organization
 * 2. Member must not be disabled
 * 3. If API key authentication: verify key has required permissions
 * 4. Local role check using Better Auth's role-based permissions
 * 5. Server-side session validation through Better Auth API (when not MCP)
 *
 * This dual-validation approach (local + remote) ensures:
 * - Fast local permission checks for performance
 * - Server-side validation prevents permission bypass through stale tokens
 * - MCP requests skip session validation (they use JWT-based auth)
 */
export async function authGuardBackend(
  permissions: PartialPermissions,
  context: AppContext,
) {
  // Defense-in-depth: verify all authentication components exist
  // Prevents null reference errors and enforces complete auth context
  if (!context.currentUser) {
    throw new Error403();
  }

  if (!context.currentOrganization) {
    throw new Error403();
  }

  if (!context.currentMember) {
    throw new Error403();
  }

  // Disabled members retain database records but lose all access
  // Allows re-enabling without losing data or relationships
  if (context.currentMember.disabled) {
    throw new Error403();
  }

  // API keys can have optional permission scopes for principle of least privilege
  // e.g., a read-only API key for external integrations
  if (context.apiKey && context.apiKey.permissions) {
    const result = await authBackend.api.verifyApiKey({
      body: {
        key: context.headers.get('x-api-key')!,
        permissions,
      },
      headers: context.headers,
    });

    if (!result.valid) {
      throw new Error403();
    }
  }

  // Map member role to Better Auth role object for authorization
  // Roles defined in permissions.ts: owner, admin, manager, employee, guest
  const role: Role = roles[context.currentMember.role as keyof typeof rolesIds];

  if (!role) {
    throw new Error403();
  }

  // Local role-based permission check using Better Auth's RBAC
  // Fast, synchronous validation against static role definitions
  const result = role.authorize(permissions as any);
  if (!result.success) {
    throw new Error403();
  }

  // MCP requests use JWT-based auth without sessions, skip session validation
  // Session-based requests need additional server-side verification to catch:
  // - Session revocations, role changes, or member disabling since token issued
  const hasSession = !context.isMcpRequest;
  if (hasSession) {
    const result = await authBackend.api.hasPermission({
      headers: context.headers,
      body: {
        permissions: permissions as any,
        organizationId: context.currentOrganization.id,
      },
    });

    if (!result || (result as any).error) {
      throw new Error403();
    }
  }

  return {
    currentOrganization: context.currentOrganization,
    currentUser: context.currentUser,
    currentMember: context.currentMember,
  };
}
