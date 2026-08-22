import { Dictionary, Locale } from '../../translation/locales';
import { PaisWithRelationships } from './paisSchemas';

export function paisLabel(
  pais: Partial<PaisWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!pais?.nome) {
    return '';
  }

  const value = pais.nome;
  const _label = String(value);

  if (!pais?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
