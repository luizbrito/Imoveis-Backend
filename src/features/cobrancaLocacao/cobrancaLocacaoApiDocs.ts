import { buildPaths } from '../../shared/openapi/routeToPath';
import { cobrancaLocacaoAutocompleteApiDoc } from './controllers/cobrancaLocacaoAutocompleteController';
import { cobrancaLocacaoCreateApiDoc } from './controllers/cobrancaLocacaoCreateController';
import { cobrancaLocacaoDeleteManyApiDoc } from './controllers/cobrancaLocacaoDeleteManyController';
import { cobrancaLocacaoFindApiDoc } from './controllers/cobrancaLocacaoFindController';
import { cobrancaLocacaoFindManyApiDoc } from './controllers/cobrancaLocacaoFindManyController';
import { cobrancaLocacaoImportApiDoc } from './controllers/cobrancaLocacaoImporterController';
import { cobrancaLocacaoUpdateApiDoc } from './controllers/cobrancaLocacaoUpdateController';
import { cobrancaLocacaoArchiveManyApiDoc } from './controllers/cobrancaLocacaoArchiveManyController';
import { cobrancaLocacaoRestoreManyApiDoc } from './controllers/cobrancaLocacaoRestoreManyController';

export function getCobrancaLocacaoPaths() {
  return buildPaths('CobrancaLocacao', [
    cobrancaLocacaoAutocompleteApiDoc,
    cobrancaLocacaoCreateApiDoc,
    cobrancaLocacaoArchiveManyApiDoc,
    cobrancaLocacaoRestoreManyApiDoc,
    cobrancaLocacaoDeleteManyApiDoc,
    cobrancaLocacaoFindApiDoc,
    cobrancaLocacaoFindManyApiDoc,
    cobrancaLocacaoUpdateApiDoc,
    cobrancaLocacaoImportApiDoc,
  ]);
}
