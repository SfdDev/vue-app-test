import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../../domain/category';
import type { CategoryRepository } from '../../ports/category.repository';
import type { DbPool } from '../db/pool';

export class PgCategoryRepository implements CategoryRepository {
  constructor(private readonly pool: DbPool) {}

  async findAll(): Promise<Category[]> {
    const result = await this.pool.query<Category>(`
      SELECT * FROM categories
      ORDER BY name ASC
    `);
    return result.rows;
  }

  async findById(id: number): Promise<Category | null> {
    const result = await this.pool.query<Category>(`
      SELECT * FROM categories
      WHERE id = $1
    `, [id]);
    return result.rows[0] ?? null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const result = await this.pool.query<Category>(`
      SELECT * FROM categories
      WHERE slug = $1
    `, [slug]);
    return result.rows[0] ?? null;
  }

  async create(data: CreateCategoryInput & { slug: string }): Promise<Category> {
    const result = await this.pool.query<Category>(`
      INSERT INTO categories (name, slug, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [data.name, data.slug, data.description ?? null]);
    return result.rows[0];
  }

  async update(id: number, data: UpdateCategoryInput): Promise<Category | null> {
    const fields: string[] = [];
    const values: Array<string | null | number> = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (data.slug !== undefined) {
      fields.push(`slug = $${paramIndex++}`);
      values.push(data.slug);
    }

    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(data.description ?? null);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await this.pool.query<Category>(`
      UPDATE categories
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);
    return result.rows[0] ?? null;
  }

  async delete(id: number): Promise<Category | null> {
    const result = await this.pool.query<Category>(`
      DELETE FROM categories
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0] ?? null;
  }

  async countArticles(categoryId: number): Promise<number> {
    const result = await this.pool.query<{ count: string }>(`
      SELECT COUNT(*) as count FROM articles
      WHERE category_id = $1
    `, [categoryId]);
    return Number.parseInt(result.rows[0].count, 10);
  }
}
