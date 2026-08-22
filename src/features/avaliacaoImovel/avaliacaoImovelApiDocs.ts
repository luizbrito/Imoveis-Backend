import { buildPaths } from '../../shared/openapi/routeToPath';
import { avaliacaoImovelAutocompleteApiDoc } from './controllers/avaliacaoImovelAutocompleteController';
import { avaliacaoImovelCreateApiDoc } from './controllers/avaliacaoImovelCreateController';
import { avaliacaoImovelDeleteManyApiDoc } from './controllers/avaliacaoImovelDeleteManyController';
import { avaliacaoImovelFindApiDoc } from './controllers/avaliacaoImovelFindController';
import { avaliacaoImovelFindManyApiDoc } from './controllers/avaliacaoImovelFindManyController';
import { avaliacaoImovelImportApiDoc } from './controllers/avaliacaoImovelImporterController';
import { avaliacaoImovelUpdateApiDoc } from './controllers/avaliacaoImovelUpdateController';
import { avaliacaoImovelArchiveManyApiDoc } from './controllers/avaliacaoImovelArchiveManyController';
import { avaliacaoImovelRestoreManyApiDoc } from './controllers/avaliacaoImovelRestoreManyController';

export function getAvaliacaoImovelPaths() {
  return buildPaths('AvaliacaoImovel', [
    avaliacaoImovelAutocompleteApiDoc,
    avaliacaoImovelCreateApiDoc,
    avaliacaoImovelArchiveManyApiDoc,
    avaliacaoImovelRestoreManyApiDoc,
    avaliacaoImovelDeleteManyApiDoc,
    avaliacaoImovelFindApiDoc,
    avaliacaoImovelFindManyApiDoc,
    avaliacaoImovelUpdateApiDoc,
    avaliacaoImovelImportApiDoc,
  ]);
}
