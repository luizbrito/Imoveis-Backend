import { Dictionary, Locale } from '../../translation/locales';
import { DespesaImovelWithRelationships } from './despesaImovelSchemas';

export function despesaImovelLabel(
  despesaImovel: Partial<DespesaImovelWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!despesaImovel?.descricao) {
    return '';
  }

  const value = despesaImovel.descricao;
  const _label = String(value);

  if (!despesaImovel?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
