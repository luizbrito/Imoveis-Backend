import { buildPaths } from '../../shared/openapi/routeToPath';
import { documentoImovelAutocompleteApiDoc } from './controllers/documentoImovelAutocompleteController';
import { documentoImovelCreateApiDoc } from './controllers/documentoImovelCreateController';
import { documentoImovelDeleteManyApiDoc } from './controllers/documentoImovelDeleteManyController';
import { documentoImovelFindApiDoc } from './controllers/documentoImovelFindController';
import { documentoImovelFindManyApiDoc } from './controllers/documentoImovelFindManyController';
import { documentoImovelImportApiDoc } from './controllers/documentoImovelImporterController';
import { documentoImovelUpdateApiDoc } from './controllers/documentoImovelUpdateController';
import { documentoImovelArchiveManyApiDoc } from './controllers/documentoImovelArchiveManyController';
import { documentoImovelRestoreManyApiDoc } from './controllers/documentoImovelRestoreManyController';

export function getDocumentoImovelPaths() {
  return buildPaths('DocumentoImovel', [
    documentoImovelAutocompleteApiDoc,
    documentoImovelCreateApiDoc,
    documentoImovelArchiveManyApiDoc,
    documentoImovelRestoreManyApiDoc,
    documentoImovelDeleteManyApiDoc,
    documentoImovelFindApiDoc,
    documentoImovelFindManyApiDoc,
    documentoImovelUpdateApiDoc,
    documentoImovelImportApiDoc,
  ]);
}
