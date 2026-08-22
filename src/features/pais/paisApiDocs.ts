import { buildPaths } from '../../shared/openapi/routeToPath';
import { paisAutocompleteApiDoc } from './controllers/paisAutocompleteController';
import { paisCreateApiDoc } from './controllers/paisCreateController';
import { paisDeleteManyApiDoc } from './controllers/paisDeleteManyController';
import { paisFindApiDoc } from './controllers/paisFindController';
import { paisFindManyApiDoc } from './controllers/paisFindManyController';
import { paisImportApiDoc } from './controllers/paisImporterController';
import { paisUpdateApiDoc } from './controllers/paisUpdateController';
import { paisArchiveManyApiDoc } from './controllers/paisArchiveManyController';
import { paisRestoreManyApiDoc } from './controllers/paisRestoreManyController';

export function getPaisPaths() {
  return buildPaths('Pais', [
    paisAutocompleteApiDoc,
    paisCreateApiDoc,
    paisArchiveManyApiDoc,
    paisRestoreManyApiDoc,
    paisDeleteManyApiDoc,
    paisFindApiDoc,
    paisFindManyApiDoc,
    paisUpdateApiDoc,
    paisImportApiDoc,
  ]);
}
