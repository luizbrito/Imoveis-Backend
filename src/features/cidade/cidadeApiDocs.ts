import { buildPaths } from '../../shared/openapi/routeToPath';
import { cidadeAutocompleteApiDoc } from './controllers/cidadeAutocompleteController';
import { cidadeCreateApiDoc } from './controllers/cidadeCreateController';
import { cidadeDeleteManyApiDoc } from './controllers/cidadeDeleteManyController';
import { cidadeFindApiDoc } from './controllers/cidadeFindController';
import { cidadeFindManyApiDoc } from './controllers/cidadeFindManyController';
import { cidadeImportApiDoc } from './controllers/cidadeImporterController';
import { cidadeUpdateApiDoc } from './controllers/cidadeUpdateController';
import { cidadeArchiveManyApiDoc } from './controllers/cidadeArchiveManyController';
import { cidadeRestoreManyApiDoc } from './controllers/cidadeRestoreManyController';

export function getCidadePaths() {
  return buildPaths('Cidade', [
    cidadeAutocompleteApiDoc,
    cidadeCreateApiDoc,
    cidadeArchiveManyApiDoc,
    cidadeRestoreManyApiDoc,
    cidadeDeleteManyApiDoc,
    cidadeFindApiDoc,
    cidadeFindManyApiDoc,
    cidadeUpdateApiDoc,
    cidadeImportApiDoc,
  ]);
}
