import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as OTPAuth from 'otpauth';

vi.mock('../../../shared/lib/sendEmail', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

import { sendEmail } from '../../../shared/lib/sendEmail';
import { authBackend } from '../authBackend';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { cookiesFromSetCookie } from '../../../test/testAuthCookies';

const PASSWORD = 'TestPassword123!';

let counter = 0;
async function signUpUser() {
  counter += 1;
  const email = `two-factor-${counter}@example.com`;
  const result = await authBackend.api.signUpEmail({
    body: { email, password: PASSWORD, name: 'Two Factor User' },
    returnHeaders: true,
  });
  const headers = new Headers({
    cookie: cookiesFromSetCookie(result.headers.get('set-cookie')),
  });
  const user = await prismaDangerouslyBypassRLS.user.findUniqueOrThrow({
    where: { email },
  });
  return { email, headers, userId: user.id };
}

function totpFromUri(totpURI: string) {
  return OTPAuth.URI.parse(totpURI) as OTPAuth.TOTP;
}

async function enableAndVerify(headers: Headers) {
  const enableResult = await authBackend.api.enableTwoFactor({
    body: { password: PASSWORD },
    headers,
  });
  const totp = totpFromUri(enableResult.totpURI);
  // verifyTOTP rotates the session (creates new session, deletes old one);
  // capture the new session cookie and update headers in-place so callers
  // can keep using the same Headers reference for subsequent API calls.
  const verifyResult = await authBackend.api.verifyTOTP({
    body: { code: totp.generate() },
    headers,
    returnHeaders: true,
  });
  const newCookie = cookiesFromSetCookie(
    verifyResult.headers?.get('set-cookie'),
  );
  if (newCookie) headers.set('cookie', newCookie);
  return { totp, backupCodes: enableResult.backupCodes };
}

describe('authTwoFactor', () => {
  beforeEach(() => {
    vi.mocked(sendEmail).mockClear();
  });

  it('enables 2FA after TOTP verification and disables it again', async () => {
    const { headers, userId } = await signUpUser();

    const enableResult = await authBackend.api.enableTwoFactor({
      body: { password: PASSWORD },
      headers,
    });
    expect(enableResult.totpURI).toContain('otpauth://totp/');
    expect(enableResult.backupCodes.length).toBeGreaterThan(0);

    // not enabled until first verification
    let user = await prismaDangerouslyBypassRLS.user.findUniqueOrThrow({
      where: { id: userId },
    });
    expect(user.twoFactorEnabled).toBe(false);

    const totp = totpFromUri(enableResult.totpURI);
    // verifyTOTP rotates the session cookie; capture and update headers
    const verifyResult = await authBackend.api.verifyTOTP({
      body: { code: totp.generate() },
      headers,
      returnHeaders: true,
    });
    const newCookie = cookiesFromSetCookie(
      verifyResult.headers?.get('set-cookie'),
    );
    if (newCookie) headers.set('cookie', newCookie);

    user = await prismaDangerouslyBypassRLS.user.findUniqueOrThrow({
      where: { id: userId },
    });
    expect(user.twoFactorEnabled).toBe(true);
    expect(
      await prismaDangerouslyBypassRLS.twoFactor.findFirst({
        where: { userId },
      }),
    ).not.toBeNull();

    await authBackend.api.disableTwoFactor({
      body: { password: PASSWORD },
      headers,
    });
    user = await prismaDangerouslyBypassRLS.user.findUniqueOrThrow({
      where: { id: userId },
    });
    expect(user.twoFactorEnabled).toBe(false);
    expect(
      await prismaDangerouslyBypassRLS.twoFactor.findFirst({
        where: { userId },
      }),
    ).toBeNull();
  });

  it('returns twoFactorRedirect on password sign-in when 2FA is enabled', async () => {
    const { email, headers } = await signUpUser();
    await enableAndVerify(headers);

    const signInResult: any = await authBackend.api.signInEmail({
      body: { email, password: PASSWORD },
    });
    expect(signInResult.twoFactorRedirect).toBe(true);
  });

  it('sends the OTP email through sendEmail', async () => {
    const { email, headers } = await signUpUser();
    await enableAndVerify(headers);

    const signInResult = await authBackend.api.signInEmail({
      body: { email, password: PASSWORD },
      returnHeaders: true,
    });
    const twoFactorHeaders = new Headers({
      cookie: cookiesFromSetCookie(signInResult.headers.get('set-cookie')),
    });

    // isolate the OTP email from the sign-up verification email
    vi.mocked(sendEmail).mockClear();

    await authBackend.api.sendTwoFactorOTP({
      body: {},
      headers: twoFactorHeaders,
    });

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(vi.mocked(sendEmail).mock.calls[0][0]).toBe(email);
    // subject + content come from the dictionary; content carries the code
    expect(String(vi.mocked(sendEmail).mock.calls[0][3])).toMatch(/\d{6}/);
  });

  it('accepts a backup code only once', async () => {
    const { email, headers } = await signUpUser();
    const { backupCodes } = await enableAndVerify(headers);
    const code = backupCodes[0];

    const signIn = async () => {
      const r = await authBackend.api.signInEmail({
        body: { email, password: PASSWORD },
        returnHeaders: true,
      });
      return new Headers({
        cookie: cookiesFromSetCookie(r.headers.get('set-cookie')),
      });
    };

    const firstAttemptHeaders = await signIn();
    await authBackend.api.verifyBackupCode({
      body: { code },
      headers: firstAttemptHeaders,
    });

    const secondAttemptHeaders = await signIn();
    await expect(
      authBackend.api.verifyBackupCode({
        body: { code },
        headers: secondAttemptHeaders,
      }),
    ).rejects.toThrow(/backup code/i);
  });

  it('writes audit log rows for enable, regenerate, and disable', async () => {
    const { headers, userId } = await signUpUser();
    await enableAndVerify(headers);

    await authBackend.api.generateBackupCodes({
      body: { password: PASSWORD },
      headers,
    });
    await authBackend.api.disableTwoFactor({
      body: { password: PASSWORD },
      headers,
    });

    for (const operation of ['TFE', 'TFB', 'TFD']) {
      const row = await prismaDangerouslyBypassRLS.auditLog.findFirst({
        where: { operation, userId },
      });
      expect(row, `audit row for ${operation}`).not.toBeNull();
    }
  });
});
