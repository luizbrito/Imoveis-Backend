import { Dictionary, Locale } from '../../translation/locales';
import { ConsentimentoLGPDWithRelationships } from './consentimentoLGPDSchemas';
import { dictionaryEnumerator } from '../../translation/dictionaryEnumerator';

export function consentimentoLGPDLabel(
  consentimentoLGPD:
    | Partial<ConsentimentoLGPDWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!consentimentoLGPD?.tipo) {
    return '';
  }

  const value = consentimentoLGPD.tipo;
  const _label = dictionaryEnumerator(
    dictionary.consentimentoLGPD.enumerators.tipo,
    value as string,
  );

  if (!consentimentoLGPD?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
