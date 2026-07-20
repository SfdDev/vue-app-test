import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../domain/category';
import { ConflictError, NotFoundError, ValidationError } from '../domain/errors';
import type { CategoryRepository } from '../ports/category.repository';
import {
  isReservedUncategorizedCategory,
  UNCATEGORIZED_CATEGORY_NAME,
} from '../../shared/category-filter';
import { slugify } from '../../shared/slugify';

function assertNotReserved(name: string, slug: string): void {
  if (isReservedUncategorizedCategory({ name, slug })) {
    throw new ValidationError(
      `"${UNCATEGORIZED_CATEGORY_NAME}" — системная категория, её нельзя создать вручную`,
    );
  }
}

export class CategoryApplicationService {
  constructor(private readonly categories: CategoryRepository) {}

  async list(): Promise<Category[]> {
    const all = await this.categories.findAll();
    return all.filter((category) => !isReservedUncategorizedCategory(category));
  }

  async getById(id: number): Promise<Category> {
    const category = await this.categories.findById(id);
    if (!category || isReservedUncategorizedCategory(category)) {
      throw new NotFoundError('Категория не найдена');
    }
    return category;
  }

  async getBySlug(slug: string): Promise<Category> {
    const category = await this.categories.findBySlug(slug);
    if (!category || isReservedUncategorizedCategory(category)) {
      throw new NotFoundError('Категория не найдена');
    }
    return category;
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const name = input.name?.trim() ?? '';
    if (!name) {
      throw new ValidationError('Название категории обязательно');
    }
    if (name.length > 255) {
      throw new ValidationError('Название категории слишком длинное');
    }

    const slug = (input.slug?.trim() || slugify(name));
    if (!slug) {
      throw new ValidationError('Не удалось сформировать slug категории');
    }

    assertNotReserved(name, slug);

    try {
      return await this.categories.create({
        name,
        slug,
        description: input.description?.trim() || null,
      });
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictError('Категория с таким названием уже существует');
      }
      throw error;
    }
  }

  async update(id: number, input: UpdateCategoryInput): Promise<Category> {
    const existing = await this.categories.findById(id);
    if (!existing || isReservedUncategorizedCategory(existing)) {
      throw new NotFoundError('Категория не найдена');
    }

    const data: UpdateCategoryInput = {};
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) {
        throw new ValidationError('Название категории обязательно');
      }
      if (name.length > 255) {
        throw new ValidationError('Название категории слишком длинное');
      }
      data.name = name;
    }
    if (input.slug !== undefined) {
      data.slug = input.slug.trim();
    }
    if (input.description !== undefined) {
      data.description = input.description?.trim() || null;
    }

    assertNotReserved(
      data.name ?? existing.name,
      data.slug ?? existing.slug,
    );

    try {
      const updated = await this.categories.update(id, data);
      if (!updated) {
        throw new NotFoundError('Категория не найдена');
      }
      return updated;
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictError('Категория с таким названием уже существует');
      }
      throw error;
    }
  }

  async delete(id: number): Promise<Category> {
    const existing = await this.categories.findById(id);
    if (!existing || isReservedUncategorizedCategory(existing)) {
      throw new NotFoundError('Категория не найдена');
    }

    const articlesCount = await this.categories.countArticles(id);
    if (articlesCount > 0) {
      throw new ConflictError('Нельзя удалить категорию, в которой есть статьи');
    }

    const deleted = await this.categories.delete(id);
    if (!deleted) {
      throw new NotFoundError('Категория не найдена');
    }
    return deleted;
  }
}
