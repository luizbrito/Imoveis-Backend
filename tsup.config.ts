import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts', 'src/workers.ts', 'src/app.ts'],
  format: ['esm'],
  target: 'es2023',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  splitting: false,
  bundle: true,
  // external: [
  //   '@prisma/client',
  //   'prisma',
  //   '@anthropic-ai/sdk',
  //   'bullmq',
  //   'ioredis',
  //   'nodemailer',
  //   'stripe',
  //   'web-push',
  //   '@aws-sdk/client-s3',
  //   '@aws-sdk/s3-presigned-post',
  //   '@aws-sdk/s3-request-presigner',
  // ],
  // noExternal: ['lodash-es'],
});
