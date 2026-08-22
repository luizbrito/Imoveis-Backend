import { z } from 'zod';

export const authSignInFormSchema = z.object({
  email: z.email().min(1).trim(),
  password: z.string().min(8),
  recaptchaToken: z.string().optional(),
});

export const authSignUpFormSchema = z.object({
  email: z.email().min(1).trim(),
  password: z.string().min(8),
  recaptchaToken: z.string().optional(),
});

export const authPasswordResetRequestFormSchema = z.object({
  email: z.email().min(1).trim(),
  recaptchaToken: z.string().optional(),
});

export const authPasswordResetConfirmFormSchema = z.object({
  password: z.string().min(8),
  recaptchaToken: z.string().optional(),
});
