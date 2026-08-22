import { Dictionary, Locale } from '../../translation/locales';
import { AnuncioWithRelationships } from './anuncioSchemas';

export function anuncioLabel(
  anuncio: Partial<AnuncioWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!anuncio?.titulo) {
    return '';
  }

  const value = anuncio.titulo;
  const _label = String(value);

  if (!anuncio?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
