import { Dictionary, Locale } from '../../translation/locales';
import { CaracteristicaImovelWithRelationships } from './caracteristicaImovelSchemas';

export function caracteristicaImovelLabel(
  caracteristicaImovel:
    | Partial<CaracteristicaImovelWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!caracteristicaImovel?.nome) {
    return '';
  }

  const value = caracteristicaImovel.nome;
  const _label = String(value);

  if (!caracteristicaImovel?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
