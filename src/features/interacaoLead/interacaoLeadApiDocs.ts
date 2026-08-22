import { buildPaths } from '../../shared/openapi/routeToPath';
import { interacaoLeadAutocompleteApiDoc } from './controllers/interacaoLeadAutocompleteController';
import { interacaoLeadCreateApiDoc } from './controllers/interacaoLeadCreateController';
import { interacaoLeadDeleteManyApiDoc } from './controllers/interacaoLeadDeleteManyController';
import { interacaoLeadFindApiDoc } from './controllers/interacaoLeadFindController';
import { interacaoLeadFindManyApiDoc } from './controllers/interacaoLeadFindManyController';
import { interacaoLeadImportApiDoc } from './controllers/interacaoLeadImporterController';
import { interacaoLeadUpdateApiDoc } from './controllers/interacaoLeadUpdateController';
import { interacaoLeadArchiveManyApiDoc } from './controllers/interacaoLeadArchiveManyController';
import { interacaoLeadRestoreManyApiDoc } from './controllers/interacaoLeadRestoreManyController';

export function getInteracaoLeadPaths() {
  return buildPaths('InteracaoLead', [
    interacaoLeadAutocompleteApiDoc,
    interacaoLeadCreateApiDoc,
    interacaoLeadArchiveManyApiDoc,
    interacaoLeadRestoreManyApiDoc,
    interacaoLeadDeleteManyApiDoc,
    interacaoLeadFindApiDoc,
    interacaoLeadFindManyApiDoc,
    interacaoLeadUpdateApiDoc,
    interacaoLeadImportApiDoc,
  ]);
}
