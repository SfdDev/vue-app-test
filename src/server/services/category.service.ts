import type { Pool } from 'pg';
import type { Category, CreateCategoryData, UpdateCategoryData } from '../models/category.model';

export function createCategoryModel({ pool }: { pool: Pool }) {
  async function findAll() {
    const result = await pool.query(`
      SELECT * FROM categories 
      ORDER BY name ASC
    `);
    return result.rows;
  }

  async function findById(id: number) {
    const result = await pool.query(`
      SELECT * FROM categories 
      WHERE id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  async function findBySlug(slug: string) {
    const result = await pool.query(`
      SELECT * FROM categories 
      WHERE slug = $1
    `, [slug]);
    return result.rows[0] || null;
  }

  async function create(data: CreateCategoryData) {
    const slug = data.slug || data.name.toLowerCase()
      .replace(/[^a-zа-яё0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^[-]+|[-]+$/g, '');

    const result = await pool.query(`
      INSERT INTO categories (name, slug, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [data.name, slug, data.description || null]);
    return result.rows[0];
  }

  async function update(id: number, data: UpdateCategoryData) {
    const fields = [];
    const values = [];
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
      values.push(data.description || null);
    }

    if (fields.length === 0) {
      return findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(`
      UPDATE categories 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);
    return result.rows[0];
  }

  async function deleteCategory(id: number) {
    // Сначала проверим, есть ли статьи в этой категории
    const articlesCount = await pool.query(`
      SELECT COUNT(*) as count FROM articles 
      WHERE category_id = $1
    `, [id]);

    if (parseInt(articlesCount.rows[0].count) > 0) {
      throw new Error('Нельзя удалить категорию, в которой есть статьи');
    }

    const result = await pool.query(`
      DELETE FROM categories 
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }

  async function getWithArticlesCount() {
    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(a.id) as articles_count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    return result.rows;
  }

  return {
    findAll,
    findById,
    findBySlug,
    create,
    update,
    delete: deleteCategory,
    getWithArticlesCount
  };
}
