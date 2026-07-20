import type { Article, CreateArticleInput, UpdateArticleInput } from '../domain/article';

export interface ArticleRepository {
  create(input: CreateArticleInput): Promise<Article>;
  findPublishedPage(page: number, perPage: number, categoryId?: number | null): Promise<Article[]>;
  countPublished(categoryId?: number | null): Promise<number>;
  findByIdPublished(id: number): Promise<Article | null>;
  findById(id: number): Promise<Article | null>;
  findPublishedByPath(categorySlug: string, articleSlug: string): Promise<Article | null>;
  findAdminPage(page: number, perPage: number, categoryId?: number | null): Promise<Article[]>;
  countAll(categoryId?: number | null): Promise<number>;
  getPublishedIndex(id: number): Promise<number | null>;
  slugExists(slug: string, excludeId?: number): Promise<boolean>;
  update(id: number, authorId: number, input: UpdateArticleInput): Promise<Article | null>;
  remove(id: number, authorId: number): Promise<Article | null>;
  togglePublish(id: number): Promise<Article | null>;
}
