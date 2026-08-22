import { Dictionary, Locale } from '../../translation/locales';
import { CertificacaoSustentabilidadeRuralWithRelationships } from './certificacaoSustentabilidadeRuralSchemas';

export function certificacaoSustentabilidadeRuralLabel(
  certificacaoSustentabilidadeRural:
    | Partial<CertificacaoSustentabilidadeRuralWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!certificacaoSustentabilidadeRural?.nome) {
    return '';
  }

  const value = certificacaoSustentabilidadeRural.nome;
  const _label = String(value);

  if (!certificacaoSustentabilidadeRural?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
