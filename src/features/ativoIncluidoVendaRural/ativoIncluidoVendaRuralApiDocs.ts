import { buildPaths } from '../../shared/openapi/routeToPath';
import { ativoIncluidoVendaRuralAutocompleteApiDoc } from './controllers/ativoIncluidoVendaRuralAutocompleteController';
import { ativoIncluidoVendaRuralCreateApiDoc } from './controllers/ativoIncluidoVendaRuralCreateController';
import { ativoIncluidoVendaRuralDeleteManyApiDoc } from './controllers/ativoIncluidoVendaRuralDeleteManyController';
import { ativoIncluidoVendaRuralFindApiDoc } from './controllers/ativoIncluidoVendaRuralFindController';
import { ativoIncluidoVendaRuralFindManyApiDoc } from './controllers/ativoIncluidoVendaRuralFindManyController';
import { ativoIncluidoVendaRuralImportApiDoc } from './controllers/ativoIncluidoVendaRuralImporterController';
import { ativoIncluidoVendaRuralUpdateApiDoc } from './controllers/ativoIncluidoVendaRuralUpdateController';
import { ativoIncluidoVendaRuralArchiveManyApiDoc } from './controllers/ativoIncluidoVendaRuralArchiveManyController';
import { ativoIncluidoVendaRuralRestoreManyApiDoc } from './controllers/ativoIncluidoVendaRuralRestoreManyController';

export function getAtivoIncluidoVendaRuralPaths() {
  return buildPaths('AtivoIncluidoVendaRural', [
    ativoIncluidoVendaRuralAutocompleteApiDoc,
    ativoIncluidoVendaRuralCreateApiDoc,
    ativoIncluidoVendaRuralArchiveManyApiDoc,
    ativoIncluidoVendaRuralRestoreManyApiDoc,
    ativoIncluidoVendaRuralDeleteManyApiDoc,
    ativoIncluidoVendaRuralFindApiDoc,
    ativoIncluidoVendaRuralFindManyApiDoc,
    ativoIncluidoVendaRuralUpdateApiDoc,
    ativoIncluidoVendaRuralImportApiDoc,
  ]);
}
