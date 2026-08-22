import { buildPaths } from '../../shared/openapi/routeToPath';
import { organizationCreateApiDoc } from './controllers/organizationCreateController';
import { organizationDeleteApiDoc } from './controllers/organizationDeleteController';
import { organizationFindApiDoc } from './controllers/organizationFindController';
import { organizationLeaveApiDoc } from './controllers/organizationLeaveController';
import { organizationSetActiveApiDoc } from './controllers/organizationSetActiveController';
import { organizationUpdateApiDoc } from './controllers/organizationUpdateController';

export function getOrganizationPaths() {
  return buildPaths('Organization', [
    organizationCreateApiDoc,
    organizationFindApiDoc,
    organizationUpdateApiDoc,
    organizationDeleteApiDoc,
    organizationSetActiveApiDoc,
    organizationLeaveApiDoc,
  ]);
}
