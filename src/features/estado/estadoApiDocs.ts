import { buildPaths } from '../../shared/openapi/routeToPath';
import { estadoAutocompleteApiDoc } from './controllers/estadoAutocompleteController';
import { estadoCreateApiDoc } from './controllers/estadoCreateController';
import { estadoDeleteManyApiDoc } from './controllers/estadoDeleteManyController';
import { estadoFindApiDoc } from './controllers/estadoFindController';
import { estadoFindManyApiDoc } from './controllers/estadoFindManyController';
import { estadoImportApiDoc } from './controllers/estadoImporterController';
import { estadoUpdateApiDoc } from './controllers/estadoUpdateController';
import { estadoArchiveManyApiDoc } from './controllers/estadoArchiveManyController';
import { estadoRestoreManyApiDoc } from './controllers/estadoRestoreManyController';

export function getEstadoPaths() {
  return buildPaths('Estado', [
    estadoAutocompleteApiDoc,
    estadoCreateApiDoc,
    estadoArchiveManyApiDoc,
    estadoRestoreManyApiDoc,
    estadoDeleteManyApiDoc,
    estadoFindApiDoc,
    estadoFindManyApiDoc,
    estadoUpdateApiDoc,
    estadoImportApiDoc,
  ]);
}
