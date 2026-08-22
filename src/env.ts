import { z } from 'zod';
import { configFrontendUrlValidator } from './features/config/configFrontendUrlValidator';
import { rolesIds } from './features/permissions';

const envSchema = z
  .object({
    // Server Configuration
    PORT: z.string().optional(),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .optional()
      .default('development'),

    // Database Configuration
    // Connection URL for the RLS-enforced user
    DATABASE_RLS_URL: z.string().min(1, 'DATABASE_RLS_URL is required'),
    DATABASE_RLS_USER: z.string().optional(),
    DATABASE_RLS_PASSWORD: z.string().optional(),
    // Connection URL for user with BYPASSRLS privilege
    DATABASE_BYPASS_RLS_URL: z
      .string()
      .min(1, 'DATABASE_BYPASS_RLS_URL is required'),
    // Connection URL for migrations (postgres superuser)
    DATABASE_MIGRATION_URL: z
      .string()
      .min(1, 'DATABASE_MIGRATION_URL is required'),
    DATABASE_NAME: z.string().optional(),
    DATABASE_SCHEMA: z.string().optional().default('public'),
    // Schema for pg-boss background jobs. Must be different from DATABASE_SCHEMA
    // to avoid conflicts with application tables and RLS policies.
    DATABASE_SCHEMA_JOBS: z.string().optional().default('pgboss'),

    // Redis Configuration
    REDIS_URL: z.string().optional(),

    // Authentication
    AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
    AUTH_BYPASS_EMAIL_VERIFICATION: z
      .string()
      .optional()
      .transform((val) => val === 'true'),

    // OAuth - Google
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),

    // Email Configuration
    EMAIL_FROM: z.string().optional(),
    EMAIL_SMTP_HOST: z.string().optional(),
    EMAIL_SMTP_PORT: z.string().optional(),
    EMAIL_SMTP_USER: z.string().optional(),
    EMAIL_SMTP_PASSWORD: z.string().optional(),

    // URLs
    // Examples:
    // - Standard: http://localhost:3011
    // - Multi-domain subdomain: https://project.localhost
    BACKEND_URL: z.string().optional(),

    // FRONTEND_URL supports wildcard format for subdomain-based organizations:
    // - Standard: http://localhost:5173, https://example.com
    // - Caddy (HTTPS proxy): https://ui.localhost
    // - Multi-domain subdomain (ORGANIZATION_MODE=multi-domain, ORGANIZATION_MULTI_DOMAIN_MODE=subdomain):
    //   Use wildcard: https://*.project.localhost
    //   Allows: https://org1.project.localhost, https://org2.project.localhost, etc.
    FRONTEND_URL: configFrontendUrlValidator,

    // Recaptcha
    RECAPTCHA_SECRET_KEY: z.string().optional(),
    RECAPTCHA_SITE_KEY: z.string().optional(),

    // Organization Mode
    ORGANIZATION_MODE: z
      .enum(['single', 'multi', 'multi-domain'])
      .optional()
      .default('multi'),
    ORGANIZATION_MULTI_DOMAIN_MODE: z
      .enum(['subdomain', 'domain'])
      .optional()
      .default('subdomain'),

    // Organization Domain Trusted Origins (for multi-domain mode with domain-based organizations)
    // Comma-separated list of allowed origins when ORGANIZATION_MODE=multi-domain and ORGANIZATION_MULTI_DOMAIN_MODE=domain
    // Example: https://org1.com,https://org2.com,https://org3.com
    ORGANIZATION_DOMAIN_TRUSTED_ORIGINS: z
      .string()
      .optional()
      .transform((val) => {
        if (!val || val.trim() === '') return [];
        return val.split(',').map((origin) => origin.trim());
      }),

    ORGANIZATION_DEFAULT_ROLE: z
      .string()
      .optional()
      .transform((val) => (val === '' ? undefined : val))
      .pipe(z.enum(rolesIds).optional()),

    // Subscription
    SUBSCRIPTION_MODE: z
      .enum(['disabled', 'organization', 'member'])
      .optional()
      .default('disabled'),

    // Stripe
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_PUBLISHABLE_KEY: z.string().optional(),

    // S3 File Storage (AWS S3 or S3-compatible: Minio, Cloudflare R2, Backblaze B2, etc.)
    // Optional to allow localhost development without S3 setup
    //
    // Two buckets are used:
    // - S3_BUCKET_PUBLIC: For files with publicRead (avatars, logos). Anonymous download enabled.
    // - S3_BUCKET_PRIVATE: For private files. Requires signed URLs for access.
    //
    // Local Development (MinIO via Docker Compose):
    // - S3_BUCKET_PUBLIC=project-public
    // - S3_BUCKET_PRIVATE=project-private
    // - S3_ACCESS_KEY_ID=app_user
    // - S3_SECRET_ACCESS_KEY=app_password123
    // - S3_REGION=us-east-1
    // - S3_ENDPOINT=http://localhost:9000
    //
    // Production (AWS S3):
    // - S3_BUCKET_PUBLIC=your-public-bucket
    // - S3_BUCKET_PRIVATE=your-private-bucket
    // - S3_ACCESS_KEY_ID=your-access-key-id
    // - S3_SECRET_ACCESS_KEY=your-secret-access-key
    // - S3_REGION=us-east-1
    // - S3_ENDPOINT= (leave empty for AWS S3)
    //
    // For other S3-compatible services, set S3_ENDPOINT:
    // - Minio: http://localhost:9000
    // - Cloudflare R2: https://<account-id>.r2.cloudflarestorage.com
    // - Backblaze B2: https://s3.<region>.backblazeb2.com
    // - DigitalOcean Spaces: https://<region>.digitaloceanspaces.com
    //
    // CORS Configuration Required:
    // Both S3 buckets must have CORS configured to allow uploads from your frontend domain.
    // Example CORS configuration (JSON):
    // [
    //   {
    //     "AllowedOrigins": ["http://localhost:5173", "https://yourdomain.com"],
    //     "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    //     "AllowedHeaders": ["*"],
    //     "ExposeHeaders": ["ETag"]
    //   }
    // ]
    S3_BUCKET_PUBLIC: z.string().optional(),
    S3_BUCKET_PRIVATE: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_REGION: z.string().optional().default('us-east-1'),
    S3_ENDPOINT: z.string().optional(),

    // Anthropic API (for AI Chatbot)
    ANTHROPIC_API_KEY: z.string().optional(),

    // Chatbot Token Limits (tokens per day)
    CHATBOT_DAILY_TOKEN_LIMIT_USER: z.string().optional().default('50000'),
    CHATBOT_DAILY_TOKEN_LIMIT_ORGANIZATION: z
      .string()
      .optional()
      .default('1000000'),
    CHATBOT_DAILY_TOKEN_LIMIT_GLOBAL: z.string().optional().default('1000000'),

    // Push Notifications
    // Enable push notifications for web and mobile apps
    PUSH_NOTIFICATIONS_ENABLED: z
      .string()
      .optional()
      .default('false')
      .transform((val) => val === 'true'),

    // VAPID keys for web push notifications (generate with: npx web-push generate-vapid-keys)
    VAPID_PUBLIC_KEY: z.string().optional(),
    VAPID_PRIVATE_KEY: z.string().optional(),

    // Expo Access Token for mobile push notifications (get from https://expo.dev/accounts/[account]/settings/access-tokens)
    // Optional for development, recommended for production to avoid rate limits
    EXPO_ACCESS_TOKEN: z.string().optional(),

    // Background job processing mode:
    // - 'worker': pgBoss worker process (requires separate worker, run `pnpm worker:dev`)
    // - 'cron': external cron calls /api/background-jobs/process endpoint
    // - 'inline': process immediately after adding to queue (blocking, no external deps)
    BACKGROUND_JOB_MODE: z
      .enum(['worker', 'cron', 'inline'])
      .optional()
      .default('worker'),

    // Cron Secret for background job processing endpoint
    // Used to authenticate requests to /api/background-jobs/process (required for cron mode)
    CRON_SECRET: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.BACKGROUND_JOB_MODE === 'cron' && !data.CRON_SECRET) {
        return false;
      }
      return true;
    },
    {
      message: 'CRON_SECRET is required when BACKGROUND_JOB_MODE is "cron"',
      path: ['CRON_SECRET'],
    },
  )
  .refine(
    (data) => {
      const hasS3Config = data.S3_ACCESS_KEY_ID || data.S3_SECRET_ACCESS_KEY;
      if (hasS3Config) {
        return data.S3_BUCKET_PUBLIC && data.S3_BUCKET_PRIVATE;
      }
      return true;
    },
    {
      message:
        'Both S3_BUCKET_PUBLIC and S3_BUCKET_PRIVATE are required when using S3 storage',
      path: ['S3_BUCKET_PUBLIC'],
    },
  );

function validateAndParseEnv(): z.infer<typeof envSchema> {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((err) => `  ❌ ${err.path.join('.')}: ${err.message}`)
        .join('\n');

      throw new Error(
        `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `⚠️  Environment Variable Validation Failed\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `${errorMessages}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Please check your .env file and ensure all required\n` +
          `environment variables are properly configured.\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`,
      );
    }
    throw error;
  }
}

/**
 * Use this instead of process.env for type safety and validation
 */
export const env = validateAndParseEnv();

export type Env = z.infer<typeof envSchema>;
