import { Dictionary, Locale } from '../../translation/locales';
import { EmpreendimentoWithRelationships } from './empreendimentoSchemas';

export function empreendimentoLabel(
  empreendimento: Partial<EmpreendimentoWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!empreendimento?.nome) {
    return '';
  }

  const value = empreendimento.nome;
  const _label = String(value);

  if (!empreendimento?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
