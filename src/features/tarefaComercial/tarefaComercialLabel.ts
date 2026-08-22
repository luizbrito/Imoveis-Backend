import { Dictionary, Locale } from '../../translation/locales';
import { TarefaComercialWithRelationships } from './tarefaComercialSchemas';

export function tarefaComercialLabel(
  tarefaComercial: Partial<TarefaComercialWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!tarefaComercial?.titulo) {
    return '';
  }

  const value = tarefaComercial.titulo;
  const _label = String(value);

  if (!tarefaComercial?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
