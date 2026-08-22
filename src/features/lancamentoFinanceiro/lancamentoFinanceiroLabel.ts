import { Dictionary, Locale } from '../../translation/locales';
import { LancamentoFinanceiroWithRelationships } from './lancamentoFinanceiroSchemas';

export function lancamentoFinanceiroLabel(
  lancamentoFinanceiro:
    | Partial<LancamentoFinanceiroWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!lancamentoFinanceiro?.descricao) {
    return '';
  }

  const value = lancamentoFinanceiro.descricao;
  const _label = String(value);

  if (!lancamentoFinanceiro?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
