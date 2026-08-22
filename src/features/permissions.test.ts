import { describe, it, expect } from 'vitest';
import { roles, accessControlStatement } from './permissions';

describe('memberSession permission', () => {
  it('exposes read+revoke on the resource', () => {
    expect(accessControlStatement.memberSession).toEqual(['read', 'revoke']);
  });

  it('admin can read and revoke member sessions', () => {
    expect(roles.admin.authorize({ memberSession: ['read'] }).success).toBe(
      true,
    );
    expect(roles.admin.authorize({ memberSession: ['revoke'] }).success).toBe(
      true,
    );
  });

  it('member cannot read or revoke member sessions', () => {
    expect(roles.member.authorize({ memberSession: ['read'] }).success).toBe(
      false,
    );
    expect(roles.member.authorize({ memberSession: ['revoke'] }).success).toBe(
      false,
    );
  });
});
