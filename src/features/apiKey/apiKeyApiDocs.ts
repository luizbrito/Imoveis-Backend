import { buildPaths } from '../../shared/openapi/routeToPath';
import { apiKeyCreateApiDoc } from './controllers/apiKeyCreateController';
import { apiKeyDeleteApiDoc } from './controllers/apiKeyDeleteController';
import { apiKeyFindApiDoc } from './controllers/apiKeyFindController';
import { apiKeyListApiDoc } from './controllers/apiKeyListController';
import { apiKeyUpdateApiDoc } from './controllers/apiKeyUpdateController';

export function getApiKeyPaths() {
  return buildPaths('ApiKey', [
    apiKeyListApiDoc,
    apiKeyFindApiDoc,
    apiKeyCreateApiDoc,
    apiKeyUpdateApiDoc,
    apiKeyDeleteApiDoc,
  ]);
}
