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
      return Number.isNaN(data) ? 'NaN' : 'number';
    }
    case 'object': {
      if (Array.isArray(data)) {
        return 'array';
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
    string: { singular: 'character', plural: 'characters' },
    file: { singular: 'byte', plural: 'bytes' },
    array: { singular: 'item', plural: 'items' },
    set: { singular: 'item', plural: 'items' },
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
    regex: 'input',
    email: 'email address',
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
    datetime: 'ISO datetime',
    date: 'ISO date',
    time: 'ISO time',
    duration: 'ISO duration',
    ipv4: 'IPv4 address',
    ipv6: 'IPv6 address',
    cidrv4: 'IPv4 range',
    cidrv6: 'IPv6 range',
    base64: 'base64-encoded string',
    base64url: 'base64url-encoded string',
    json_string: 'JSON string',
    e164: 'E.164 number',
    jwt: 'JWT',
    template_literal: 'input',
  };

  return (issue) => {
    switch (issue.code) {
      case 'invalid_type':
        if (
          issue.expected === 'string' &&
          parsedType(issue.input) === 'undefined'
        )
          return 'Required';
        if (
          issue.expected === 'number' &&
          parsedType(issue.input) === 'undefined'
        )
          return 'Required';
        if (
          issue.expected === 'array' &&
          parsedType(issue.input) === 'undefined'
        )
          return 'Required';
        if (
          issue.expected === 'object' &&
          parsedType(issue.input) === 'undefined'
        )
          return 'Required';
        if (parsedType(issue.input) === 'undefined') return 'Required';
        return `Expected ${issue.expected}, but received ${parsedType(issue.input)}`;

      case 'invalid_value':
        if (issue.values.length === 1)
          return `Must be ${util.stringifyPrimitive(issue.values[0])}`;
        return `Please select one of: ${util.joinValues(issue.values, ', ')}`;
      case 'too_big': {
        const sizing = getSizing(issue.origin);
        if (sizing) {
          const max = issue.maximum.toString();
          const unit = pluralize(issue.maximum, sizing.singular, sizing.plural);
          if (issue.inclusive) return `Maximum ${max} ${unit} allowed`;
          return `Must have fewer than ${max} ${unit}`;
        }
        if (issue.inclusive)
          return `Must be ${issue.maximum.toString()} or less`;
        return `Must be less than ${issue.maximum.toString()}`;
      }
      case 'too_small': {
        const sizing = getSizing(issue.origin);
        if (sizing) {
          const min = issue.minimum.toString();

          if (min === '1') {
            return `Required`;
          }

          const unit = pluralize(issue.minimum, sizing.singular, sizing.plural);
          if (issue.inclusive) return `Minimum ${min} ${unit} required`;
          return `Must have more than ${min} ${unit}`;
        }
        if (issue.inclusive)
          return `Must be ${issue.minimum.toString()} or more`;
        return `Must be greater than ${issue.minimum.toString()}`;
      }
      case 'invalid_format': {
        const _issue = issue as $ZodStringFormatIssues;
        if (_issue.format === 'starts_with') {
          return `Must start with "${_issue.prefix}"`;
        }
        if (_issue.format === 'ends_with')
          return `Must end with "${_issue.suffix}"`;
        if (_issue.format === 'includes')
          return `Must include "${_issue.includes}"`;
        if (_issue.format === 'regex') return `Invalid format`;
        return `Please enter a valid ${Nouns[_issue.format] ?? _issue.format}`;
      }
      case 'not_multiple_of':
        return `Must be a multiple of ${issue.divisor}`;
      case 'unrecognized_keys':
        return `Unexpected field${issue.keys.length > 1 ? 's' : ''}: ${util.joinValues(issue.keys, ', ')}`;
      case 'invalid_key':
        return `Invalid field`;
      case 'invalid_union':
        return 'Invalid value';
      case 'invalid_element':
        return `Invalid value`;
      default:
        return `Invalid value`;
    }
  };
};

export function zodEn(): { localeError: $ZodErrorMap } {
  return {
    localeError: error(),
  };
}
