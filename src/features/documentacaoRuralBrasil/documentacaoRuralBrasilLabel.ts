import { Dictionary, Locale } from '../../translation/locales';
import { DocumentacaoRuralBrasilWithRelationships } from './documentacaoRuralBrasilSchemas';

export function documentacaoRuralBrasilLabel(
  documentacaoRuralBrasil:
    | Partial<DocumentacaoRuralBrasilWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!documentacaoRuralBrasil?.matriculaNumero) {
    return '';
  }

  const value = documentacaoRuralBrasil.matriculaNumero;
  const _label = String(value);

  if (!documentacaoRuralBrasil?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
