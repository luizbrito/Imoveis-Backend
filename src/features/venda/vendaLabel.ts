import { Dictionary, Locale } from '../../translation/locales';
import { VendaWithRelationships } from './vendaSchemas';

export function vendaLabel(
  venda: Partial<VendaWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!venda?.codigo) {
    return '';
  }

  const value = venda.codigo;
  const _label = String(value);

  if (!venda?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
