import { Dictionary, Locale } from '../../translation/locales';
import { ProprietarioWithRelationships } from './proprietarioSchemas';

export function proprietarioLabel(
  proprietario: Partial<ProprietarioWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!proprietario?.nomeRazaoSocial) {
    return '';
  }

  const value = proprietario.nomeRazaoSocial;
  const _label = String(value);

  if (!proprietario?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
