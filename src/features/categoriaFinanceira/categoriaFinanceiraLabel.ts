import { Dictionary, Locale } from '../../translation/locales';
import { CategoriaFinanceiraWithRelationships } from './categoriaFinanceiraSchemas';

export function categoriaFinanceiraLabel(
  categoriaFinanceira:
    | Partial<CategoriaFinanceiraWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!categoriaFinanceira?.nome) {
    return '';
  }

  const value = categoriaFinanceira.nome;
  const _label = String(value);

  if (!categoriaFinanceira?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
