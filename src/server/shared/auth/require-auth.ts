import type { H3Event } from 'h3';
import type { AuthUser } from '../../domain/user';
import { getUserFromRequest } from './get-user';

export function requireAuth(event: H3Event): AuthUser {
  const user = getUserFromRequest(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Требуется авторизация' });
  }
  return user;
}
