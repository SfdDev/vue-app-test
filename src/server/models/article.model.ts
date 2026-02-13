export interface ArticleRecord {
  id: number;
  title: string;
  content: string;
  author_id: number;
  image_url: string | null;
  created_at: string;
  updated_at: string | null;
  is_published: boolean;
  author_name?: string;
}

export interface PaginatedArticles {
  data: ArticleRecord[];
  total: number;
}

export interface DbPool {
  query<T = any>(
    query: string | { text: string; values?: any[] },
    values?: any[],
  ): Promise<{ rows: T[] }>;
}

export interface ArticleModelDependencies {
  pool: DbPool;
}

export function createArticleModel({ pool }: ArticleModelDependencies) {
  async function create(title: string, content: string, userId: number, imageUrl: string | null) {
    const query = {
      text: `
        INSERT INTO articles(title, content, author_id, image_url, is_published, created_at)
        VALUES($1, $2, $3, $4, true, CURRENT_TIMESTAMP)
        RETURNING *
      `,
      values: [title, content, userId, imageUrl],
    };
    const result = await pool.query<ArticleRecord>(query);
    return result.rows[0];
  }

  async function getAll(page = 1, perPage = 6): Promise<ArticleRecord[]> {
    const offset = (page - 1) * perPage;
    const query = {
      text: `
        SELECT a.*, u.username as author_name
        FROM articles a
        JOIN users u ON a.author_id = u.id
        WHERE a.is_published = true
        ORDER BY a.created_at DESC
        LIMIT $1 OFFSET $2
      `,
      values: [perPage, offset],
    };
    const result = await pool.query<ArticleRecord>(query);
    return result.rows;
  }

  async function getById(id: number): Promise<ArticleRecord | undefined> {
    const query = {
      text: `
        SELECT a.*, u.username as author_name
        FROM articles a
        JOIN users u ON a.author_id = u.id
        WHERE a.id = $1
      `,
      values: [id],
    };
    const result = await pool.query<ArticleRecord>(query);
    return result.rows[0];
  }

  async function getIndexById(id: number): Promise<number> {
    const query = {
      text: `
        SELECT row_number - 1 AS index
        FROM (
          SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS row_number
          FROM articles
          WHERE is_published = true
        ) sub
        WHERE id = $1
      `,
      values: [id],
    };
    const result = await pool.query<{ index: number }>(query);
    if (result.rows.length === 0) {
      throw new Error('Article not found');
    }
    return result.rows[0].index;
  }

  async function getCount(): Promise<number> {
    const query = {
      text: 'SELECT COUNT(*) as total FROM articles WHERE is_published = true',
    };
    const result = await pool.query<{ total: string }>(query);
    return Number.parseInt(result.rows[0].total, 10);
  }

  async function getAllAdmin(page = 1, perPage = 6): Promise<ArticleRecord[]> {
    const offset = (page - 1) * perPage;
    const query = {
      text: `
        SELECT a.*, u.username as author_name
        FROM articles a
        JOIN users u ON a.author_id = u.id
        ORDER BY a.created_at DESC
        LIMIT $1 OFFSET $2
      `,
      values: [perPage, offset],
    };
    const result = await pool.query<ArticleRecord>(query);
    return result.rows;
  }

  async function getCountAdmin(): Promise<number> {
    const query = {
      text: 'SELECT COUNT(*) as total FROM articles',
    };
    const result = await pool.query<{ total: string }>(query);
    return Number.parseInt(result.rows[0].total, 10);
  }

  async function update(
    id: number,
    userId: number,
    updateData: { title?: string; content?: string; image_url?: string | null },
  ): Promise<ArticleRecord | null> {
    const query = {
      text: `
        UPDATE articles
        SET title = COALESCE($1, title),
            content = COALESCE($2, content),
            image_url = COALESCE($3, image_url),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 AND author_id = $5
        RETURNING *
      `,
      values: [updateData.title ?? null, updateData.content ?? null, updateData.image_url ?? null, id, userId],
    };
    const result = await pool.query<ArticleRecord>(query);
    return result.rows[0] ?? null;
  }

  async function remove(id: number, userId: number): Promise<ArticleRecord | null> {
    const query = {
      text: 'DELETE FROM articles WHERE id = $1 AND author_id = $2 RETURNING *',
      values: [id, userId],
    };
    const result = await pool.query<ArticleRecord>(query);
    return result.rows[0] ?? null;
  }

  return {
    create,
    getAll,
    getAllAdmin,
    getById,
    getIndexById,
    getCount,
    getCountAdmin,
    update,
    remove,
  };
}

