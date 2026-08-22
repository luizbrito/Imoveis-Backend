import { buildPaths } from '../../shared/openapi/routeToPath';
import { contratoAdministracaoAutocompleteApiDoc } from './controllers/contratoAdministracaoAutocompleteController';
import { contratoAdministracaoCreateApiDoc } from './controllers/contratoAdministracaoCreateController';
import { contratoAdministracaoDeleteManyApiDoc } from './controllers/contratoAdministracaoDeleteManyController';
import { contratoAdministracaoFindApiDoc } from './controllers/contratoAdministracaoFindController';
import { contratoAdministracaoFindManyApiDoc } from './controllers/contratoAdministracaoFindManyController';
import { contratoAdministracaoImportApiDoc } from './controllers/contratoAdministracaoImporterController';
import { contratoAdministracaoUpdateApiDoc } from './controllers/contratoAdministracaoUpdateController';
import { contratoAdministracaoArchiveManyApiDoc } from './controllers/contratoAdministracaoArchiveManyController';
import { contratoAdministracaoRestoreManyApiDoc } from './controllers/contratoAdministracaoRestoreManyController';

export function getContratoAdministracaoPaths() {
  return buildPaths('ContratoAdministracao', [
    contratoAdministracaoAutocompleteApiDoc,
    contratoAdministracaoCreateApiDoc,
    contratoAdministracaoArchiveManyApiDoc,
    contratoAdministracaoRestoreManyApiDoc,
    contratoAdministracaoDeleteManyApiDoc,
    contratoAdministracaoFindApiDoc,
    contratoAdministracaoFindManyApiDoc,
    contratoAdministracaoUpdateApiDoc,
    contratoAdministracaoImportApiDoc,
  ]);
}
