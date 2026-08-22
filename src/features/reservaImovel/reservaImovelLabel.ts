import { Dictionary, Locale } from '../../translation/locales';
import { ReservaImovelWithRelationships } from './reservaImovelSchemas';

export function reservaImovelLabel(
  reservaImovel: Partial<ReservaImovelWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!reservaImovel?.codigo) {
    return '';
  }

  const value = reservaImovel.codigo;
  const _label = String(value);

  if (!reservaImovel?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
