import { buildPaths } from '../../shared/openapi/routeToPath';
import { dueDiligenceRuralAutocompleteApiDoc } from './controllers/dueDiligenceRuralAutocompleteController';
import { dueDiligenceRuralCreateApiDoc } from './controllers/dueDiligenceRuralCreateController';
import { dueDiligenceRuralDeleteManyApiDoc } from './controllers/dueDiligenceRuralDeleteManyController';
import { dueDiligenceRuralFindApiDoc } from './controllers/dueDiligenceRuralFindController';
import { dueDiligenceRuralFindManyApiDoc } from './controllers/dueDiligenceRuralFindManyController';
import { dueDiligenceRuralImportApiDoc } from './controllers/dueDiligenceRuralImporterController';
import { dueDiligenceRuralUpdateApiDoc } from './controllers/dueDiligenceRuralUpdateController';
import { dueDiligenceRuralArchiveManyApiDoc } from './controllers/dueDiligenceRuralArchiveManyController';
import { dueDiligenceRuralRestoreManyApiDoc } from './controllers/dueDiligenceRuralRestoreManyController';

export function getDueDiligenceRuralPaths() {
  return buildPaths('DueDiligenceRural', [
    dueDiligenceRuralAutocompleteApiDoc,
    dueDiligenceRuralCreateApiDoc,
    dueDiligenceRuralArchiveManyApiDoc,
    dueDiligenceRuralRestoreManyApiDoc,
    dueDiligenceRuralDeleteManyApiDoc,
    dueDiligenceRuralFindApiDoc,
    dueDiligenceRuralFindManyApiDoc,
    dueDiligenceRuralUpdateApiDoc,
    dueDiligenceRuralImportApiDoc,
  ]);
}
