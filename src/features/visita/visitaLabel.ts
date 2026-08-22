import { Dictionary, Locale } from '../../translation/locales';
import { VisitaWithRelationships } from './visitaSchemas';

export function visitaLabel(
  visita: Partial<VisitaWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!visita?.codigo) {
    return '';
  }

  const value = visita.codigo;
  const _label = String(value);

  if (!visita?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
