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

    const category = await categoryModel.findById(categoryId);
    
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
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при получении категории'
    });
  }
});
