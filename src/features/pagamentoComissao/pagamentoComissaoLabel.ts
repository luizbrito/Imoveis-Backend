import { Dictionary, Locale } from '../../translation/locales';
import { PagamentoComissaoWithRelationships } from './pagamentoComissaoSchemas';
import { formatDate } from '../../shared/lib/formatDate';

export function pagamentoComissaoLabel(
  pagamentoComissao:
    | Partial<PagamentoComissaoWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!pagamentoComissao?.dataPagamento) {
    return '';
  }

  const value = pagamentoComissao.dataPagamento;
  const _label = formatDate(value as any, dictionary);

  if (!pagamentoComissao?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
