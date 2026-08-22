import { buildPaths } from '../../shared/openapi/routeToPath';
import { proprietarioAutocompleteApiDoc } from './controllers/proprietarioAutocompleteController';
import { proprietarioCreateApiDoc } from './controllers/proprietarioCreateController';
import { proprietarioDeleteManyApiDoc } from './controllers/proprietarioDeleteManyController';
import { proprietarioFindApiDoc } from './controllers/proprietarioFindController';
import { proprietarioFindManyApiDoc } from './controllers/proprietarioFindManyController';
import { proprietarioImportApiDoc } from './controllers/proprietarioImporterController';
import { proprietarioUpdateApiDoc } from './controllers/proprietarioUpdateController';
import { proprietarioArchiveManyApiDoc } from './controllers/proprietarioArchiveManyController';
import { proprietarioRestoreManyApiDoc } from './controllers/proprietarioRestoreManyController';

export function getProprietarioPaths() {
  return buildPaths('Proprietario', [
    proprietarioAutocompleteApiDoc,
    proprietarioCreateApiDoc,
    proprietarioArchiveManyApiDoc,
    proprietarioRestoreManyApiDoc,
    proprietarioDeleteManyApiDoc,
    proprietarioFindApiDoc,
    proprietarioFindManyApiDoc,
    proprietarioUpdateApiDoc,
    proprietarioImportApiDoc,
  ]);
}
