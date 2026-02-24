import { promises as fs } from 'fs';
import path from 'path';
import { getDbPool } from '../utils/db';
import { createArticleModel } from '../models/article.model';

const pool = getDbPool();
const articleModel = createArticleModel({ pool });

export async function getArticles(page: number, perPage: number, categoryId?: number | null) {
  const articles = await articleModel.getAll(page, perPage, categoryId);
  const total = await articleModel.getCount();
  const totalPages = Math.ceil(total / perPage);

  return {
    data: articles,
    meta: {
      current_page: page,
      per_page: perPage,
      total_pages: totalPages,
      total,
    },
  };
}

export async function getAdminArticles(page: number, perPage: number, categoryId?: number | null) {
  const articles = await articleModel.getAllAdmin(page, perPage, categoryId);
  const total = await articleModel.getCountAdmin();
  const totalPages = Math.ceil(total / perPage);

  return {
    data: articles,
    meta: {
      current_page: page,
      per_page: perPage,
      total_pages: totalPages,
      total,
    },
  };
}

export async function getArticleById(id: number) {
  const article = await articleModel.getById(id);
  if (!article) {
    throw Object.assign(new Error('Article not found'), { statusCode: 404 });
  }
  return article;
}

export async function getArticleByIdAdmin(id: number) {
  const article = await articleModel.getByIdAdmin(id);
  if (!article) {
    throw Object.assign(new Error('Article not found'), { statusCode: 404 });
  }
  return article;
}

export async function getPageOfArticle(id: number, perPage: number) {
  const index = await articleModel.getIndexById(id);
  const page = Math.floor(index / perPage) + 1;
  return { page };
}

export async function createArticle(
  title: string,
  content: string,
  userId: number,
  imageUrl: string | null,
  isPublished: boolean = true,
  categoryId: number | null = null
) {
  if (!title || !content) {
    throw Object.assign(new Error('Заголовок и контент обязательны'), { statusCode: 400 });
  }
  if (!imageUrl) {
    throw Object.assign(new Error('Изображение или image_url обязательны'), { statusCode: 400 });
  }
  const article = await articleModel.create(title, content, userId, imageUrl, isPublished, categoryId);
  if (!article) {
    throw Object.assign(new Error('Не удалось создать статью'), { statusCode: 400 });
  }
  return article;
}

export async function updateArticle(
  id: number,
  userId: number,
  title: string,
  content: string,
  newImageUrl: string | null,
  oldImagePath: string | null,
  isPublished?: boolean,
  categoryId?: number | null,
) {
  if (!title || !content) {
    throw Object.assign(new Error('Заголовок и контент обязательны'), { statusCode: 400 });
  }

  let imageUrl = newImageUrl;

  if (!imageUrl && !oldImagePath) {
    throw Object.assign(new Error('Изображение или image_url обязательны'), { statusCode: 400 });
  }

  if (!imageUrl && oldImagePath) {
    imageUrl = oldImagePath;
  }

  const updateData = { title, content, image_url: imageUrl, category_id: categoryId };
  const article = await articleModel.update(id, userId, updateData, isPublished);

  if (!article) {
    throw Object.assign(new Error('Не удалось обновить статью'), { statusCode: 400 });
  }

  if (newImageUrl && oldImagePath) {
    const fullPath = path.join(process.cwd(), 'public', oldImagePath);
    await fs.unlink(fullPath).catch(() => {});
  }

  return article;
}

export async function deleteArticle(id: number, userId: number) {
  const article = await articleModel.getById(id);
  if (!article) {
    throw Object.assign(new Error('Статья не найдена'), { statusCode: 404 });
  }

  if (article.image_url) {
    const imagePath = path.join(process.cwd(), 'public', article.image_url);
    await fs.unlink(imagePath).catch(() => {});
  }

  const deleted = await articleModel.remove(id, userId);
  if (!deleted) {
    throw Object.assign(new Error('Нет прав на удаление статьи'), { statusCode: 403 });
  }

  return deleted;
}

