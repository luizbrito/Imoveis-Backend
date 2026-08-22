export const apiKeyMinExpiresInDays = 1;
export const apiKeyMaxExpiresInDays = 365;

// Client-contract 403 code: the frontend routes users hitting this to the
// forced 2FA setup page instead of signing them out. Kept in this leaf module
// (no server/appContext imports) so every layer — enforcement, the Better Auth
// before-hook, the API error serializer, and the frontend apiClient — can
// import the single source of truth without creating an import cycle.
export const ORGANIZATION_REQUIRES_TWO_FACTOR =
  'ORGANIZATION_REQUIRES_TWO_FACTOR';
