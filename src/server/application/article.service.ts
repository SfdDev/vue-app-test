import type { Article, ArticlesPage, UploadedImage } from '../domain/article';
import { ForbiddenError, NotFoundError, ValidationError } from '../domain/errors';
import type { ArticleRepository } from '../ports/article.repository';
import type { FileStorage } from '../ports/file-storage';
import { slugify } from '../../shared/slugify';

export class ArticleApplicationService {
  constructor(
    private readonly articles: ArticleRepository,
    private readonly files: FileStorage,
  ) {}

  async listPublished(page: number, perPage: number, categoryId?: number | null): Promise<ArticlesPage> {
    const data = await this.articles.findPublishedPage(page, perPage, categoryId);
    const total = await this.articles.countPublished(categoryId);
    return {
      data,
      meta: {
        current_page: page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage),
        total,
      },
    };
  }

  async listAdmin(page: number, perPage: number, categoryId?: number | null): Promise<ArticlesPage> {
    const data = await this.articles.findAdminPage(page, perPage, categoryId);
    const total = await this.articles.countAll(categoryId);
    return {
      data,
      meta: {
        current_page: page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage),
        total,
      },
    };
  }

  async getPublishedById(id: number): Promise<Article> {
    const article = await this.articles.findByIdPublished(id);
    if (!article) {
      throw new NotFoundError('Article not found');
    }
    return article;
  }

  async getPublishedByPath(categorySlug: string, articleSlug: string): Promise<Article> {
    const article = await this.articles.findPublishedByPath(categorySlug, articleSlug);
    if (!article) {
      throw new NotFoundError('Article not found');
    }
    return article;
  }

  async getByIdAdmin(id: number): Promise<Article> {
    const article = await this.articles.findById(id);
    if (!article) {
      throw new NotFoundError('Article not found');
    }
    return article;
  }

  async getPageOfArticle(id: number, perPage: number): Promise<{ page: number }> {
    const index = await this.articles.getPublishedIndex(id);
    if (index === null) {
      throw new NotFoundError('Article not found');
    }
    return { page: Math.floor(index / perPage) + 1 };
  }

  private async uniqueSlug(title: string, excludeId?: number): Promise<string> {
    const base = slugify(title);
    let candidate = base;
    let suffix = 2;
    while (await this.articles.slugExists(candidate, excludeId)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
    return candidate;
  }

  async create(
    title: string,
    content: string,
    authorId: number,
    image: UploadedImage | null,
    imageUrlField: string | null,
    isPublished: boolean,
    categoryId: number | null,
  ): Promise<Article> {
    if (!title || !content) {
      throw new ValidationError('Заголовок и контент обязательны');
    }

    let imageUrl: string | null = null;
    if (image) {
      imageUrl = await this.files.saveImage(image.buffer, image.filename);
    } else if (imageUrlField) {
      imageUrl = imageUrlField;
    }

    if (!imageUrl) {
      throw new ValidationError('Изображение или image_url обязательны');
    }

    const slug = await this.uniqueSlug(title);

    return this.articles.create({
      title,
      content,
      authorId,
      imageUrl,
      isPublished,
      categoryId,
      slug,
    });
  }

  async update(
    id: number,
    authorId: number,
    title: string,
    content: string,
    image: UploadedImage | null,
    imageUrlField: string | null,
    isPublished?: boolean,
    categoryId?: number | null,
  ): Promise<Article> {
    if (!title || !content) {
      throw new ValidationError('Заголовок и контент обязательны');
    }

    const current = await this.articles.findById(id);
    if (!current) {
      throw new NotFoundError('Статья не найдена');
    }

    let newImageUrl: string | null = null;
    if (image) {
      newImageUrl = await this.files.saveImage(image.buffer, image.filename);
    } else if (imageUrlField) {
      newImageUrl = imageUrlField;
    }

    const imageUrl = newImageUrl ?? current.image_url;
    if (!imageUrl) {
      throw new ValidationError('Изображение или image_url обязательны');
    }

    const slug =
      !current.slug || current.title !== title
        ? await this.uniqueSlug(title, id)
        : current.slug;

    const article = await this.articles.update(id, authorId, {
      title,
      content,
      imageUrl,
      isPublished,
      categoryId,
      slug,
    });

    if (!article) {
      throw new ForbiddenError('Не удалось обновить статью');
    }

    if (newImageUrl && current.image_url && newImageUrl !== current.image_url) {
      await this.files.deleteByUrl(current.image_url);
    }

    return article;
  }

  async delete(id: number, authorId: number): Promise<Article> {
    const article = await this.articles.findById(id);
    if (!article) {
      throw new NotFoundError('Статья не найдена');
    }

    const deleted = await this.articles.remove(id, authorId);
    if (!deleted) {
      throw new ForbiddenError('Нет прав на удаление статьи');
    }

    await this.files.deleteByUrl(article.image_url);
    return deleted;
  }

  async togglePublish(id: number): Promise<{ article: Article; message: string }> {
    const article = await this.articles.togglePublish(id);
    if (!article) {
      throw new NotFoundError('Статья не найдена');
    }

    return {
      article,
      message: article.is_published ? 'Статья опубликована' : 'Статья снята с публикации',
    };
  }
}
