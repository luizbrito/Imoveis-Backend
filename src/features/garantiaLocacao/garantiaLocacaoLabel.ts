import { Dictionary, Locale } from '../../translation/locales';
import { GarantiaLocacaoWithRelationships } from './garantiaLocacaoSchemas';
import { dictionaryEnumerator } from '../../translation/dictionaryEnumerator';

export function garantiaLocacaoLabel(
  garantiaLocacao: Partial<GarantiaLocacaoWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!garantiaLocacao?.tipo) {
    return '';
  }

  const value = garantiaLocacao.tipo;
  const _label = dictionaryEnumerator(
    dictionary.garantiaLocacao.enumerators.tipo,
    value as string,
  );

  if (!garantiaLocacao?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
