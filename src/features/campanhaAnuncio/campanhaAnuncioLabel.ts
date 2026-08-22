import { Dictionary, Locale } from '../../translation/locales';
import { CampanhaAnuncioWithRelationships } from './campanhaAnuncioSchemas';
import { formatDate } from '../../shared/lib/formatDate';

export function campanhaAnuncioLabel(
  campanhaAnuncio: Partial<CampanhaAnuncioWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!campanhaAnuncio?.dataInclusao) {
    return '';
  }

  const value = campanhaAnuncio.dataInclusao;
  const _label = formatDate(value as any, dictionary);

  if (!campanhaAnuncio?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
