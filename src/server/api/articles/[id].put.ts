import { promises as fs } from 'fs';
import path from 'path';
import { readMultipartFormData } from 'h3';
import { getDbPool } from '../../utils/db';
import { updateArticle } from '../../services/article.service';
import { requireAdmin } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = requireAdmin(event);
  const id = Number.parseInt(event.context.params?.id ?? '', 10);
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Некорректный ID' });
  }

  const formData = await readMultipartFormData(event);
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'Некорректные данные формы' });
  }

  const getField = (name: string) =>
    formData.find((part) => part.name === name && !part.filename)?.data.toString('utf8') ?? '';

  const title = getField('title');
  const content = getField('content');
  const newImageUrlField = getField('image_url');
  
  // Получаем is_published из формы (если есть)
  const isPublishedField = getField('is_published');
  // Преобразуем строку в boolean, если поле передано
  const isPublished = isPublishedField ? isPublishedField === 'true' : undefined;

  // Получаем category_id из формы
  const categoryIdField = getField('category_id');
  const categoryId = categoryIdField ? parseInt(categoryIdField) : undefined;
  
  console.log('Editing article:', {
    id,
    title,
    content,
    categoryId,
    categoryIdField,
    isPublished,
    user: user.username
  });

  const imagePart = formData.find((part) => part.name === 'image' && part.filename);

  let newImageUrl: string | null = null;
  if (imagePart && imagePart.filename && imagePart.data) {
    const uploadDir = path.join(process.cwd(), 'public', 'images');
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(imagePart.filename);
    const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext || ''}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, imagePart.data);
    newImageUrl = `/images/${fileName}`;
  } else if (newImageUrlField) {
    newImageUrl = String(newImageUrlField);
  }

  const pool = getDbPool();
  const currentArticleQuery = await pool.query<{ image_url: string | null }>(
    'SELECT image_url FROM articles WHERE id = $1',
    [id],
  );
  if (!currentArticleQuery.rows.length) {
    throw createError({ statusCode: 404, statusMessage: 'Статья не найдена' });
  }
  const oldImagePath = currentArticleQuery.rows[0].image_url;

  try {
    const article = await updateArticle(
      id,
      user.id,
      String(title ?? ''),
      String(content ?? ''),
      newImageUrl,
      oldImagePath,
      isPublished, // Добавляем isPublished как седьмой аргумент
      categoryId, // Добавляем categoryId как восьмой аргумент
    );
    return { data: { article } };
  } catch (error: any) {
    const statusCode = error.statusCode ?? 400;
    throw createError({
      statusCode,
      statusMessage: error.message ?? 'Ошибка обновления статьи',
    });
  }
});