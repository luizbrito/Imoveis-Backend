import { Dictionary, Locale } from '../../translation/locales';
import { ContratoVendaWithRelationships } from './contratoVendaSchemas';

export function contratoVendaLabel(
  contratoVenda: Partial<ContratoVendaWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!contratoVenda?.numero) {
    return '';
  }

  const value = contratoVenda.numero;
  const _label = String(value);

  if (!contratoVenda?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
