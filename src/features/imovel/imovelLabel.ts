import { Dictionary, Locale } from '../../translation/locales';
import { ImovelWithRelationships } from './imovelSchemas';

export function imovelLabel(
  imovel: Partial<ImovelWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!imovel?.titulo) {
    return '';
  }

  const value = imovel.titulo;
  const _label = String(value);

  if (!imovel?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
