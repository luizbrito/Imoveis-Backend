import { startCase, toLower } from 'lodash-es';
import { AuditLogWithAuthor } from './auditLogSchemas';
import { labels } from '../labels';
import { memberFullName } from '../member/memberFullName';
import { dictionaryEnumerator } from '../../translation/dictionaryEnumerator';
import { dictionaryFormat } from '../../translation/dictionaryFormat';
import { Dictionary, Locale } from '../../translation/locales';

export const auditLogOperations = {
  signIn: 'SI',
  signInFailed: 'SIF',
  signOut: 'SO',
  signUp: 'SU',
  passwordResetRequest: 'PRR',
  passwordResetConfirm: 'PRC',
  passwordChange: 'PC',
  twoFactorEnabled: 'TFE',
  twoFactorDisabled: 'TFD',
  twoFactorBackupCodesRegenerated: 'TFB',
  verifyEmailConfirm: 'VEC',
  emailChangeRequest: 'ECR',
  emailChangeConfirm: 'ECC',

  create: 'C',
  update: 'U',
  delete: 'D',
  memberSessionRevoked: 'MSR',

  // API Key operations
  apiGet: 'AG',
  apiPost: 'APO',
  apiPut: 'APU',
  apiDelete: 'AD',
} as const;

export function auditLogReadableOperation(
  auditLog: AuditLogWithAuthor,
  dictionary: Dictionary,
  locale: Locale,
) {
  const unformattedText = dictionaryEnumerator(
    dictionary.auditLog.readableOperations,
    auditLog.operation,
  );

  if (!unformattedText) {
    return null;
  }

  const authorFullName = memberFullName({
    firstName: auditLog.authorFirstName,
    lastName: auditLog.authorLastName,
  });

  const authorLabel = authorFullName || auditLog.authorEmail;

  const labelFn = (labels as any)[auditLog.entityName] as (
    entity: any,
    dictionary: Dictionary,
    locale: Locale,
  ) => string;

  const isSelfAction =
    auditLog.entityName === 'Member' && auditLog.entityId === auditLog.memberId;

  if (isSelfAction) {
    if (auditLog.operation === auditLogOperations.create) {
      return dictionaryFormat(
        dictionary.auditLog.readableOperations.selfSignUp,
        authorLabel,
      ).trim();
    }
    if (auditLog.operation === auditLogOperations.update) {
      return dictionaryFormat(
        dictionary.auditLog.readableOperations.selfUpdate,
        authorLabel,
      ).trim();
    }
  }

  if (
    [auditLogOperations.update, auditLogOperations.delete].includes(
      auditLog?.operation,
    )
  ) {
    if (!labelFn) {
      return null;
    }

    return dictionaryFormat(
      unformattedText,
      authorLabel,
      toLower(startCase(auditLog.entityName)),
      labelFn(auditLog.oldData, dictionary, locale),
    ).trim();
  }

  if ([auditLogOperations.create].includes(auditLog?.operation)) {
    if (!labelFn) {
      return null;
    }

    return dictionaryFormat(
      unformattedText,
      authorLabel,
      toLower(startCase(auditLog.entityName)),
      labelFn(auditLog.newData, dictionary, locale),
    ).trim();
  }

  return dictionaryFormat(unformattedText, authorLabel).trim();
}
