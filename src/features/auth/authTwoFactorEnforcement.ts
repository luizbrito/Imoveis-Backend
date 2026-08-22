import { Error403 } from '../../shared/errors/Error403';
import { AppContext } from '../../shared/controller/appContext';
import { ORGANIZATION_REQUIRES_TWO_FACTOR } from './authConstants';

export { ORGANIZATION_REQUIRES_TWO_FACTOR };

/**
 * Hard-block enforcement of an organization's 2FA requirement.
 * Applies only to human sessions (API keys are machine credentials);
 * `twoFactorEnabled` is read from the Better Auth session user, which is
 * fresh per request (the member cache would go stale after enabling 2FA).
 */
export function authTwoFactorEnforcement(context: AppContext) {
  if (context.apiKey) {
    return;
  }

  if (!context.currentUser || !context.currentOrganization) {
    return;
  }

  if (
    context.currentOrganization.require2fa &&
    !context.currentUser.twoFactorEnabled
  ) {
    throw new Error403(ORGANIZATION_REQUIRES_TWO_FACTOR);
  }
}
