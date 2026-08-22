import { buildPaths } from '../../shared/openapi/routeToPath';
import { captacaoImovelAutocompleteApiDoc } from './controllers/captacaoImovelAutocompleteController';
import { captacaoImovelCreateApiDoc } from './controllers/captacaoImovelCreateController';
import { captacaoImovelDeleteManyApiDoc } from './controllers/captacaoImovelDeleteManyController';
import { captacaoImovelFindApiDoc } from './controllers/captacaoImovelFindController';
import { captacaoImovelFindManyApiDoc } from './controllers/captacaoImovelFindManyController';
import { captacaoImovelImportApiDoc } from './controllers/captacaoImovelImporterController';
import { captacaoImovelUpdateApiDoc } from './controllers/captacaoImovelUpdateController';
import { captacaoImovelArchiveManyApiDoc } from './controllers/captacaoImovelArchiveManyController';
import { captacaoImovelRestoreManyApiDoc } from './controllers/captacaoImovelRestoreManyController';

export function getCaptacaoImovelPaths() {
  return buildPaths('CaptacaoImovel', [
    captacaoImovelAutocompleteApiDoc,
    captacaoImovelCreateApiDoc,
    captacaoImovelArchiveManyApiDoc,
    captacaoImovelRestoreManyApiDoc,
    captacaoImovelDeleteManyApiDoc,
    captacaoImovelFindApiDoc,
    captacaoImovelFindManyApiDoc,
    captacaoImovelUpdateApiDoc,
    captacaoImovelImportApiDoc,
  ]);
}
