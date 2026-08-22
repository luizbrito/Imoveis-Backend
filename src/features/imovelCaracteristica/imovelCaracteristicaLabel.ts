import { Dictionary, Locale } from '../../translation/locales';
import { ImovelCaracteristicaWithRelationships } from './imovelCaracteristicaSchemas';

export function imovelCaracteristicaLabel(
  imovelCaracteristica:
    | Partial<ImovelCaracteristicaWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!imovelCaracteristica?.valorTexto) {
    return '';
  }

  const value = imovelCaracteristica.valorTexto;
  const _label = String(value);

  if (!imovelCaracteristica?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
