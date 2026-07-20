import type { H3Event } from 'h3';
import type { AuthUser } from '../../domain/user';
import { tokenService } from '../../composition/container';

export function getUserFromRequest(event: H3Event): AuthUser | null {
  const authHeader = event.node.req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  return tokenService.verify(token);
}
