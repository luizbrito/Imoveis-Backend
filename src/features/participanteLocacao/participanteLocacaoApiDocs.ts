import { buildPaths } from '../../shared/openapi/routeToPath';
import { participanteLocacaoAutocompleteApiDoc } from './controllers/participanteLocacaoAutocompleteController';
import { participanteLocacaoCreateApiDoc } from './controllers/participanteLocacaoCreateController';
import { participanteLocacaoDeleteManyApiDoc } from './controllers/participanteLocacaoDeleteManyController';
import { participanteLocacaoFindApiDoc } from './controllers/participanteLocacaoFindController';
import { participanteLocacaoFindManyApiDoc } from './controllers/participanteLocacaoFindManyController';
import { participanteLocacaoImportApiDoc } from './controllers/participanteLocacaoImporterController';
import { participanteLocacaoUpdateApiDoc } from './controllers/participanteLocacaoUpdateController';
import { participanteLocacaoArchiveManyApiDoc } from './controllers/participanteLocacaoArchiveManyController';
import { participanteLocacaoRestoreManyApiDoc } from './controllers/participanteLocacaoRestoreManyController';

export function getParticipanteLocacaoPaths() {
  return buildPaths('ParticipanteLocacao', [
    participanteLocacaoAutocompleteApiDoc,
    participanteLocacaoCreateApiDoc,
    participanteLocacaoArchiveManyApiDoc,
    participanteLocacaoRestoreManyApiDoc,
    participanteLocacaoDeleteManyApiDoc,
    participanteLocacaoFindApiDoc,
    participanteLocacaoFindManyApiDoc,
    participanteLocacaoUpdateApiDoc,
    participanteLocacaoImportApiDoc,
  ]);
}
