import { buildPaths } from '../../shared/openapi/routeToPath';
import { repasseProprietarioAutocompleteApiDoc } from './controllers/repasseProprietarioAutocompleteController';
import { repasseProprietarioCreateApiDoc } from './controllers/repasseProprietarioCreateController';
import { repasseProprietarioDeleteManyApiDoc } from './controllers/repasseProprietarioDeleteManyController';
import { repasseProprietarioFindApiDoc } from './controllers/repasseProprietarioFindController';
import { repasseProprietarioFindManyApiDoc } from './controllers/repasseProprietarioFindManyController';
import { repasseProprietarioImportApiDoc } from './controllers/repasseProprietarioImporterController';
import { repasseProprietarioUpdateApiDoc } from './controllers/repasseProprietarioUpdateController';
import { repasseProprietarioArchiveManyApiDoc } from './controllers/repasseProprietarioArchiveManyController';
import { repasseProprietarioRestoreManyApiDoc } from './controllers/repasseProprietarioRestoreManyController';

export function getRepasseProprietarioPaths() {
  return buildPaths('RepasseProprietario', [
    repasseProprietarioAutocompleteApiDoc,
    repasseProprietarioCreateApiDoc,
    repasseProprietarioArchiveManyApiDoc,
    repasseProprietarioRestoreManyApiDoc,
    repasseProprietarioDeleteManyApiDoc,
    repasseProprietarioFindApiDoc,
    repasseProprietarioFindManyApiDoc,
    repasseProprietarioUpdateApiDoc,
    repasseProprietarioImportApiDoc,
  ]);
}
