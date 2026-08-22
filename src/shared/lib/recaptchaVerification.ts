import { Error400 } from '../errors/Error400';

import { Dictionary } from '../../translation/locales';
import { env } from '../../env';

export async function recaptchaVerification(
  recaptchaToken: string | undefined,
  dictionary: Dictionary,
) {
  const isEnabled = Boolean(env.RECAPTCHA_SECRET_KEY);

  if (!isEnabled) {
    console.debug(dictionary.recaptcha.errors.disabled);
    return;
  }

  if (!recaptchaToken) {
    throw new Error400(dictionary.recaptcha.errors.invalid);
  }

  const googleVerifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;

  try {
    const response = await fetch(googleVerifyURL, { method: 'post' });
    const data: any = await response.json();
    const { success } = data;
    if (!Boolean(success)) {
      throw Error();
    }
  } catch (error) {
    throw new Error400(dictionary.recaptcha.errors.invalid);
  }
}
