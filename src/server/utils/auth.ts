import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface JwtUserPayload {
  id: number;
  username: string;
  is_admin: boolean;
}

export function getUserFromRequest(event: any): JwtUserPayload | null {
  const authHeader = event.node.req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as JwtUserPayload;
  } catch {
    return null;
  }
}

export function requireAuth(event: any): JwtUserPayload {
  const user = getUserFromRequest(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Требуется авторизация' });
  }
  return user;
}

export function requireAdmin(event: any): JwtUserPayload {
  const user = requireAuth(event);
  if (!user.is_admin) {
    throw createError({ statusCode: 403, statusMessage: 'Требуются права администратора' });
  }
  return user;
}

