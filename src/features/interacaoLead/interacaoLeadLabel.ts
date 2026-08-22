import { Dictionary, Locale } from '../../translation/locales';
import { InteracaoLeadWithRelationships } from './interacaoLeadSchemas';

export function interacaoLeadLabel(
  interacaoLead: Partial<InteracaoLeadWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!interacaoLead?.assunto) {
    return '';
  }

  const value = interacaoLead.assunto;
  const _label = String(value);

  if (!interacaoLead?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
