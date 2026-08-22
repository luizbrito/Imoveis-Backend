import { describe, it, expect } from 'vitest';
import {
  auditLogOperations,
  auditLogReadableOperation,
} from '../auditLogOperations';
import { dictionary as en } from '../../../translation/en/en';
import { dictionary as de } from '../../../translation/de/de';
import { dictionary as es } from '../../../translation/es/es';
import { dictionary as fr } from '../../../translation/fr/fr';
import { dictionary as ptBR } from '../../../translation/pt-BR/pt-BR';

describe('MSR audit operation', () => {
  it('defines the MSR code', () => {
    expect(auditLogOperations.memberSessionRevoked).toBe('MSR');
  });

  it('has a readable MSR string in every locale', () => {
    for (const dict of [en, de, es, fr, ptBR]) {
      expect(dict.auditLog.readableOperations.MSR).toBeTruthy();
    }
  });
});

describe('MSR readable rendering', () => {
  it('fills all placeholders (no literal braces left)', () => {
    const row: any = {
      operation: 'MSR',
      entityName: 'Member',
      entityId: 'member-1',
      memberId: 'admin-1', // different from entityId -> not a self-action
      authorFirstName: 'Ada',
      authorLastName: 'Lovelace',
      authorEmail: 'ada@example.com',
      newData: { sessionId: 's1' },
      oldData: null,
    };
    const result = auditLogReadableOperation(row, en as any, 'en' as any);
    expect(result).not.toContain('{');
    expect(result).toContain('Ada');
  });
});
