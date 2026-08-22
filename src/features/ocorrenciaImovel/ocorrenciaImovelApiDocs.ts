import { buildPaths } from '../../shared/openapi/routeToPath';
import { ocorrenciaImovelAutocompleteApiDoc } from './controllers/ocorrenciaImovelAutocompleteController';
import { ocorrenciaImovelCreateApiDoc } from './controllers/ocorrenciaImovelCreateController';
import { ocorrenciaImovelDeleteManyApiDoc } from './controllers/ocorrenciaImovelDeleteManyController';
import { ocorrenciaImovelFindApiDoc } from './controllers/ocorrenciaImovelFindController';
import { ocorrenciaImovelFindManyApiDoc } from './controllers/ocorrenciaImovelFindManyController';
import { ocorrenciaImovelImportApiDoc } from './controllers/ocorrenciaImovelImporterController';
import { ocorrenciaImovelUpdateApiDoc } from './controllers/ocorrenciaImovelUpdateController';
import { ocorrenciaImovelArchiveManyApiDoc } from './controllers/ocorrenciaImovelArchiveManyController';
import { ocorrenciaImovelRestoreManyApiDoc } from './controllers/ocorrenciaImovelRestoreManyController';

export function getOcorrenciaImovelPaths() {
  return buildPaths('OcorrenciaImovel', [
    ocorrenciaImovelAutocompleteApiDoc,
    ocorrenciaImovelCreateApiDoc,
    ocorrenciaImovelArchiveManyApiDoc,
    ocorrenciaImovelRestoreManyApiDoc,
    ocorrenciaImovelDeleteManyApiDoc,
    ocorrenciaImovelFindApiDoc,
    ocorrenciaImovelFindManyApiDoc,
    ocorrenciaImovelUpdateApiDoc,
    ocorrenciaImovelImportApiDoc,
  ]);
}
