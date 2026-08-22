import { Dictionary, Locale } from '../../translation/locales';
import { ReajusteLocacaoWithRelationships } from './reajusteLocacaoSchemas';
import { formatDate } from '../../shared/lib/formatDate';

export function reajusteLocacaoLabel(
  reajusteLocacao: Partial<ReajusteLocacaoWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!reajusteLocacao?.dataBase) {
    return '';
  }

  const value = reajusteLocacao.dataBase;
  const _label = formatDate(value as any, dictionary);

  if (!reajusteLocacao?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
