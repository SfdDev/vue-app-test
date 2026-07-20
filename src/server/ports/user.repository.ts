import type { User, UserWithPassword } from '../domain/user';

export interface UserRepository {
  create(username: string, passwordHash: string): Promise<User>;
  findByUsername(username: string): Promise<UserWithPassword | null>;
  findById(id: number): Promise<User | null>;
  exists(username: string): Promise<boolean>;
}
