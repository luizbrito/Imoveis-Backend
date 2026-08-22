import {
  $ZodErrorMap,
  $ZodStringFormatIssues,
  $ZodStringFormats,
  util,
} from 'zod/v4/core';

export const parsedType = (data: any): string => {
  const t = typeof data;

  switch (t) {
    case 'number': {
      return Number.isNaN(data) ? 'NaN' : 'Zahl';
    }
    case 'object': {
      if (Array.isArray(data)) {
        return 'Array';
      }
      if (data === null) {
        return 'null';
      }

      if (
        Object.getPrototypeOf(data) !== Object.prototype &&
        data.constructor
      ) {
        return data.constructor.name;
      }
    }
  }
  return t;
};

const error: () => $ZodErrorMap = () => {
  const Sizable: Record<string, { singular: string; plural: string }> = {
    string: { singular: 'Zeichen', plural: 'Zeichen' },
    file: { singular: 'Byte', plural: 'Bytes' },
    array: { singular: 'Element', plural: 'Elemente' },
    set: { singular: 'Element', plural: 'Elemente' },
  };

  function getSizing(
    origin: string,
  ): { singular: string; plural: string } | null {
    return Sizable[origin] ?? null;
  }

  function pluralize(
    count: number | bigint | string,
    singular: string,
    plural: string,
  ): string {
    const num =
      typeof count === 'string'
        ? parseFloat(count)
        : typeof count === 'bigint'
          ? Number(count)
          : count;
    return num === 1 ? singular : plural;
  }

  const Nouns: {
    [k in $ZodStringFormats | (string & {})]?: string;
  } = {
    regex: 'Eingabe',
    email: 'E-Mail-Adresse',
    url: 'URL',
    emoji: 'Emoji',
    uuid: 'UUID',
    uuidv4: 'UUIDv4',
    uuidv6: 'UUIDv6',
    nanoid: 'nanoid',
    guid: 'GUID',
    cuid: 'cuid',
    cuid2: 'cuid2',
    ulid: 'ULID',
    xid: 'XID',
    ksuid: 'KSUID',
    datetime: 'ISO-Datum',
    date: 'ISO-Datum',
    time: 'ISO-Zeit',
    duration: 'ISO-Dauer',
    ipv4: 'IPv4-Adresse',
    ipv6: 'IPv6-Adresse',
    cidrv4: 'IPv4-Bereich',
    cidrv6: 'IPv6-Bereich',
    base64: 'base64-kodierte Zeichenkette',
    base64url: 'base64url-kodierte Zeichenkette',
    json_string: 'JSON-Zeichenkette',
    e164: 'E.164-Nummer',
    jwt: 'JWT',
    template_literal: 'Eingabe',
  };

  return (issue) => {
    switch (issue.code) {
      case 'invalid_type':
        if (
          issue.expected === 'string' &&
          parsedType(issue.input) === 'undefined'
        )
          return 'Erforderlich';
        if (
          issue.expected === 'number' &&
          parsedType(issue.input) === 'undefined'
        )
          return 'Erforderlich';
        if (
          issue.expected === 'array' &&
          parsedType(issue.input) === 'undefined'
        )
          return 'Erforderlich';
        if (
          issue.expected === 'object' &&
          parsedType(issue.input) === 'undefined'
        )
          return 'Erforderlich';
        if (parsedType(issue.input) === 'undefined') return 'Erforderlich';
        return `${issue.expected} erwartet, aber ${parsedType(issue.input)} erhalten`;

      case 'invalid_value':
        if (issue.values.length === 1)
          return `Muss ${util.stringifyPrimitive(issue.values[0])} sein`;
        return `Bitte wählen Sie eines aus: ${util.joinValues(issue.values, ', ')}`;
      case 'too_big': {
        const sizing = getSizing(issue.origin);
        if (sizing) {
          const max = issue.maximum.toString();
          const unit = pluralize(issue.maximum, sizing.singular, sizing.plural);
          if (issue.inclusive) return `Maximal ${max} ${unit} erlaubt`;
          return `Muss weniger als ${max} ${unit} haben`;
        }
        if (issue.inclusive)
          return `Muss ${issue.maximum.toString()} oder weniger sein`;
        return `Muss kleiner als ${issue.maximum.toString()} sein`;
      }
      case 'too_small': {
        const sizing = getSizing(issue.origin);
        if (sizing) {
          const min = issue.minimum.toString();

          if (min === '1') {
            return `Erforderlich`;
          }

          const unit = pluralize(issue.minimum, sizing.singular, sizing.plural);
          if (issue.inclusive) return `Mindestens ${min} ${unit} erforderlich`;
          return `Muss mehr als ${min} ${unit} haben`;
        }
        if (issue.inclusive)
          return `Muss ${issue.minimum.toString()} oder mehr sein`;
        return `Muss größer als ${issue.minimum.toString()} sein`;
      }
      case 'invalid_format': {
        const _issue = issue as $ZodStringFormatIssues;
        if (_issue.format === 'starts_with') {
          return `Muss mit "${_issue.prefix}" beginnen`;
        }
        if (_issue.format === 'ends_with')
          return `Muss mit "${_issue.suffix}" enden`;
        if (_issue.format === 'includes')
          return `Muss "${_issue.includes}" enthalten`;
        if (_issue.format === 'regex') return `Ungültiges Format`;
        return `Bitte geben Sie eine gültige ${Nouns[_issue.format] ?? _issue.format} ein`;
      }
      case 'not_multiple_of':
        return `Muss ein Vielfaches von ${issue.divisor} sein`;
      case 'unrecognized_keys':
        return `Unerwartete${issue.keys.length > 1 ? 's' : ''} Feld${issue.keys.length > 1 ? 'er' : ''}: ${util.joinValues(issue.keys, ', ')}`;
      case 'invalid_key':
        return `Ungültiges Feld`;
      case 'invalid_union':
        return 'Ungültiger Wert';
      case 'invalid_element':
        return `Ungültiger Wert`;
      default:
        return `Ungültiger Wert`;
    }
  };
};

export function zodDe(): { localeError: $ZodErrorMap } {
  return {
    localeError: error(),
  };
}
