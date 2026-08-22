import { Dictionary, Locale } from '../../translation/locales';
import { LeadWithRelationships } from './leadSchemas';

export function leadLabel(
  lead: Partial<LeadWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!lead?.nome) {
    return '';
  }

  const value = lead.nome;
  const _label = String(value);

  if (!lead?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
