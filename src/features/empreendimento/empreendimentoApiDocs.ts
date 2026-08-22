import { buildPaths } from '../../shared/openapi/routeToPath';
import { empreendimentoAutocompleteApiDoc } from './controllers/empreendimentoAutocompleteController';
import { empreendimentoCreateApiDoc } from './controllers/empreendimentoCreateController';
import { empreendimentoDeleteManyApiDoc } from './controllers/empreendimentoDeleteManyController';
import { empreendimentoFindApiDoc } from './controllers/empreendimentoFindController';
import { empreendimentoFindManyApiDoc } from './controllers/empreendimentoFindManyController';
import { empreendimentoImportApiDoc } from './controllers/empreendimentoImporterController';
import { empreendimentoUpdateApiDoc } from './controllers/empreendimentoUpdateController';
import { empreendimentoArchiveManyApiDoc } from './controllers/empreendimentoArchiveManyController';
import { empreendimentoRestoreManyApiDoc } from './controllers/empreendimentoRestoreManyController';

export function getEmpreendimentoPaths() {
  return buildPaths('Empreendimento', [
    empreendimentoAutocompleteApiDoc,
    empreendimentoCreateApiDoc,
    empreendimentoArchiveManyApiDoc,
    empreendimentoRestoreManyApiDoc,
    empreendimentoDeleteManyApiDoc,
    empreendimentoFindApiDoc,
    empreendimentoFindManyApiDoc,
    empreendimentoUpdateApiDoc,
    empreendimentoImportApiDoc,
  ]);
}
