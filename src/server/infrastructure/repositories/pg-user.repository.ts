import type { User, UserWithPassword } from '../../domain/user';
import type { UserRepository } from '../../ports/user.repository';
import type { DbPool } from '../db/pool';

export class PgUserRepository implements UserRepository {
  constructor(private readonly pool: DbPool) {}

  async create(username: string, passwordHash: string): Promise<User> {
    const result = await this.pool.query<User>({
      text: 'INSERT INTO users(username, email, password_hash, is_admin) VALUES($1, $2, $3, $4) RETURNING id, username, email, is_admin',
      values: [username, `${username}@example.com`, passwordHash, false],
    });
    return result.rows[0];
  }

  async findByUsername(username: string): Promise<UserWithPassword | null> {
    const result = await this.pool.query<UserWithPassword>({
      text: 'SELECT id, username, email, password_hash, is_admin FROM users WHERE username = $1',
      values: [username],
    });
    return result.rows[0] ?? null;
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.pool.query<User>({
      text: 'SELECT id, username, email, is_admin FROM users WHERE id = $1',
      values: [id],
    });
    return result.rows[0] ?? null;
  }

  async exists(username: string): Promise<boolean> {
    const result = await this.pool.query<{ exists: boolean }>({
      text: 'SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)',
      values: [username],
    });
    return result.rows[0].exists;
  }
}
