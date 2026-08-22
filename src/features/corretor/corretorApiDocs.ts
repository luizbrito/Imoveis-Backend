import { buildPaths } from '../../shared/openapi/routeToPath';
import { corretorAutocompleteApiDoc } from './controllers/corretorAutocompleteController';
import { corretorCreateApiDoc } from './controllers/corretorCreateController';
import { corretorDeleteManyApiDoc } from './controllers/corretorDeleteManyController';
import { corretorFindApiDoc } from './controllers/corretorFindController';
import { corretorFindManyApiDoc } from './controllers/corretorFindManyController';
import { corretorImportApiDoc } from './controllers/corretorImporterController';
import { corretorUpdateApiDoc } from './controllers/corretorUpdateController';
import { corretorArchiveManyApiDoc } from './controllers/corretorArchiveManyController';
import { corretorRestoreManyApiDoc } from './controllers/corretorRestoreManyController';

export function getCorretorPaths() {
  return buildPaths('Corretor', [
    corretorAutocompleteApiDoc,
    corretorCreateApiDoc,
    corretorArchiveManyApiDoc,
    corretorRestoreManyApiDoc,
    corretorDeleteManyApiDoc,
    corretorFindApiDoc,
    corretorFindManyApiDoc,
    corretorUpdateApiDoc,
    corretorImportApiDoc,
  ]);
}
