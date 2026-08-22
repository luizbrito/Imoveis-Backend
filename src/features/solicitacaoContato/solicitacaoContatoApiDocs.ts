import { buildPaths } from '../../shared/openapi/routeToPath';
import { solicitacaoContatoAutocompleteApiDoc } from './controllers/solicitacaoContatoAutocompleteController';
import { solicitacaoContatoCreateApiDoc } from './controllers/solicitacaoContatoCreateController';
import { solicitacaoContatoDeleteManyApiDoc } from './controllers/solicitacaoContatoDeleteManyController';
import { solicitacaoContatoFindApiDoc } from './controllers/solicitacaoContatoFindController';
import { solicitacaoContatoFindManyApiDoc } from './controllers/solicitacaoContatoFindManyController';
import { solicitacaoContatoImportApiDoc } from './controllers/solicitacaoContatoImporterController';
import { solicitacaoContatoUpdateApiDoc } from './controllers/solicitacaoContatoUpdateController';
import { solicitacaoContatoArchiveManyApiDoc } from './controllers/solicitacaoContatoArchiveManyController';
import { solicitacaoContatoRestoreManyApiDoc } from './controllers/solicitacaoContatoRestoreManyController';

export function getSolicitacaoContatoPaths() {
  return buildPaths('SolicitacaoContato', [
    solicitacaoContatoAutocompleteApiDoc,
    solicitacaoContatoCreateApiDoc,
    solicitacaoContatoArchiveManyApiDoc,
    solicitacaoContatoRestoreManyApiDoc,
    solicitacaoContatoDeleteManyApiDoc,
    solicitacaoContatoFindApiDoc,
    solicitacaoContatoFindManyApiDoc,
    solicitacaoContatoUpdateApiDoc,
    solicitacaoContatoImportApiDoc,
  ]);
}
