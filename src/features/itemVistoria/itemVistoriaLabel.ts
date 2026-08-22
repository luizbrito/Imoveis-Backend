import { Dictionary, Locale } from '../../translation/locales';
import { ItemVistoriaWithRelationships } from './itemVistoriaSchemas';

export function itemVistoriaLabel(
  itemVistoria: Partial<ItemVistoriaWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!itemVistoria?.item) {
    return '';
  }

  const value = itemVistoria.item;
  const _label = String(value);

  if (!itemVistoria?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
