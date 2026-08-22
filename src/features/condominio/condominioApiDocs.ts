import { buildPaths } from '../../shared/openapi/routeToPath';
import { condominioAutocompleteApiDoc } from './controllers/condominioAutocompleteController';
import { condominioCreateApiDoc } from './controllers/condominioCreateController';
import { condominioDeleteManyApiDoc } from './controllers/condominioDeleteManyController';
import { condominioFindApiDoc } from './controllers/condominioFindController';
import { condominioFindManyApiDoc } from './controllers/condominioFindManyController';
import { condominioImportApiDoc } from './controllers/condominioImporterController';
import { condominioUpdateApiDoc } from './controllers/condominioUpdateController';
import { condominioArchiveManyApiDoc } from './controllers/condominioArchiveManyController';
import { condominioRestoreManyApiDoc } from './controllers/condominioRestoreManyController';

export function getCondominioPaths() {
  return buildPaths('Condominio', [
    condominioAutocompleteApiDoc,
    condominioCreateApiDoc,
    condominioArchiveManyApiDoc,
    condominioRestoreManyApiDoc,
    condominioDeleteManyApiDoc,
    condominioFindApiDoc,
    condominioFindManyApiDoc,
    condominioUpdateApiDoc,
    condominioImportApiDoc,
  ]);
}
