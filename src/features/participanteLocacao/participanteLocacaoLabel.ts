import { Dictionary, Locale } from '../../translation/locales';
import { ParticipanteLocacaoWithRelationships } from './participanteLocacaoSchemas';
import { dictionaryEnumerator } from '../../translation/dictionaryEnumerator';

export function participanteLocacaoLabel(
  participanteLocacao:
    | Partial<ParticipanteLocacaoWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!participanteLocacao?.papel) {
    return '';
  }

  const value = participanteLocacao.papel;
  const _label = dictionaryEnumerator(
    dictionary.participanteLocacao.enumerators.papel,
    value as string,
  );

  if (!participanteLocacao?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
