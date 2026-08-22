import { Dictionary, Locale } from '../../translation/locales';
import { CorretorWithRelationships } from './corretorSchemas';

export function corretorLabel(
  corretor: Partial<CorretorWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!corretor?.nomeCompleto) {
    return '';
  }

  const value = corretor.nomeCompleto;
  const _label = String(value);

  if (!corretor?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
