import { buildPaths } from '../../shared/openapi/routeToPath';
import { pistaAviacaoRuralAutocompleteApiDoc } from './controllers/pistaAviacaoRuralAutocompleteController';
import { pistaAviacaoRuralCreateApiDoc } from './controllers/pistaAviacaoRuralCreateController';
import { pistaAviacaoRuralDeleteManyApiDoc } from './controllers/pistaAviacaoRuralDeleteManyController';
import { pistaAviacaoRuralFindApiDoc } from './controllers/pistaAviacaoRuralFindController';
import { pistaAviacaoRuralFindManyApiDoc } from './controllers/pistaAviacaoRuralFindManyController';
import { pistaAviacaoRuralImportApiDoc } from './controllers/pistaAviacaoRuralImporterController';
import { pistaAviacaoRuralUpdateApiDoc } from './controllers/pistaAviacaoRuralUpdateController';
import { pistaAviacaoRuralArchiveManyApiDoc } from './controllers/pistaAviacaoRuralArchiveManyController';
import { pistaAviacaoRuralRestoreManyApiDoc } from './controllers/pistaAviacaoRuralRestoreManyController';

export function getPistaAviacaoRuralPaths() {
  return buildPaths('PistaAviacaoRural', [
    pistaAviacaoRuralAutocompleteApiDoc,
    pistaAviacaoRuralCreateApiDoc,
    pistaAviacaoRuralArchiveManyApiDoc,
    pistaAviacaoRuralRestoreManyApiDoc,
    pistaAviacaoRuralDeleteManyApiDoc,
    pistaAviacaoRuralFindApiDoc,
    pistaAviacaoRuralFindManyApiDoc,
    pistaAviacaoRuralUpdateApiDoc,
    pistaAviacaoRuralImportApiDoc,
  ]);
}
