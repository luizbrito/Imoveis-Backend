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
      return Number.isNaN(data) ? 'NaN' : 'nombre';
    }
    case 'object': {
      if (Array.isArray(data)) {
        return 'tableau';
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
    string: { singular: 'caractère', plural: 'caractères' },
    file: { singular: 'octet', plural: 'octets' },
    array: { singular: 'élément', plural: 'éléments' },
    set: { singular: 'élément', plural: 'éléments' },
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
    regex: 'saisie',
    email: 'adresse email',
    url: 'URL',
    emoji: 'emoji',
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
    datetime: 'date ISO',
    date: 'date ISO',
    time: 'heure ISO',
    duration: 'durée ISO',
    ipv4: 'adresse IPv4',
    ipv6: 'adresse IPv6',
    cidrv4: 'plage IPv4',
    cidrv6: 'plage IPv6',
    base64: 'chaîne encodée base64',
    base64url: 'chaîne encodée base64url',
    json_string: 'chaîne JSON',
    e164: 'numéro E.164',
    jwt: 'JWT',
    template_literal: 'saisie',
  };

  return (issue) => {
    switch (issue.code) {
      case 'invalid_type':
        if (
          issue.expected === 'string' &&
          parsedType(issue.input) === 'undefined'
        )
          return 'Requis';
        if (
          issue.expected === 'number' &&
          parsedType(issue.input) === 'undefined'
        )
          return 'Requis';
        if (
          issue.expected === 'array' &&
          parsedType(issue.input) === 'undefined'
        )
          return 'Requis';
        if (
          issue.expected === 'object' &&
          parsedType(issue.input) === 'undefined'
        )
          return 'Requis';
        if (parsedType(issue.input) === 'undefined') return 'Requis';
        return `${issue.expected} attendu, mais ${parsedType(issue.input)} reçu`;

      case 'invalid_value':
        if (issue.values.length === 1)
          return `Doit être ${util.stringifyPrimitive(issue.values[0])}`;
        return `Veuillez sélectionner l'un des: ${util.joinValues(issue.values, ', ')}`;
      case 'too_big': {
        const sizing = getSizing(issue.origin);
        if (sizing) {
          const max = issue.maximum.toString();
          const unit = pluralize(issue.maximum, sizing.singular, sizing.plural);
          if (issue.inclusive)
            return `Maximum ${max} ${unit} autorisé${issue.maximum > 1 ? 's' : ''}`;
          return `Doit avoir moins de ${max} ${unit}`;
        }
        if (issue.inclusive)
          return `Doit être ${issue.maximum.toString()} ou moins`;
        return `Doit être inférieur à ${issue.maximum.toString()}`;
      }
      case 'too_small': {
        const sizing = getSizing(issue.origin);
        if (sizing) {
          const min = issue.minimum.toString();

          if (min === '1') {
            return `Requis`;
          }

          const unit = pluralize(issue.minimum, sizing.singular, sizing.plural);
          if (issue.inclusive) return `Minimum ${min} ${unit} requis`;
          return `Doit avoir plus de ${min} ${unit}`;
        }
        if (issue.inclusive)
          return `Doit être ${issue.minimum.toString()} ou plus`;
        return `Doit être supérieur à ${issue.minimum.toString()}`;
      }
      case 'invalid_format': {
        const _issue = issue as $ZodStringFormatIssues;
        if (_issue.format === 'starts_with') {
          return `Doit commencer par "${_issue.prefix}"`;
        }
        if (_issue.format === 'ends_with')
          return `Doit se terminer par "${_issue.suffix}"`;
        if (_issue.format === 'includes')
          return `Doit inclure "${_issue.includes}"`;
        if (_issue.format === 'regex') return `Format invalide`;
        return `Veuillez entrer un(e) ${Nouns[_issue.format] ?? _issue.format} valide`;
      }
      case 'not_multiple_of':
        return `Doit être un multiple de ${issue.divisor}`;
      case 'unrecognized_keys':
        return `Champ${issue.keys.length > 1 ? 's' : ''} inattendu${issue.keys.length > 1 ? 's' : ''}: ${util.joinValues(issue.keys, ', ')}`;
      case 'invalid_key':
        return `Champ invalide`;
      case 'invalid_union':
        return 'Valeur invalide';
      case 'invalid_element':
        return `Valeur invalide`;
      default:
        return `Valeur invalide`;
    }
  };
};

export function zodFr(): { localeError: $ZodErrorMap } {
  return {
    localeError: error(),
  };
}
