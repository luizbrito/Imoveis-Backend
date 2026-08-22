import { Dictionary, Locale } from '../../translation/locales';
import { MidiaImovelWithRelationships } from './midiaImovelSchemas';

export function midiaImovelLabel(
  midiaImovel: Partial<MidiaImovelWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!midiaImovel?.titulo) {
    return '';
  }

  const value = midiaImovel.titulo;
  const _label = String(value);

  if (!midiaImovel?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
