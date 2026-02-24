export interface ArticleRecord {
  id: number;
  title: string;
  content: string;
  author_id: number;
  image_url: string | null;
  category_id: number | null;
  created_at: string;
  updated_at: string | null;
  is_published: boolean;
  author_name?: string;
  category_name?: string;
  category_slug?: string;
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
  async function create(title: string, content: string, userId: number, imageUrl: string | null, isPublished: boolean, categoryId: number | null = null) {
    const query = {
      text: `
        INSERT INTO articles(title, content, author_id, image_url, is_published, category_id, created_at)
        VALUES($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        RETURNING *
      `,
      values: [title, content, userId, imageUrl, isPublished, categoryId],
    };
    const result = await pool.query<ArticleRecord>(query);
    return result.rows[0];
  }

  async function getAll(page = 1, perPage = 6, categoryId: number | null = null): Promise<ArticleRecord[]> {
    const offset = (page - 1) * perPage;
    
    let whereClause = 'WHERE a.is_published = true';
    const values = [perPage, offset];
    
    if (categoryId) {
      whereClause += ' AND a.category_id = $3';
      values.push(categoryId);
    }
    
    const query = {
      text: `
        SELECT a.*, u.username as author_name, c.name as category_name, c.slug as category_slug
        FROM articles a
        JOIN users u ON a.author_id = u.id
        LEFT JOIN categories c ON a.category_id = c.id
        ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT $1 OFFSET $2
      `,
      values: values,
    };
    const result = await pool.query<ArticleRecord>(query);
    return result.rows;
  }

  async function getById(id: number): Promise<ArticleRecord | undefined> {
    const query = {
      text: `
        SELECT a.*, u.username as author_name, c.name as category_name, c.slug as category_slug
        FROM articles a
        JOIN users u ON a.author_id = u.id
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.id = $1 AND a.is_published = true
      `,
      values: [id],
    };
    const result = await pool.query<ArticleRecord>(query);
    return result.rows[0];
  }

  async function getByIdAdmin(id: number): Promise<ArticleRecord | undefined> {
    const query = {
      text: `
        SELECT a.*, u.username as author_name, c.name as category_name, c.slug as category_slug
        FROM articles a
        JOIN users u ON a.author_id = u.id
        LEFT JOIN categories c ON a.category_id = c.id
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

  async function getAllAdmin(page = 1, perPage = 6, categoryId: number | null = null): Promise<ArticleRecord[]> {
    const offset = (page - 1) * perPage;
    
    let whereClause = '';
    const values = [perPage, offset];
    
    if (categoryId) {
      whereClause = 'WHERE a.category_id = $3';
      values.push(categoryId);
    }
    
    const query = {
      text: `
        SELECT a.*, u.username as author_name, c.name as category_name, c.slug as category_slug
        FROM articles a
        JOIN users u ON a.author_id = u.id
        LEFT JOIN categories c ON a.category_id = c.id
        ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT $1 OFFSET $2
      `,
      values: values,
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
    updateData: { title?: string; content?: string; image_url?: string | null; category_id?: number | null },
    isPublished?: boolean  // Добавляем опциональный параметр
  ): Promise<ArticleRecord | null> {
    // Динамически строим запрос в зависимости от того, передан ли isPublished
    let queryText = `
      UPDATE articles
      SET title = COALESCE($1, title),
          content = COALESCE($2, content),
          image_url = COALESCE($3, image_url),
          category_id = COALESCE($4, category_id),
          updated_at = CURRENT_TIMESTAMP
    `;
    
    const values: any[] = [
      updateData.title ?? null, 
      updateData.content ?? null, 
      updateData.image_url ?? null,
      updateData.category_id ?? null
    ];
    let paramIndex = 5;
    
    if (isPublished !== undefined) {
      queryText += `, is_published = $${paramIndex}`;
      values.push(isPublished);
      paramIndex++;
    }
    
    queryText += ` WHERE id = $${paramIndex} AND author_id = $${paramIndex + 1} RETURNING *`;
    values.push(id, userId);
    
    const query = {
      text: queryText,
      values: values,
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
    getByIdAdmin,
    getIndexById,
    getCount,
    getCountAdmin,
    update,
    remove,
  };
}

