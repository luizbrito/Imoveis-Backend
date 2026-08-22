import { buildPaths } from '../../shared/openapi/routeToPath';
import { documentacaoRuralBrasilAutocompleteApiDoc } from './controllers/documentacaoRuralBrasilAutocompleteController';
import { documentacaoRuralBrasilCreateApiDoc } from './controllers/documentacaoRuralBrasilCreateController';
import { documentacaoRuralBrasilDeleteManyApiDoc } from './controllers/documentacaoRuralBrasilDeleteManyController';
import { documentacaoRuralBrasilFindApiDoc } from './controllers/documentacaoRuralBrasilFindController';
import { documentacaoRuralBrasilFindManyApiDoc } from './controllers/documentacaoRuralBrasilFindManyController';
import { documentacaoRuralBrasilImportApiDoc } from './controllers/documentacaoRuralBrasilImporterController';
import { documentacaoRuralBrasilUpdateApiDoc } from './controllers/documentacaoRuralBrasilUpdateController';
import { documentacaoRuralBrasilArchiveManyApiDoc } from './controllers/documentacaoRuralBrasilArchiveManyController';
import { documentacaoRuralBrasilRestoreManyApiDoc } from './controllers/documentacaoRuralBrasilRestoreManyController';

export function getDocumentacaoRuralBrasilPaths() {
  return buildPaths('DocumentacaoRuralBrasil', [
    documentacaoRuralBrasilAutocompleteApiDoc,
    documentacaoRuralBrasilCreateApiDoc,
    documentacaoRuralBrasilArchiveManyApiDoc,
    documentacaoRuralBrasilRestoreManyApiDoc,
    documentacaoRuralBrasilDeleteManyApiDoc,
    documentacaoRuralBrasilFindApiDoc,
    documentacaoRuralBrasilFindManyApiDoc,
    documentacaoRuralBrasilUpdateApiDoc,
    documentacaoRuralBrasilImportApiDoc,
  ]);
}
