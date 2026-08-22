import dayjs from 'dayjs';
import { isString } from 'lodash-es';
import { Dictionary } from '../../translation/locales';

export function formatDateTime(
  value: dayjs.ConfigType,
  dateTimeFormatOrDictionary: string | Dictionary,
) {
  if (!value) {
    return '';
  }

  const isDatetimeFormat = isString(dateTimeFormatOrDictionary);

  return dayjs(value).format(
    isDatetimeFormat
      ? dateTimeFormatOrDictionary
      : dateTimeFormatOrDictionary.shared.datetimeFormat,
  );
}
