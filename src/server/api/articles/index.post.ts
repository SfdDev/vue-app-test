import { promises as fs } from 'fs';
import path from 'path';
import { readMultipartFormData } from 'h3';
import { createArticle } from '../../services/article.service';
import { requireAdmin } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = requireAdmin(event);

  const formData = await readMultipartFormData(event);
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'Некорректные данные формы' });
  }

  const getField = (name: string) =>
    formData.find((part) => part.name === name && !part.filename)?.data.toString('utf8') ?? '';

  const title = getField('title');
  const content = getField('content');
  
  // ПОЛУЧАЕМ ЗНАЧЕНИЕ is_published ИЗ ФОРМЫ (ЕСЛИ ЕСТЬ)
  const isPublishedField = getField('is_published');
  const isPublished = isPublishedField ? isPublishedField === 'true' : true; // По умолчанию true

  // ПОЛУЧАЕМ category_id ИЗ ФОРМЫ
  const categoryIdField = getField('category_id');
  const categoryId = categoryIdField ? parseInt(categoryIdField) : null;
  
  console.log('Creating article with data:', {
    title,
    content: content?.substring(0, 100) + '...',
    categoryId,
    categoryIdField,
    isPublished,
    userId: user.id
  });

  const imagePart = formData.find((part) => part.name === 'image' && part.filename);

  let imageUrl: string | null = null;
  if (imagePart && imagePart.filename && imagePart.data) {
    const uploadDir = path.join(process.cwd(), 'public', 'images');
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(imagePart.filename);
    const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext || ''}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, imagePart.data);
    imageUrl = `/images/${fileName}`;
  }

  try {
    const article = await createArticle(
      String(title ?? ''),
      String(content ?? ''),
      user.id,
      imageUrl,
      isPublished,  // ТЕПЕРЬ ПЕРЕДАЕМ ОПРЕДЕЛЕННУЮ ПЕРЕМЕННУЮ
      categoryId,  // ПЕРЕДАЕМ category_id
    );
    console.log('Article created successfully:', article);
    return { data: { article } };
  } catch (error: any) {
    const statusCode = error.statusCode ?? 400;
    throw createError({
      statusCode,
      statusMessage: error.message ?? 'Ошибка создания статьи',
    });
  }
});