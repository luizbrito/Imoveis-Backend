import { buildPaths } from '../../shared/openapi/routeToPath';
import { solicitacaoManutencaoAutocompleteApiDoc } from './controllers/solicitacaoManutencaoAutocompleteController';
import { solicitacaoManutencaoCreateApiDoc } from './controllers/solicitacaoManutencaoCreateController';
import { solicitacaoManutencaoDeleteManyApiDoc } from './controllers/solicitacaoManutencaoDeleteManyController';
import { solicitacaoManutencaoFindApiDoc } from './controllers/solicitacaoManutencaoFindController';
import { solicitacaoManutencaoFindManyApiDoc } from './controllers/solicitacaoManutencaoFindManyController';
import { solicitacaoManutencaoImportApiDoc } from './controllers/solicitacaoManutencaoImporterController';
import { solicitacaoManutencaoUpdateApiDoc } from './controllers/solicitacaoManutencaoUpdateController';
import { solicitacaoManutencaoArchiveManyApiDoc } from './controllers/solicitacaoManutencaoArchiveManyController';
import { solicitacaoManutencaoRestoreManyApiDoc } from './controllers/solicitacaoManutencaoRestoreManyController';

export function getSolicitacaoManutencaoPaths() {
  return buildPaths('SolicitacaoManutencao', [
    solicitacaoManutencaoAutocompleteApiDoc,
    solicitacaoManutencaoCreateApiDoc,
    solicitacaoManutencaoArchiveManyApiDoc,
    solicitacaoManutencaoRestoreManyApiDoc,
    solicitacaoManutencaoDeleteManyApiDoc,
    solicitacaoManutencaoFindApiDoc,
    solicitacaoManutencaoFindManyApiDoc,
    solicitacaoManutencaoUpdateApiDoc,
    solicitacaoManutencaoImportApiDoc,
  ]);
}
