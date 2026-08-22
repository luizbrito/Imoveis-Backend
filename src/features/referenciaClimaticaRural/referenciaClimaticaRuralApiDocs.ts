import { buildPaths } from '../../shared/openapi/routeToPath';
import { referenciaClimaticaRuralAutocompleteApiDoc } from './controllers/referenciaClimaticaRuralAutocompleteController';
import { referenciaClimaticaRuralCreateApiDoc } from './controllers/referenciaClimaticaRuralCreateController';
import { referenciaClimaticaRuralDeleteManyApiDoc } from './controllers/referenciaClimaticaRuralDeleteManyController';
import { referenciaClimaticaRuralFindApiDoc } from './controllers/referenciaClimaticaRuralFindController';
import { referenciaClimaticaRuralFindManyApiDoc } from './controllers/referenciaClimaticaRuralFindManyController';
import { referenciaClimaticaRuralImportApiDoc } from './controllers/referenciaClimaticaRuralImporterController';
import { referenciaClimaticaRuralUpdateApiDoc } from './controllers/referenciaClimaticaRuralUpdateController';
import { referenciaClimaticaRuralArchiveManyApiDoc } from './controllers/referenciaClimaticaRuralArchiveManyController';
import { referenciaClimaticaRuralRestoreManyApiDoc } from './controllers/referenciaClimaticaRuralRestoreManyController';

export function getReferenciaClimaticaRuralPaths() {
  return buildPaths('ReferenciaClimaticaRural', [
    referenciaClimaticaRuralAutocompleteApiDoc,
    referenciaClimaticaRuralCreateApiDoc,
    referenciaClimaticaRuralArchiveManyApiDoc,
    referenciaClimaticaRuralRestoreManyApiDoc,
    referenciaClimaticaRuralDeleteManyApiDoc,
    referenciaClimaticaRuralFindApiDoc,
    referenciaClimaticaRuralFindManyApiDoc,
    referenciaClimaticaRuralUpdateApiDoc,
    referenciaClimaticaRuralImportApiDoc,
  ]);
}
