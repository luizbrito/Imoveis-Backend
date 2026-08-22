import { buildPaths } from '../../shared/openapi/routeToPath';
import { simulacaoFinanciamentoAutocompleteApiDoc } from './controllers/simulacaoFinanciamentoAutocompleteController';
import { simulacaoFinanciamentoCreateApiDoc } from './controllers/simulacaoFinanciamentoCreateController';
import { simulacaoFinanciamentoDeleteManyApiDoc } from './controllers/simulacaoFinanciamentoDeleteManyController';
import { simulacaoFinanciamentoFindApiDoc } from './controllers/simulacaoFinanciamentoFindController';
import { simulacaoFinanciamentoFindManyApiDoc } from './controllers/simulacaoFinanciamentoFindManyController';
import { simulacaoFinanciamentoImportApiDoc } from './controllers/simulacaoFinanciamentoImporterController';
import { simulacaoFinanciamentoUpdateApiDoc } from './controllers/simulacaoFinanciamentoUpdateController';
import { simulacaoFinanciamentoArchiveManyApiDoc } from './controllers/simulacaoFinanciamentoArchiveManyController';
import { simulacaoFinanciamentoRestoreManyApiDoc } from './controllers/simulacaoFinanciamentoRestoreManyController';

export function getSimulacaoFinanciamentoPaths() {
  return buildPaths('SimulacaoFinanciamento', [
    simulacaoFinanciamentoAutocompleteApiDoc,
    simulacaoFinanciamentoCreateApiDoc,
    simulacaoFinanciamentoArchiveManyApiDoc,
    simulacaoFinanciamentoRestoreManyApiDoc,
    simulacaoFinanciamentoDeleteManyApiDoc,
    simulacaoFinanciamentoFindApiDoc,
    simulacaoFinanciamentoFindManyApiDoc,
    simulacaoFinanciamentoUpdateApiDoc,
    simulacaoFinanciamentoImportApiDoc,
  ]);
}
