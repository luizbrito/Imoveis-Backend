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
      return Number.isNaN(data) ? 'NaN' : 'número';
    }
    case 'object': {
      if (Array.isArray(data)) {
        return 'arreglo';
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
    string: { singular: 'carácter', plural: 'caracteres' },
    file: { singular: 'byte', plural: 'bytes' },
    array: { singular: 'elemento', plural: 'elementos' },
    set: { singular: 'elemento', plural: 'elementos' },
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
    regex: 'entrada',
    email: 'dirección de correo',
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
    datetime: 'fecha ISO',
    date: 'fecha ISO',
    time: 'hora ISO',
    duration: 'duración ISO',
    ipv4: 'dirección IPv4',
    ipv6: 'dirección IPv6',
    cidrv4: 'rango IPv4',
    cidrv6: 'rango IPv6',
    base64: 'cadena codificada en base64',
    base64url: 'cadena codificada en base64url',
    json_string: 'cadena JSON',
    e164: 'número E.164',
    jwt: 'JWT',
    template_literal: 'entrada',
  };

  return (issue) => {
    switch (issue.code) {
      case 'invalid_type':
        if (
          issue.expected === 'string' &&
          parsedType(issue.input) === 'undefined'
        )
          return 'Requerido';
        if (
          issue.expected === 'number' &&
          parsedType(issue.input) === 'undefined'
        )
          return 'Requerido';
        if (
          issue.expected === 'array' &&
          parsedType(issue.input) === 'undefined'
        )
          return 'Requerido';
        if (
          issue.expected === 'object' &&
          parsedType(issue.input) === 'undefined'
        )
          return 'Requerido';
        if (parsedType(issue.input) === 'undefined') return 'Requerido';
        return `Se esperaba ${issue.expected}, pero se recibió ${parsedType(issue.input)}`;

      case 'invalid_value':
        if (issue.values.length === 1)
          return `Debe ser ${util.stringifyPrimitive(issue.values[0])}`;
        return `Por favor seleccione uno de: ${util.joinValues(issue.values, ', ')}`;
      case 'too_big': {
        const sizing = getSizing(issue.origin);
        if (sizing) {
          const max = issue.maximum.toString();
          const unit = pluralize(issue.maximum, sizing.singular, sizing.plural);
          if (issue.inclusive)
            return `Máximo ${max} ${unit} permitido${issue.maximum > 1 ? 's' : ''}`;
          return `Debe tener menos de ${max} ${unit}`;
        }
        if (issue.inclusive)
          return `Debe ser ${issue.maximum.toString()} o menos`;
        return `Debe ser menor que ${issue.maximum.toString()}`;
      }
      case 'too_small': {
        const sizing = getSizing(issue.origin);
        if (sizing) {
          const min = issue.minimum.toString();

          if (min === '1') {
            return `Requerido`;
          }

          const unit = pluralize(issue.minimum, sizing.singular, sizing.plural);
          if (issue.inclusive)
            return `Mínimo ${min} ${unit} requerido${issue.minimum > 1 ? 's' : ''}`;
          return `Debe tener más de ${min} ${unit}`;
        }
        if (issue.inclusive)
          return `Debe ser ${issue.minimum.toString()} o más`;
        return `Debe ser mayor que ${issue.minimum.toString()}`;
      }
      case 'invalid_format': {
        const _issue = issue as $ZodStringFormatIssues;
        if (_issue.format === 'starts_with') {
          return `Debe comenzar con "${_issue.prefix}"`;
        }
        if (_issue.format === 'ends_with')
          return `Debe terminar con "${_issue.suffix}"`;
        if (_issue.format === 'includes')
          return `Debe incluir "${_issue.includes}"`;
        if (_issue.format === 'regex') return `Formato inválido`;
        return `Por favor ingrese un(a) ${Nouns[_issue.format] ?? _issue.format} válido(a)`;
      }
      case 'not_multiple_of':
        return `Debe ser un múltiplo de ${issue.divisor}`;
      case 'unrecognized_keys':
        return `Campo${issue.keys.length > 1 ? 's' : ''} inesperado${issue.keys.length > 1 ? 's' : ''}: ${util.joinValues(issue.keys, ', ')}`;
      case 'invalid_key':
        return `Campo inválido`;
      case 'invalid_union':
        return 'Valor inválido';
      case 'invalid_element':
        return `Valor inválido`;
      default:
        return `Valor inválido`;
    }
  };
};

export function zodEs(): { localeError: $ZodErrorMap } {
  return {
    localeError: error(),
  };
}
