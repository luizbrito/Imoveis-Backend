import { buildPaths } from '../../shared/openapi/routeToPath';
import { garantiaLocacaoAutocompleteApiDoc } from './controllers/garantiaLocacaoAutocompleteController';
import { garantiaLocacaoCreateApiDoc } from './controllers/garantiaLocacaoCreateController';
import { garantiaLocacaoDeleteManyApiDoc } from './controllers/garantiaLocacaoDeleteManyController';
import { garantiaLocacaoFindApiDoc } from './controllers/garantiaLocacaoFindController';
import { garantiaLocacaoFindManyApiDoc } from './controllers/garantiaLocacaoFindManyController';
import { garantiaLocacaoImportApiDoc } from './controllers/garantiaLocacaoImporterController';
import { garantiaLocacaoUpdateApiDoc } from './controllers/garantiaLocacaoUpdateController';
import { garantiaLocacaoArchiveManyApiDoc } from './controllers/garantiaLocacaoArchiveManyController';
import { garantiaLocacaoRestoreManyApiDoc } from './controllers/garantiaLocacaoRestoreManyController';

export function getGarantiaLocacaoPaths() {
  return buildPaths('GarantiaLocacao', [
    garantiaLocacaoAutocompleteApiDoc,
    garantiaLocacaoCreateApiDoc,
    garantiaLocacaoArchiveManyApiDoc,
    garantiaLocacaoRestoreManyApiDoc,
    garantiaLocacaoDeleteManyApiDoc,
    garantiaLocacaoFindApiDoc,
    garantiaLocacaoFindManyApiDoc,
    garantiaLocacaoUpdateApiDoc,
    garantiaLocacaoImportApiDoc,
  ]);
}
