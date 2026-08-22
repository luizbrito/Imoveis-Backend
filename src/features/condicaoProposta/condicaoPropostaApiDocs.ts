import { buildPaths } from '../../shared/openapi/routeToPath';
import { condicaoPropostaAutocompleteApiDoc } from './controllers/condicaoPropostaAutocompleteController';
import { condicaoPropostaCreateApiDoc } from './controllers/condicaoPropostaCreateController';
import { condicaoPropostaDeleteManyApiDoc } from './controllers/condicaoPropostaDeleteManyController';
import { condicaoPropostaFindApiDoc } from './controllers/condicaoPropostaFindController';
import { condicaoPropostaFindManyApiDoc } from './controllers/condicaoPropostaFindManyController';
import { condicaoPropostaImportApiDoc } from './controllers/condicaoPropostaImporterController';
import { condicaoPropostaUpdateApiDoc } from './controllers/condicaoPropostaUpdateController';
import { condicaoPropostaArchiveManyApiDoc } from './controllers/condicaoPropostaArchiveManyController';
import { condicaoPropostaRestoreManyApiDoc } from './controllers/condicaoPropostaRestoreManyController';

export function getCondicaoPropostaPaths() {
  return buildPaths('CondicaoProposta', [
    condicaoPropostaAutocompleteApiDoc,
    condicaoPropostaCreateApiDoc,
    condicaoPropostaArchiveManyApiDoc,
    condicaoPropostaRestoreManyApiDoc,
    condicaoPropostaDeleteManyApiDoc,
    condicaoPropostaFindApiDoc,
    condicaoPropostaFindManyApiDoc,
    condicaoPropostaUpdateApiDoc,
    condicaoPropostaImportApiDoc,
  ]);
}
