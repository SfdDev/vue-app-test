// stores/articles.ts - Composition API версия с $fetch
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// ==================== ТИПЫ ====================
export interface Article {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  imagePreview?: string | null;
  created_at?: string;
  updated_at?: string;
  author_id?: number;
  author_name?: string;
  is_published?: boolean;
  category_id?: number | null;
  category_name?: string | null;
  category_slug?: string | null;
}

export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total: number;
  per_page: number;
}

export interface ArticlesResponse {
  data: Article[];
  meta: PaginationMeta;
}

export interface PageCache {
  data: ArticlesResponse;
  meta: PaginationMeta;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalArticles: number;
  articlesPerPage: number;
}

export interface ArticleFormData {
  title: string;
  content: string;
  image_url?: string;
  file?: File;
  is_published?: boolean;
  category_id?: number | null;
}

// ==================== STORE ====================
export const useArticlesStore = defineStore('articles', () => {
  // State
  const articles = ref<Article[]>([]);
  const article = ref<Article | null>(null);
  const pages = ref<Record<string, PageCache>>({});
  const cachedArticle = ref<Record<number, Article>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);
  const uploadProgress = ref(0);
  const originPage = ref<number>(1);

  // Default pagination state
  const pagination = ref<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalArticles: 0,
    articlesPerPage: 6,
  });

  // ==================== ACTIONS ====================

  const setOriginPage = (page: number) => {
    originPage.value = page;
  };

  const clearAllCache = (): void => {
    pages.value = {};
    cachedArticle.value = {};
    pagination.value = {
      currentPage: 1,
      totalPages: 1,
      totalArticles: 0,
      articlesPerPage: 6,
    };
    articles.value = [];
  };

  const loadArticles = async (page: number = 1, perPage: number = 6, categoryId?: number | null): Promise<Article[]> => {
    const cacheKey = `${perPage}_${page}_${categoryId || 'all'}`;

    // Проверка кэша
    if (pages.value[cacheKey]) {
      articles.value = [...pages.value[cacheKey].data.data];
      pagination.value = {
        ...pagination.value,
        currentPage: page,
        totalPages: pages.value[cacheKey].meta.total_pages,
        totalArticles: pages.value[cacheKey].meta.total,
      };
      return articles.value;
    }

    loading.value = true;
    error.value = null;

    try {
      const query: any = { page, per_page: perPage };
      if (categoryId) {
        query.category_id = categoryId;
      }

      const response = await $fetch<ArticlesResponse>(`/api/articles`, {
        query: query,
      });

      articles.value = [...response.data];
      pagination.value = {
        ...pagination.value,
        currentPage: page,
        totalPages: response.meta.total_pages,
        totalArticles: response.meta.total,
        articlesPerPage: perPage,
      };

      // Сохраняем в кэш
      pages.value[cacheKey] = {
        data: response,
        meta: response.meta,
      };

      return articles.value;
    } catch (err) {
      const errorObj = err as Error;
      error.value = 'Ошибка загрузки статей: ' + errorObj.message;
      console.error('Ошибка загрузки статей:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadAdminArticles = async (page: number = 1, perPage: number = 4, categoryId?: number | null): Promise<Article[]> => {
    const cacheKey = `${perPage}_${page}_${categoryId || 'all'}`;
    
    console.log('loadAdminArticles called:', { page, perPage, categoryId, cacheKey });

    loading.value = true;
    error.value = null;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const query: any = { page, per_page: perPage };
      if (categoryId) {
        query.category_id = categoryId;
      }
      
      console.log('Making request to /api/admin/articles with query:', query);
      
      const response = await $fetch<ArticlesResponse>(`/api/admin/articles`, {
        query: query,
        headers: { 
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      articles.value = [...response.data];
      pagination.value = {
        ...pagination.value,
        currentPage: page,
        totalPages: response.meta.total_pages,
        totalArticles: response.meta.total,
        articlesPerPage: perPage,
      };

      // Сохраняем в кэш
      pages.value[cacheKey] = {
        data: response,
        meta: response.meta,
      };

      return articles.value;
    } catch (err) {
      const errorObj = err as Error;
      error.value = 'Ошибка загрузки статей: ' + errorObj.message;
      console.error('Ошибка загрузки статей админки:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadArticleById = async (id: string | number): Promise<void> => {
    loading.value = true;
    error.value = null;

    const articleId = Number(id);

    // Проверка кэша
    if (cachedArticle.value[articleId]) {
      article.value = { ...cachedArticle.value[articleId] };
      loading.value = false;
      return;
    }

    try {
      const articleData = await $fetch<Article>(`/api/articles/${articleId}`);

      const newArticle: Article = {
        id: articleData.id,
        title: articleData.title,
        content: articleData.content,
        image_url: articleData.image_url,
        created_at: articleData.created_at,
        updated_at: articleData.updated_at,
        author_id: articleData.author_id,
        author_name: articleData.author_name,
        is_published: articleData.is_published,
        category_id: articleData.category_id,
        category_name: articleData.category_name || null,
        category_slug: articleData.category_slug || null,
      };

      article.value = newArticle;
      cachedArticle.value[articleId] = { ...newArticle };
    } catch (err) {
      const errorObj = err as Error;
      error.value = 'Ошибка загрузки статьи';
      console.error('Ошибка загрузки статьи:', err);
      article.value = null;
    } finally {
      loading.value = false;
    }
  };

  const clearPageCache = (page: number, perPage: number): void => {
    const cacheKey = `${perPage}_${page}`;
    if (pages.value[cacheKey]) {
      delete pages.value[cacheKey];
    }
  };

  const addArticle = async (articleData: ArticleFormData): Promise<Article> => {
    loading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append('title', articleData.title);
      formData.append('content', articleData.content);
      formData.append('is_published', String(articleData.is_published ?? true));
      
      if (articleData.category_id) {
        formData.append('category_id', String(articleData.category_id));
      }
      
      if (articleData.file) {
        formData.append('image', articleData.file);
      } else if (articleData.image_url) {
        formData.append('image_url', articleData.image_url);
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const response = await $fetch<{ data: { article: Article } }>(
        `/api/articles`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );
      
      // Очищаем кэш текущей страницы
      clearPageCache(pagination.value.currentPage, pagination.value.articlesPerPage);

      // Обновляем кэш для первой страницы
      await loadArticles(1, pagination.value.articlesPerPage);
      
      return response.data.article;
    } catch (err) {
      const errorObj = err as any;
      const errorMessage = errorObj.data?.error || errorObj.message;
      
      error.value = `Ошибка добавления статьи: ${errorMessage}`;
      console.error('Ошибка добавления статьи:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const editArticle = async (articleData: Article & { file?: File }): Promise<Article> => {
    loading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append('title', articleData.title);
      formData.append('content', articleData.content);
      formData.append('is_published', String(articleData.is_published ?? true));
      
      if (articleData.category_id !== undefined) {
        formData.append('category_id', String(articleData.category_id));
      }
      
      if (articleData.file) {
        formData.append('image', articleData.file);
      } else if (articleData.image_url) {
        formData.append('image_url', articleData.image_url);
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const response = await $fetch<{ data: { article: Article } }>(
        `/api/articles/${articleData.id}`,
        {
          method: 'PUT',
          body: formData,
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      // Очищаем кэш текущей страницы
      clearPageCache(pagination.value.currentPage, pagination.value.articlesPerPage);
      
      // Очищаем кэш статьи
      if (cachedArticle.value[articleData.id]) {
        delete cachedArticle.value[articleData.id];
      }

      // Обновляем список статей
      await loadArticles(pagination.value.currentPage, pagination.value.articlesPerPage);

      return response.data.article;
    } catch (err) {
      const errorObj = err as Error;
      console.error('Ошибка редактирования статьи:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteArticle = async (id: number): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      await $fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      // Удаляем статью из всех кэшей страниц
      for (const key in pages.value) {
        const pageData = pages.value[key];
        pageData.data.data = pageData.data.data.filter(article => article.id !== id);
      }

      // Удаляем из кэша статей
      if (cachedArticle.value[id]) {
        delete cachedArticle.value[id];
      }

      // Обновляем текущие статьи
      articles.value = articles.value.filter(article => article.id !== id);
      
      // Обновляем пагинацию
      pagination.value.totalArticles = Math.max(0, pagination.value.totalArticles - 1);
      pagination.value.totalPages = Math.ceil(
        pagination.value.totalArticles / pagination.value.articlesPerPage
      );

      // Очищаем текущую статью если она удалена
      if (article.value?.id === id) {
        article.value = null;
      }
    } catch (err) {
      const errorObj = err as Error;
      error.value = 'Ошибка удаления статьи: ' + errorObj.message;
      console.error('Ошибка удаления статьи:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const togglePublish = async (id: number): Promise<Article> => {
    loading.value = true;
    error.value = null;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const response = await $fetch<{ data: { article: Article; message: string } }>(
        `/api/articles/${id}/toggle-publish`,
        {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      const updatedArticle = response.data.article;

      // Обновляем статью в кэше если она там есть
      if (cachedArticle.value[id]) {
        cachedArticle.value[id] = { ...updatedArticle };
      }

      // Обновляем статью в кэше страниц
      for (const key in pages.value) {
        const pageData = pages.value[key];
        const articleIndex = pageData.data.data.findIndex(article => article.id === id);
        if (articleIndex !== -1) {
          pageData.data.data[articleIndex] = { ...updatedArticle };
        }
      }

      // Обновляем текущие статьи
      const articleIndex = articles.value.findIndex(article => article.id === id);
      if (articleIndex !== -1) {
        articles.value[articleIndex] = { ...updatedArticle };
      }

      // Обновляем текущую статью если она открыта
      if (article.value?.id === id) {
        article.value = { ...updatedArticle };
      }

      return updatedArticle;
    } catch (err) {
      const errorObj = err as Error;
      error.value = 'Ошибка изменения статуса публикации: ' + errorObj.message;
      console.error('Ошибка изменения статуса публикации:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ==================== GETTERS ====================
  const getCurrentArticles = computed((): Article[] => {
    const cacheKey = `${pagination.value.articlesPerPage}_${pagination.value.currentPage}`;
    return pages.value[cacheKey]?.data?.data || articles.value;
  });

  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);
  const getArticleById = (id: number): Article | null => cachedArticle.value[id] || null;
  const hasCachedData = computed(() => 
    Object.keys(pages.value).length > 0 || 
    Object.keys(cachedArticle.value).length > 0
  );

  return {
    // State
    articles,
    article,
    pages,
    cachedArticle,
    loading,
    error,
    uploadProgress,
    pagination,
    originPage,
    
    // Actions
    setOriginPage,
    clearAllCache,
    loadArticles,
    loadAdminArticles,
    loadArticleById,
    clearPageCache,
    addArticle,
    editArticle,
    deleteArticle,
    togglePublish,
    
    // Getters
    getCurrentArticles,
    isLoading,
    getError,
    getArticleById,
    hasCachedData,
  };
});
