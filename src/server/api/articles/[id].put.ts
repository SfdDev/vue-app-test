import { readMultipartFormData } from 'h3';
import { articleService } from '../../composition/container';
import { requireAdmin } from '../../shared/auth/require-admin';
import { clearArticlesListCache } from '../../shared/articles-list-cache';
import { mapDomainError } from '../../shared/http/map-error';
import { getFormField, getFormImage } from '../../shared/http/multipart';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAdmin(event);
    const id = Number.parseInt(event.context.params?.id ?? '', 10);
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Некорректный ID' });
    }

    const formData = await readMultipartFormData(event);
    if (!formData) {
      throw createError({ statusCode: 400, statusMessage: 'Некорректные данные формы' });
    }

    const title = getFormField(formData, 'title');
    const content = getFormField(formData, 'content');
    const isPublishedField = getFormField(formData, 'is_published');
    const isPublished = isPublishedField ? isPublishedField === 'true' : undefined;
    const categoryIdField = getFormField(formData, 'category_id');
    const categoryId = categoryIdField ? Number.parseInt(categoryIdField, 10) : undefined;
    const image = getFormImage(formData);
    const imageUrlField = getFormField(formData, 'image_url') || null;

    const article = await articleService.update(
      id,
      user.id,
      title,
      content,
      image,
      imageUrlField,
      isPublished,
      categoryId,
    );

    clearArticlesListCache();
    return { data: { article } };
  } catch (error) {
    mapDomainError(error);
  }
});
