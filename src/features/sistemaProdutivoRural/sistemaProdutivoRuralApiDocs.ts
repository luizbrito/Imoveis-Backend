import { buildPaths } from '../../shared/openapi/routeToPath';
import { sistemaProdutivoRuralAutocompleteApiDoc } from './controllers/sistemaProdutivoRuralAutocompleteController';
import { sistemaProdutivoRuralCreateApiDoc } from './controllers/sistemaProdutivoRuralCreateController';
import { sistemaProdutivoRuralDeleteManyApiDoc } from './controllers/sistemaProdutivoRuralDeleteManyController';
import { sistemaProdutivoRuralFindApiDoc } from './controllers/sistemaProdutivoRuralFindController';
import { sistemaProdutivoRuralFindManyApiDoc } from './controllers/sistemaProdutivoRuralFindManyController';
import { sistemaProdutivoRuralImportApiDoc } from './controllers/sistemaProdutivoRuralImporterController';
import { sistemaProdutivoRuralUpdateApiDoc } from './controllers/sistemaProdutivoRuralUpdateController';
import { sistemaProdutivoRuralArchiveManyApiDoc } from './controllers/sistemaProdutivoRuralArchiveManyController';
import { sistemaProdutivoRuralRestoreManyApiDoc } from './controllers/sistemaProdutivoRuralRestoreManyController';

export function getSistemaProdutivoRuralPaths() {
  return buildPaths('SistemaProdutivoRural', [
    sistemaProdutivoRuralAutocompleteApiDoc,
    sistemaProdutivoRuralCreateApiDoc,
    sistemaProdutivoRuralArchiveManyApiDoc,
    sistemaProdutivoRuralRestoreManyApiDoc,
    sistemaProdutivoRuralDeleteManyApiDoc,
    sistemaProdutivoRuralFindApiDoc,
    sistemaProdutivoRuralFindManyApiDoc,
    sistemaProdutivoRuralUpdateApiDoc,
    sistemaProdutivoRuralImportApiDoc,
  ]);
}
