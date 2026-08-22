import dayjs from 'dayjs';
import { isString } from 'lodash-es';
import { Dictionary } from '../../translation/locales';

export function formatDate(
  value: dayjs.ConfigType,
  dateFormatOrDictionary: string | Dictionary,
) {
  if (!value) {
    return '';
  }

  const isDateFormat = isString(dateFormatOrDictionary);

  return dayjs(value).format(
    isDateFormat
      ? dateFormatOrDictionary
      : dateFormatOrDictionary.shared.dateFormat,
  );
}
