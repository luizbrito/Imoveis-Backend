import { Hono } from 'hono';
import { authBackend } from './authBackend';

// Better Auth handles all authentication endpoints and routing
// Including: sign-in, sign-up, OAuth, password reset, email verification, sessions
// Organization endpoints: create, list, update, delete, set-active
// Member endpoints: invite, list, remove, update-role
// Invitation endpoints: accept, reject, cancel
// Documentation: https://www.better-auth.com/docs
export const authRoutes = new Hono();

authRoutes.all('/*', (c) => {
  return authBackend.handler(c.req.raw);
});
