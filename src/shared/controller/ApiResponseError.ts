import { Prisma } from '../../prisma/generated/client';
import { Context } from 'hono';
import { prismaErrorParser } from '../../prisma/prismaErrorParser';
import { AppContext } from './appContext';

import { ContentfulStatusCode } from 'hono/utils/http-status';
import { dictionary } from '../../translation/en/en';
import { Dictionary } from '../../translation/locales';
import { ZodError } from 'zod';
import { auditLogApiKeyCall } from '../../features/auditLog/auditLogApiKeyCall';
import { ORGANIZATION_REQUIRES_TWO_FACTOR } from '../../features/auth/authConstants';
import { env } from '../../env';

export async function ApiResponseError(
  c: Context,
  context: AppContext | undefined,
  error: Error & { code?: number },
) {
  let statusCode = 500;

  if (error instanceof ZodError) {
    console.debug(error);
    statusCode = 400;

    if (context?.apiKey?.id) {
      await auditLogApiKeyCall(c, context, statusCode);
    }

    return c.json(error, statusCode as ContentfulStatusCode);
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.debug(error);
    statusCode = 400;

    if (context?.apiKey?.id) {
      await auditLogApiKeyCall(c, context, statusCode);
    }

    return c.json(
      { errors: [prismaErrorParser(error)] },
      statusCode as ContentfulStatusCode,
    );
  } else if (error?.code && [400, 401, 403, 404].includes(error.code)) {
    console.debug(error);
    statusCode = error.code;

    if (context?.apiKey?.id) {
      await auditLogApiKeyCall(c, context, statusCode);
    }

    // Override message for 403 errors to prevent leaking internal details.
    // Whitelisted codes are part of the client contract (the frontend reacts
    // to them) and carry no internal information.
    const SAFE_403_MESSAGES = [ORGANIZATION_REQUIRES_TWO_FACTOR];
    const errorMessage =
      error.code === 403 && !SAFE_403_MESSAGES.includes(error.message)
        ? 'Forbidden'
        : error.message;

    return c.json(
      wrapErrorMessage(context?.dictionary, errorMessage),
      statusCode as ContentfulStatusCode,
    );
  } else {
    console.error(error);
    statusCode = 500;
    const isProduction = env.NODE_ENV === 'production';

    if (context?.apiKey?.id) {
      await auditLogApiKeyCall(c, context, statusCode);
    }

    // In production, return a generic error message to prevent leaking internal details
    return c.json(
      wrapErrorMessage(
        context?.dictionary,
        isProduction ? undefined : error.message,
      ),
      statusCode as ContentfulStatusCode,
    );
  }
}

function wrapErrorMessage(t?: Dictionary, message?: string) {
  return {
    errors: [
      {
        message:
          message ||
          t?.shared.errors.unknown ||
          dictionary.shared.errors.unknown,
      },
    ],
  };
}
