import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../domain/category';

export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: number): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  create(data: CreateCategoryInput & { slug: string }): Promise<Category>;
  update(id: number, data: UpdateCategoryInput): Promise<Category | null>;
  delete(id: number): Promise<Category | null>;
  countArticles(categoryId: number): Promise<number>;
}
