import { buildPaths } from '../../shared/openapi/routeToPath';
import { divisaoOperacionalRuralAutocompleteApiDoc } from './controllers/divisaoOperacionalRuralAutocompleteController';
import { divisaoOperacionalRuralCreateApiDoc } from './controllers/divisaoOperacionalRuralCreateController';
import { divisaoOperacionalRuralDeleteManyApiDoc } from './controllers/divisaoOperacionalRuralDeleteManyController';
import { divisaoOperacionalRuralFindApiDoc } from './controllers/divisaoOperacionalRuralFindController';
import { divisaoOperacionalRuralFindManyApiDoc } from './controllers/divisaoOperacionalRuralFindManyController';
import { divisaoOperacionalRuralImportApiDoc } from './controllers/divisaoOperacionalRuralImporterController';
import { divisaoOperacionalRuralUpdateApiDoc } from './controllers/divisaoOperacionalRuralUpdateController';
import { divisaoOperacionalRuralArchiveManyApiDoc } from './controllers/divisaoOperacionalRuralArchiveManyController';
import { divisaoOperacionalRuralRestoreManyApiDoc } from './controllers/divisaoOperacionalRuralRestoreManyController';

export function getDivisaoOperacionalRuralPaths() {
  return buildPaths('DivisaoOperacionalRural', [
    divisaoOperacionalRuralAutocompleteApiDoc,
    divisaoOperacionalRuralCreateApiDoc,
    divisaoOperacionalRuralArchiveManyApiDoc,
    divisaoOperacionalRuralRestoreManyApiDoc,
    divisaoOperacionalRuralDeleteManyApiDoc,
    divisaoOperacionalRuralFindApiDoc,
    divisaoOperacionalRuralFindManyApiDoc,
    divisaoOperacionalRuralUpdateApiDoc,
    divisaoOperacionalRuralImportApiDoc,
  ]);
}
