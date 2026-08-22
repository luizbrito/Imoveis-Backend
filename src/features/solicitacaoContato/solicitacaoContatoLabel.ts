import { Dictionary, Locale } from '../../translation/locales';
import { SolicitacaoContatoWithRelationships } from './solicitacaoContatoSchemas';

export function solicitacaoContatoLabel(
  solicitacaoContato:
    | Partial<SolicitacaoContatoWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!solicitacaoContato?.nome) {
    return '';
  }

  const value = solicitacaoContato.nome;
  const _label = String(value);

  if (!solicitacaoContato?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
