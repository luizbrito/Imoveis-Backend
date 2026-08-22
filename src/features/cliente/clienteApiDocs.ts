import { buildPaths } from '../../shared/openapi/routeToPath';
import { clienteAutocompleteApiDoc } from './controllers/clienteAutocompleteController';
import { clienteCreateApiDoc } from './controllers/clienteCreateController';
import { clienteDeleteManyApiDoc } from './controllers/clienteDeleteManyController';
import { clienteFindApiDoc } from './controllers/clienteFindController';
import { clienteFindManyApiDoc } from './controllers/clienteFindManyController';
import { clienteImportApiDoc } from './controllers/clienteImporterController';
import { clienteUpdateApiDoc } from './controllers/clienteUpdateController';
import { clienteArchiveManyApiDoc } from './controllers/clienteArchiveManyController';
import { clienteRestoreManyApiDoc } from './controllers/clienteRestoreManyController';

export function getClientePaths() {
  return buildPaths('Cliente', [
    clienteAutocompleteApiDoc,
    clienteCreateApiDoc,
    clienteArchiveManyApiDoc,
    clienteRestoreManyApiDoc,
    clienteDeleteManyApiDoc,
    clienteFindApiDoc,
    clienteFindManyApiDoc,
    clienteUpdateApiDoc,
    clienteImportApiDoc,
  ]);
}
