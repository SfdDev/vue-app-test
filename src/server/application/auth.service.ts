import { ConflictError, NotFoundError, ValidationError } from '../domain/errors';
import type { AuthUser } from '../domain/user';
import type { CaptchaVerifier } from '../ports/captcha.verifier';
import type { PasswordHasher } from '../ports/password-hasher';
import type { TokenService } from '../ports/token.service';
import type { UserRepository } from '../ports/user.repository';

export class AuthApplicationService {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokens: TokenService,
    private readonly captcha: CaptchaVerifier,
  ) {}

  async register(username: string, password: string, recaptcha: string): Promise<AuthUser> {
    const isRecaptchaValid = await this.captcha.verify(recaptcha);
    if (!isRecaptchaValid) {
      throw new ValidationError('Ошибка проверки reCAPTCHA');
    }

    const existingUser = await this.users.findByUsername(username);
    if (existingUser) {
      throw new ConflictError('Пользователь уже существует');
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const user = await this.users.create(username, passwordHash);

    return {
      id: user.id,
      username: user.username,
      is_admin: user.is_admin,
    };
  }

  async login(username: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const user = await this.users.findByUsername(username);
    if (!user?.password_hash) {
      throw new ValidationError('Неверное имя пользователя или пароль');
    }

    const validPassword = await this.passwordHasher.compare(password, user.password_hash);
    if (!validPassword) {
      throw new ValidationError('Неверное имя пользователя или пароль');
    }

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      is_admin: user.is_admin,
    };

    return {
      token: this.tokens.sign(authUser),
      user: authUser,
    };
  }

  async getCurrentUser(userId: number): Promise<AuthUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }
    return {
      id: user.id,
      username: user.username,
      is_admin: user.is_admin,
    };
  }

  async checkUsername(username: string): Promise<boolean> {
    return this.users.exists(username);
  }
}
