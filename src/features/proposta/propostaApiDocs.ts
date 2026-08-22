import { buildPaths } from '../../shared/openapi/routeToPath';
import { propostaAutocompleteApiDoc } from './controllers/propostaAutocompleteController';
import { propostaCreateApiDoc } from './controllers/propostaCreateController';
import { propostaDeleteManyApiDoc } from './controllers/propostaDeleteManyController';
import { propostaFindApiDoc } from './controllers/propostaFindController';
import { propostaFindManyApiDoc } from './controllers/propostaFindManyController';
import { propostaImportApiDoc } from './controllers/propostaImporterController';
import { propostaUpdateApiDoc } from './controllers/propostaUpdateController';
import { propostaArchiveManyApiDoc } from './controllers/propostaArchiveManyController';
import { propostaRestoreManyApiDoc } from './controllers/propostaRestoreManyController';

export function getPropostaPaths() {
  return buildPaths('Proposta', [
    propostaAutocompleteApiDoc,
    propostaCreateApiDoc,
    propostaArchiveManyApiDoc,
    propostaRestoreManyApiDoc,
    propostaDeleteManyApiDoc,
    propostaFindApiDoc,
    propostaFindManyApiDoc,
    propostaUpdateApiDoc,
    propostaImportApiDoc,
  ]);
}
