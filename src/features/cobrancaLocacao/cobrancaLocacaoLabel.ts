import { Dictionary, Locale } from '../../translation/locales';
import { CobrancaLocacaoWithRelationships } from './cobrancaLocacaoSchemas';

export function cobrancaLocacaoLabel(
  cobrancaLocacao: Partial<CobrancaLocacaoWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!cobrancaLocacao?.competencia) {
    return '';
  }

  const value = cobrancaLocacao.competencia;
  const _label = String(value);

  if (!cobrancaLocacao?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
