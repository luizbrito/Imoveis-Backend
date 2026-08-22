import { buildPaths } from '../../shared/openapi/routeToPath';
import { userMeApiDoc } from './controllers/userMeController';

export function getUserPaths() {
  return buildPaths('User', [userMeApiDoc]);
}
