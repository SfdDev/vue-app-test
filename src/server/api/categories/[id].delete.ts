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

    const category = await categoryModel.delete(categoryId);
    
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
    console.error('Error deleting category:', error);
    
    // Проверяем тип ошибки
    if (error.statusCode) {
      throw error;
    }
    
    // Если это наша ошибка о статьях в категории, возвращаем 400
    if (error.message === 'Нельзя удалить категорию, в которой есть статьи') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Нельзя удалить категорию, в которой есть статьи'
      });
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Ошибка при удалении категории'
    });
  }
});
