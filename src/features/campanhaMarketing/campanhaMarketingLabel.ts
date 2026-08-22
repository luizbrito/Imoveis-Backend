import { Dictionary, Locale } from '../../translation/locales';
import { CampanhaMarketingWithRelationships } from './campanhaMarketingSchemas';

export function campanhaMarketingLabel(
  campanhaMarketing:
    | Partial<CampanhaMarketingWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!campanhaMarketing?.nome) {
    return '';
  }

  const value = campanhaMarketing.nome;
  const _label = String(value);

  if (!campanhaMarketing?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
