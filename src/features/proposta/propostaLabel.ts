import { Dictionary, Locale } from '../../translation/locales';
import { PropostaWithRelationships } from './propostaSchemas';

export function propostaLabel(
  proposta: Partial<PropostaWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!proposta?.codigo) {
    return '';
  }

  const value = proposta.codigo;
  const _label = String(value);

  if (!proposta?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
