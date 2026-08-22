import { buildPaths } from '../../shared/openapi/routeToPath';
import { publicacaoPortalAutocompleteApiDoc } from './controllers/publicacaoPortalAutocompleteController';
import { publicacaoPortalCreateApiDoc } from './controllers/publicacaoPortalCreateController';
import { publicacaoPortalDeleteManyApiDoc } from './controllers/publicacaoPortalDeleteManyController';
import { publicacaoPortalFindApiDoc } from './controllers/publicacaoPortalFindController';
import { publicacaoPortalFindManyApiDoc } from './controllers/publicacaoPortalFindManyController';
import { publicacaoPortalImportApiDoc } from './controllers/publicacaoPortalImporterController';
import { publicacaoPortalUpdateApiDoc } from './controllers/publicacaoPortalUpdateController';
import { publicacaoPortalArchiveManyApiDoc } from './controllers/publicacaoPortalArchiveManyController';
import { publicacaoPortalRestoreManyApiDoc } from './controllers/publicacaoPortalRestoreManyController';

export function getPublicacaoPortalPaths() {
  return buildPaths('PublicacaoPortal', [
    publicacaoPortalAutocompleteApiDoc,
    publicacaoPortalCreateApiDoc,
    publicacaoPortalArchiveManyApiDoc,
    publicacaoPortalRestoreManyApiDoc,
    publicacaoPortalDeleteManyApiDoc,
    publicacaoPortalFindApiDoc,
    publicacaoPortalFindManyApiDoc,
    publicacaoPortalUpdateApiDoc,
    publicacaoPortalImportApiDoc,
  ]);
}
