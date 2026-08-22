import { buildPaths } from '../../shared/openapi/routeToPath';
import { documentoPessoaAutocompleteApiDoc } from './controllers/documentoPessoaAutocompleteController';
import { documentoPessoaCreateApiDoc } from './controllers/documentoPessoaCreateController';
import { documentoPessoaDeleteManyApiDoc } from './controllers/documentoPessoaDeleteManyController';
import { documentoPessoaFindApiDoc } from './controllers/documentoPessoaFindController';
import { documentoPessoaFindManyApiDoc } from './controllers/documentoPessoaFindManyController';
import { documentoPessoaImportApiDoc } from './controllers/documentoPessoaImporterController';
import { documentoPessoaUpdateApiDoc } from './controllers/documentoPessoaUpdateController';
import { documentoPessoaArchiveManyApiDoc } from './controllers/documentoPessoaArchiveManyController';
import { documentoPessoaRestoreManyApiDoc } from './controllers/documentoPessoaRestoreManyController';

export function getDocumentoPessoaPaths() {
  return buildPaths('DocumentoPessoa', [
    documentoPessoaAutocompleteApiDoc,
    documentoPessoaCreateApiDoc,
    documentoPessoaArchiveManyApiDoc,
    documentoPessoaRestoreManyApiDoc,
    documentoPessoaDeleteManyApiDoc,
    documentoPessoaFindApiDoc,
    documentoPessoaFindManyApiDoc,
    documentoPessoaUpdateApiDoc,
    documentoPessoaImportApiDoc,
  ]);
}
