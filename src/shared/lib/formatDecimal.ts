import { Locale } from '../../translation/locales';

export function formatDecimal(
  value: string | undefined | null,
  locale: Locale,
  maximumFractionDigits?: number,
) {
  if (value == null) {
    return '';
  }

  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(
    parseFloat(value),
  );
}
