import { Dictionary, Locale } from '../../translation/locales';
import { CondicaoPropostaWithRelationships } from './condicaoPropostaSchemas';

export function condicaoPropostaLabel(
  condicaoProposta:
    | Partial<CondicaoPropostaWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!condicaoProposta?.descricao) {
    return '';
  }

  const value = condicaoProposta.descricao;
  const _label = String(value);

  if (!condicaoProposta?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
