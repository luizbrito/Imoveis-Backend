import { buildPaths } from '../../shared/openapi/routeToPath';
import { producaoHistoricaRuralAutocompleteApiDoc } from './controllers/producaoHistoricaRuralAutocompleteController';
import { producaoHistoricaRuralCreateApiDoc } from './controllers/producaoHistoricaRuralCreateController';
import { producaoHistoricaRuralDeleteManyApiDoc } from './controllers/producaoHistoricaRuralDeleteManyController';
import { producaoHistoricaRuralFindApiDoc } from './controllers/producaoHistoricaRuralFindController';
import { producaoHistoricaRuralFindManyApiDoc } from './controllers/producaoHistoricaRuralFindManyController';
import { producaoHistoricaRuralImportApiDoc } from './controllers/producaoHistoricaRuralImporterController';
import { producaoHistoricaRuralUpdateApiDoc } from './controllers/producaoHistoricaRuralUpdateController';
import { producaoHistoricaRuralArchiveManyApiDoc } from './controllers/producaoHistoricaRuralArchiveManyController';
import { producaoHistoricaRuralRestoreManyApiDoc } from './controllers/producaoHistoricaRuralRestoreManyController';

export function getProducaoHistoricaRuralPaths() {
  return buildPaths('ProducaoHistoricaRural', [
    producaoHistoricaRuralAutocompleteApiDoc,
    producaoHistoricaRuralCreateApiDoc,
    producaoHistoricaRuralArchiveManyApiDoc,
    producaoHistoricaRuralRestoreManyApiDoc,
    producaoHistoricaRuralDeleteManyApiDoc,
    producaoHistoricaRuralFindApiDoc,
    producaoHistoricaRuralFindManyApiDoc,
    producaoHistoricaRuralUpdateApiDoc,
    producaoHistoricaRuralImportApiDoc,
  ]);
}
