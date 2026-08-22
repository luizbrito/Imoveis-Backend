import { Dictionary, Locale } from '../../translation/locales';
import { CidadeWithRelationships } from './cidadeSchemas';

export function cidadeLabel(
  cidade: Partial<CidadeWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!cidade?.nome) {
    return '';
  }

  const value = cidade.nome;
  const _label = String(value);

  if (!cidade?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
