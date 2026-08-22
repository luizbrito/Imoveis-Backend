import { Dictionary, Locale } from '../../translation/locales';
import { CondominioWithRelationships } from './condominioSchemas';

export function condominioLabel(
  condominio: Partial<CondominioWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!condominio?.nome) {
    return '';
  }

  const value = condominio.nome;
  const _label = String(value);

  if (!condominio?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
