export interface DbPool {
  query<T = any>(
    query: string | { text: string; values?: any[] },
    values?: any[],
  ): Promise<{ rows: T[] }>;
}

export interface UserRecord {
  id: number;
  username: string;
  email: string;
  password_hash?: string;
  is_admin: boolean;
}

export interface UserModelDependencies {
  pool: DbPool;
}

export function createUserModel({ pool }: UserModelDependencies) {
  async function create(username: string, passwordHash: string): Promise<UserRecord> {
    const query = {
      text: 'INSERT INTO users(username, email, password_hash, is_admin) VALUES($1, $2, $3, $4) RETURNING id, username, email, is_admin',
      values: [username, `${username}@example.com`, passwordHash, false],
    };
    const result = await pool.query<UserRecord>(query);
    return result.rows[0];
  }

  async function findByUsername(username: string): Promise<UserRecord | undefined> {
    const query = {
      text: 'SELECT id, username, email, password_hash, is_admin FROM users WHERE username = $1',
      values: [username],
    };
    const result = await pool.query<UserRecord>(query);
    return result.rows[0];
  }

  async function findById(id: number): Promise<UserRecord | undefined> {
    const query = {
      text: 'SELECT id, username, email, is_admin FROM users WHERE id = $1',
      values: [id],
    };
    const result = await pool.query<UserRecord>(query);
    return result.rows[0];
  }

  async function exists(username: string): Promise<boolean> {
    const query = {
      text: 'SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)',
      values: [username],
    };
    const result = await pool.query<{ exists: boolean }>(query);
    return result.rows[0].exists;
  }

  return {
    create,
    findByUsername,
    findById,
    exists,
  };
}

