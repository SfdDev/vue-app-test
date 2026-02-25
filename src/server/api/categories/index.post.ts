import { createCategoryModel } from '~/server/services/category.service';
import { getDbPool } from '~/server/utils/db';

const pool = getDbPool();
const categoryModel = createCategoryModel({ pool });

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log('Creating category with body:', body);
    
    // Валидация
    if (!body.name || body.name.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Название категории обязательно'
      });
    }

    if (body.name.length > 255) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Название категории слишком длинное'
      });
    }

    const category = await categoryModel.create({
      name: body.name.trim(),
      slug: body.slug?.trim(),
      description: body.description?.trim() || null
    });

    console.log('Category created successfully:', category);
    return {
      data: category
    };
  } catch (error: any) {
    console.error('Category creation error:', error);
    
    if (error.code === '23505') { // Уникальное ограничение
      throw createError({
        statusCode: 400,
        statusMessage: 'Категория с таким названием уже существует'
      });
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при создании категории'
    });
  }
});
