import { Dictionary, Locale } from '../../translation/locales';
import { ParcelaVendaWithRelationships } from './parcelaVendaSchemas';

export function parcelaVendaLabel(
  parcelaVenda: Partial<ParcelaVendaWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!parcelaVenda?.numeroParcela) {
    return '';
  }

  const value = parcelaVenda.numeroParcela;
  const _label = String(value);

  if (!parcelaVenda?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
