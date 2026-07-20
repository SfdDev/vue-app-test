import type { AuthUser } from '../domain/user';

export interface TokenService {
  sign(payload: AuthUser): string;
  verify(token: string): AuthUser | null;
}
