import { createCategoryModel } from '~/server/services/category.service';
import { getDbPool } from '~/server/utils/db';

const pool = getDbPool();
const categoryModel = createCategoryModel({ pool });

export default defineEventHandler(async (event) => {
  try {
    const categoryId = parseInt(getRouterParam(event, 'id') || '');
    
    if (isNaN(categoryId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Неверный ID категории'
      });
    }

    const body = await readBody(event);
    
    // Валидация
    if (body.name !== undefined) {
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
    }

    const category = await categoryModel.update(categoryId, {
      name: body.name?.trim(),
      slug: body.slug?.trim(),
      description: body.description?.trim() || undefined
    });

    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Категория не найдена'
      });
    }

    return {
      data: category
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    
    if (error.code === '23505') { // Уникальное ограничение
      throw createError({
        statusCode: 400,
        statusMessage: 'Категория с таким названием уже существует'
      });
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при обновлении категории'
    });
  }
});
