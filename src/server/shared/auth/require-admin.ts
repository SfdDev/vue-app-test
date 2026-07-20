import type { H3Event } from 'h3';
import type { AuthUser } from '../../domain/user';
import { requireAuth } from './require-auth';

export function requireAdmin(event: H3Event): AuthUser {
  const user = requireAuth(event);
  if (!user.is_admin) {
    throw createError({ statusCode: 403, statusMessage: 'Требуются права администратора' });
  }
  return user;
}
