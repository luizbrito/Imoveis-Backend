import { Dictionary, Locale } from '../../translation/locales';
import { ContaFinanceiraWithRelationships } from './contaFinanceiraSchemas';

export function contaFinanceiraLabel(
  contaFinanceira: Partial<ContaFinanceiraWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!contaFinanceira?.nome) {
    return '';
  }

  const value = contaFinanceira.nome;
  const _label = String(value);

  if (!contaFinanceira?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
