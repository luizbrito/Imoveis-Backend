import { buildPaths } from '../../shared/openapi/routeToPath';
import { contratoLocacaoAutocompleteApiDoc } from './controllers/contratoLocacaoAutocompleteController';
import { contratoLocacaoCreateApiDoc } from './controllers/contratoLocacaoCreateController';
import { contratoLocacaoDeleteManyApiDoc } from './controllers/contratoLocacaoDeleteManyController';
import { contratoLocacaoFindApiDoc } from './controllers/contratoLocacaoFindController';
import { contratoLocacaoFindManyApiDoc } from './controllers/contratoLocacaoFindManyController';
import { contratoLocacaoImportApiDoc } from './controllers/contratoLocacaoImporterController';
import { contratoLocacaoUpdateApiDoc } from './controllers/contratoLocacaoUpdateController';
import { contratoLocacaoArchiveManyApiDoc } from './controllers/contratoLocacaoArchiveManyController';
import { contratoLocacaoRestoreManyApiDoc } from './controllers/contratoLocacaoRestoreManyController';

export function getContratoLocacaoPaths() {
  return buildPaths('ContratoLocacao', [
    contratoLocacaoAutocompleteApiDoc,
    contratoLocacaoCreateApiDoc,
    contratoLocacaoArchiveManyApiDoc,
    contratoLocacaoRestoreManyApiDoc,
    contratoLocacaoDeleteManyApiDoc,
    contratoLocacaoFindApiDoc,
    contratoLocacaoFindManyApiDoc,
    contratoLocacaoUpdateApiDoc,
    contratoLocacaoImportApiDoc,
  ]);
}
