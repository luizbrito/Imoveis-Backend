import { buildPaths } from '../../shared/openapi/routeToPath';
import { certificacaoSustentabilidadeRuralAutocompleteApiDoc } from './controllers/certificacaoSustentabilidadeRuralAutocompleteController';
import { certificacaoSustentabilidadeRuralCreateApiDoc } from './controllers/certificacaoSustentabilidadeRuralCreateController';
import { certificacaoSustentabilidadeRuralDeleteManyApiDoc } from './controllers/certificacaoSustentabilidadeRuralDeleteManyController';
import { certificacaoSustentabilidadeRuralFindApiDoc } from './controllers/certificacaoSustentabilidadeRuralFindController';
import { certificacaoSustentabilidadeRuralFindManyApiDoc } from './controllers/certificacaoSustentabilidadeRuralFindManyController';
import { certificacaoSustentabilidadeRuralImportApiDoc } from './controllers/certificacaoSustentabilidadeRuralImporterController';
import { certificacaoSustentabilidadeRuralUpdateApiDoc } from './controllers/certificacaoSustentabilidadeRuralUpdateController';
import { certificacaoSustentabilidadeRuralArchiveManyApiDoc } from './controllers/certificacaoSustentabilidadeRuralArchiveManyController';
import { certificacaoSustentabilidadeRuralRestoreManyApiDoc } from './controllers/certificacaoSustentabilidadeRuralRestoreManyController';

export function getCertificacaoSustentabilidadeRuralPaths() {
  return buildPaths('CertificacaoSustentabilidadeRural', [
    certificacaoSustentabilidadeRuralAutocompleteApiDoc,
    certificacaoSustentabilidadeRuralCreateApiDoc,
    certificacaoSustentabilidadeRuralArchiveManyApiDoc,
    certificacaoSustentabilidadeRuralRestoreManyApiDoc,
    certificacaoSustentabilidadeRuralDeleteManyApiDoc,
    certificacaoSustentabilidadeRuralFindApiDoc,
    certificacaoSustentabilidadeRuralFindManyApiDoc,
    certificacaoSustentabilidadeRuralUpdateApiDoc,
    certificacaoSustentabilidadeRuralImportApiDoc,
  ]);
}
