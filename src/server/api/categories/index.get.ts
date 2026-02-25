import { createCategoryModel } from '~/server/services/category.service';
import { getDbPool } from '~/server/utils/db';

const pool = getDbPool();
const categoryModel = createCategoryModel({ pool });

export default defineEventHandler(async (event) => {
  try {
    const categories = await categoryModel.findAll();
    console.log('All categories:', categories);
    return {
      data: categories
    };
  } catch (error) {
    console.error('Categories error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при получении категорий'
    });
  }
});
