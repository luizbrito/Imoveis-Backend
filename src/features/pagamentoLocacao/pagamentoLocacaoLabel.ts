import { Dictionary, Locale } from '../../translation/locales';
import { PagamentoLocacaoWithRelationships } from './pagamentoLocacaoSchemas';

export function pagamentoLocacaoLabel(
  pagamentoLocacao:
    | Partial<PagamentoLocacaoWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!pagamentoLocacao?.identificadorTransacao) {
    return '';
  }

  const value = pagamentoLocacao.identificadorTransacao;
  const _label = String(value);

  if (!pagamentoLocacao?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
