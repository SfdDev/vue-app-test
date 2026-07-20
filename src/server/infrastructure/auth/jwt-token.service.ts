import jwt from 'jsonwebtoken';
import type { AuthUser } from '../../domain/user';
import type { TokenService } from '../../ports/token.service';

export class JwtTokenService implements TokenService {
  constructor(private readonly secret: string) {}

  sign(payload: AuthUser): string {
    return jwt.sign(
      { id: payload.id, username: payload.username, is_admin: payload.is_admin },
      this.secret,
      { expiresIn: '1h' },
    );
  }

  verify(token: string): AuthUser | null {
    try {
      const payload = jwt.verify(token, this.secret) as AuthUser;
      return {
        id: payload.id,
        username: payload.username,
        is_admin: payload.is_admin,
      };
    } catch {
      return null;
    }
  }
}
