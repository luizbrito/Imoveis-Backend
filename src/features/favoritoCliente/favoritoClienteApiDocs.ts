import { buildPaths } from '../../shared/openapi/routeToPath';
import { favoritoClienteAutocompleteApiDoc } from './controllers/favoritoClienteAutocompleteController';
import { favoritoClienteCreateApiDoc } from './controllers/favoritoClienteCreateController';
import { favoritoClienteDeleteManyApiDoc } from './controllers/favoritoClienteDeleteManyController';
import { favoritoClienteFindApiDoc } from './controllers/favoritoClienteFindController';
import { favoritoClienteFindManyApiDoc } from './controllers/favoritoClienteFindManyController';
import { favoritoClienteImportApiDoc } from './controllers/favoritoClienteImporterController';
import { favoritoClienteUpdateApiDoc } from './controllers/favoritoClienteUpdateController';
import { favoritoClienteArchiveManyApiDoc } from './controllers/favoritoClienteArchiveManyController';
import { favoritoClienteRestoreManyApiDoc } from './controllers/favoritoClienteRestoreManyController';

export function getFavoritoClientePaths() {
  return buildPaths('FavoritoCliente', [
    favoritoClienteAutocompleteApiDoc,
    favoritoClienteCreateApiDoc,
    favoritoClienteArchiveManyApiDoc,
    favoritoClienteRestoreManyApiDoc,
    favoritoClienteDeleteManyApiDoc,
    favoritoClienteFindApiDoc,
    favoritoClienteFindManyApiDoc,
    favoritoClienteUpdateApiDoc,
    favoritoClienteImportApiDoc,
  ]);
}
