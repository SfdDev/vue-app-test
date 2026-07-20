import type { Article, CreateArticleInput, UpdateArticleInput } from '../../domain/article';
import type { ArticleRepository } from '../../ports/article.repository';
import { UNCATEGORIZED_CATEGORY_ID } from '../../../shared/category-filter';
import type { DbPool } from '../db/pool';

const ARTICLE_SELECT = `
  SELECT a.*, u.username as author_name, c.name as category_name, c.slug as category_slug
  FROM articles a
  JOIN users u ON a.author_id = u.id
  LEFT JOIN categories c ON a.category_id = c.id
`;

function appendCategoryFilter(
  whereClause: string,
  values: Array<number>,
  categoryId: number | null | undefined,
  nextParamIndex: number,
): { whereClause: string; values: Array<number> } {
  if (categoryId === UNCATEGORIZED_CATEGORY_ID) {
    const connector = whereClause ? `${whereClause} AND` : 'WHERE';
    return {
      whereClause: `${connector} a.category_id IS NULL`,
      values,
    };
  }

  if (categoryId != null && categoryId > 0) {
    const connector = whereClause ? `${whereClause} AND` : 'WHERE';
    values.push(categoryId);
    return {
      whereClause: `${connector} a.category_id = $${nextParamIndex}`,
      values,
    };
  }

  return { whereClause, values };
}

export class PgArticleRepository implements ArticleRepository {
  constructor(private readonly pool: DbPool) {}

  async create(input: CreateArticleInput): Promise<Article> {
    const result = await this.pool.query<{ id: number }>({
      text: `
        INSERT INTO articles(title, content, author_id, image_url, is_published, category_id, slug, created_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        RETURNING id
      `,
      values: [
        input.title,
        input.content,
        input.authorId,
        input.imageUrl,
        input.isPublished,
        input.categoryId,
        input.slug,
      ],
    });
    const created = await this.findById(result.rows[0].id);
    return created!;
  }

  async findPublishedPage(page: number, perPage: number, categoryId?: number | null): Promise<Article[]> {
    const offset = (page - 1) * perPage;
    const values: Array<number> = [perPage, offset];
    const filtered = appendCategoryFilter('WHERE a.is_published = true', values, categoryId, 3);

    const result = await this.pool.query<Article>({
      text: `
        ${ARTICLE_SELECT}
        ${filtered.whereClause}
        ORDER BY a.created_at DESC
        LIMIT $1 OFFSET $2
      `,
      values: filtered.values,
    });
    return result.rows;
  }

  async countPublished(categoryId?: number | null): Promise<number> {
    if (categoryId === UNCATEGORIZED_CATEGORY_ID) {
      const result = await this.pool.query<{ total: string }>({
        text: 'SELECT COUNT(*) as total FROM articles WHERE is_published = true AND category_id IS NULL',
      });
      return Number.parseInt(result.rows[0].total, 10);
    }

    if (categoryId != null && categoryId > 0) {
      const result = await this.pool.query<{ total: string }>({
        text: 'SELECT COUNT(*) as total FROM articles WHERE is_published = true AND category_id = $1',
        values: [categoryId],
      });
      return Number.parseInt(result.rows[0].total, 10);
    }

    const result = await this.pool.query<{ total: string }>({
      text: 'SELECT COUNT(*) as total FROM articles WHERE is_published = true',
    });
    return Number.parseInt(result.rows[0].total, 10);
  }

  async findByIdPublished(id: number): Promise<Article | null> {
    const result = await this.pool.query<Article>({
      text: `
        ${ARTICLE_SELECT}
        WHERE a.id = $1 AND a.is_published = true
      `,
      values: [id],
    });
    return result.rows[0] ?? null;
  }

  async findById(id: number): Promise<Article | null> {
    const result = await this.pool.query<Article>({
      text: `
        ${ARTICLE_SELECT}
        WHERE a.id = $1
      `,
      values: [id],
    });
    return result.rows[0] ?? null;
  }

  async findPublishedByPath(categorySlug: string, articleSlug: string): Promise<Article | null> {
    if (categorySlug === 'uncategorized' || categorySlug === 'bez-kategorii') {
      const result = await this.pool.query<Article>({
        text: `
          ${ARTICLE_SELECT}
          WHERE a.slug = $1 AND a.category_id IS NULL AND a.is_published = true
        `,
        values: [articleSlug],
      });
      return result.rows[0] ?? null;
    }

    const result = await this.pool.query<Article>({
      text: `
        ${ARTICLE_SELECT}
        WHERE a.slug = $1 AND c.slug = $2 AND a.is_published = true
      `,
      values: [articleSlug, categorySlug],
    });
    return result.rows[0] ?? null;
  }

  async slugExists(slug: string, excludeId?: number): Promise<boolean> {
    if (excludeId != null) {
      const result = await this.pool.query<{ exists: boolean }>({
        text: 'SELECT EXISTS(SELECT 1 FROM articles WHERE slug = $1 AND id <> $2) AS exists',
        values: [slug, excludeId],
      });
      return result.rows[0].exists;
    }

    const result = await this.pool.query<{ exists: boolean }>({
      text: 'SELECT EXISTS(SELECT 1 FROM articles WHERE slug = $1) AS exists',
      values: [slug],
    });
    return result.rows[0].exists;
  }

  async findAdminPage(page: number, perPage: number, categoryId?: number | null): Promise<Article[]> {
    const offset = (page - 1) * perPage;
    const values: Array<number> = [perPage, offset];
    const filtered = appendCategoryFilter('', values, categoryId, 3);

    const result = await this.pool.query<Article>({
      text: `
        ${ARTICLE_SELECT}
        ${filtered.whereClause}
        ORDER BY a.created_at DESC
        LIMIT $1 OFFSET $2
      `,
      values: filtered.values,
    });
    return result.rows;
  }

  async countAll(categoryId?: number | null): Promise<number> {
    if (categoryId === UNCATEGORIZED_CATEGORY_ID) {
      const result = await this.pool.query<{ total: string }>({
        text: 'SELECT COUNT(*) as total FROM articles WHERE category_id IS NULL',
      });
      return Number.parseInt(result.rows[0].total, 10);
    }

    if (categoryId != null && categoryId > 0) {
      const result = await this.pool.query<{ total: string }>({
        text: 'SELECT COUNT(*) as total FROM articles WHERE category_id = $1',
        values: [categoryId],
      });
      return Number.parseInt(result.rows[0].total, 10);
    }

    const result = await this.pool.query<{ total: string }>({
      text: 'SELECT COUNT(*) as total FROM articles',
    });
    return Number.parseInt(result.rows[0].total, 10);
  }

  async getPublishedIndex(id: number): Promise<number | null> {
    const result = await this.pool.query<{ index: number }>({
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
    });
    return result.rows[0]?.index ?? null;
  }

  async update(id: number, authorId: number, input: UpdateArticleInput): Promise<Article | null> {
    let queryText = `
      UPDATE articles
      SET title = COALESCE($1, title),
          content = COALESCE($2, content),
          image_url = COALESCE($3, image_url),
          category_id = COALESCE($4, category_id),
          updated_at = CURRENT_TIMESTAMP
    `;

    const values: Array<string | number | boolean | null> = [
      input.title ?? null,
      input.content ?? null,
      input.imageUrl ?? null,
      input.categoryId ?? null,
    ];
    let paramIndex = 5;

    if (input.slug !== undefined) {
      queryText += `, slug = $${paramIndex}`;
      values.push(input.slug);
      paramIndex++;
    }

    if (input.isPublished !== undefined) {
      queryText += `, is_published = $${paramIndex}`;
      values.push(input.isPublished);
      paramIndex++;
    }

    queryText += ` WHERE id = $${paramIndex} AND author_id = $${paramIndex + 1} RETURNING id`;
    values.push(id, authorId);

    const result = await this.pool.query<{ id: number }>({
      text: queryText,
      values,
    });
    if (!result.rows[0]) {
      return null;
    }
    return this.findById(result.rows[0].id);
  }

  async remove(id: number, authorId: number): Promise<Article | null> {
    const result = await this.pool.query<Article>({
      text: 'DELETE FROM articles WHERE id = $1 AND author_id = $2 RETURNING *',
      values: [id, authorId],
    });
    return result.rows[0] ?? null;
  }

  async togglePublish(id: number): Promise<Article | null> {
    const current = await this.pool.query<{ is_published: boolean }>({
      text: 'SELECT is_published FROM articles WHERE id = $1',
      values: [id],
    });

    if (!current.rows.length) {
      return null;
    }

    const newStatus = !current.rows[0].is_published;
    const result = await this.pool.query<Article>({
      text: 'UPDATE articles SET is_published = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      values: [newStatus, id],
    });
    return result.rows[0] ?? null;
  }
}
