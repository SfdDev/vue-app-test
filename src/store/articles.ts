// stores/articles.ts - Composition API версия
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios, { AxiosError } from 'axios';

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
}

// ==================== STORE ====================
export const useArticlesStore = defineStore(
  'articles',
  () => {
    // State
    const articles = ref<Article[]>([]);
    const article = ref<Article | null>(null);
    const pages = ref<Record<string, PageCache>>({});
    const cachedArticle = ref<Record<number, Article>>({});
    const loading = ref(false);
    const error = ref<string | null>(null);
    const uploadProgress = ref(0);
    const pagination = ref<PaginationState>({
      currentPage: 1,
      totalPages: 1,
      totalArticles: 0,
      articlesPerPage: 6,
    });
    const originPage = ref<number | null>(null);

    // Actions
    const setOriginPage = (page: number | null): void => {
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
      article.value = null;
      error.value = null;
    };

    const loadArticles = async (page: number = 1, perPage: number = 6): Promise<Article[]> => {
      const cacheKey = `${perPage}_${page}`;

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
        const response = await axios.get<ArticlesResponse>(`/api/articles`, {
          params: { page, per_page: perPage },
        });

        if (!response.data || !response.data.data) {
          throw new Error('Некорректный формат ответа');
        }

        articles.value = [...response.data.data];
        pagination.value = {
          currentPage: response.data.meta.current_page || 1,
          totalPages: response.data.meta.total_pages || 1,
          totalArticles: response.data.meta.total || 0,
          articlesPerPage: response.data.meta.per_page || perPage,
        };

        // Сохраняем в кэш
        pages.value[cacheKey] = {
          data: response.data,
          meta: response.data.meta,
        };

        return articles.value;
      } catch (err) {
        const errorObj = err as AxiosError | Error;
        error.value = 'Ошибка загрузки статей: ' + (axios.isAxiosError(errorObj) 
          ? errorObj.response?.data?.message || errorObj.message 
          : errorObj.message);
        console.error('Ошибка загрузки статей:', err);
        return [];
      } finally {
        loading.value = false;
      }
    };

    const loadArticleById = async (id: string | number): Promise<void> => {
      loading.value = true;
      error.value = null;

      const articleId = Number(id);
      if (isNaN(articleId)) {
        error.value = 'Некорректный ID';
        loading.value = false;
        return;
      }

      // Проверка кэша
      if (cachedArticle.value[articleId]) {
        article.value = { ...cachedArticle.value[articleId] };
        loading.value = false;
        return;
      }

      try {
        const response = await axios.get<{ data: Article }>(`/api/articles/${articleId}`);
        const articleData = response.data.data;

        const newArticle: Article = {
          ...articleData,
          image_url: articleData.image_url || '/images/default.png',
          imagePreview: articleData.image_url || null,
        };

        article.value = newArticle;
        cachedArticle.value[articleId] = { ...newArticle };
      } catch (err) {
        const errorObj = err as AxiosError | Error;
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
        if (!articleData.title || !articleData.content) {
          throw new Error('Заголовок и контент обязательны');
        }

        if (!articleData.file && !articleData.image_url) {
          throw new Error('Изображение или image_url обязательны');
        }

        const formData = new FormData();
        formData.append('title', articleData.title);
        formData.append('content', articleData.content);

        if (articleData.file) {
          formData.append('image', articleData.file);
        } else if (articleData.image_url) {
          formData.append('image_url', articleData.image_url);
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        const response = await axios.post<{ data: { article: Article } }>(
          `/api/articles`,
          formData,
          {
            headers: { 
              Authorization: token ? `Bearer ${token}` : '',
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        // Очищаем кэш текущей страницы
        clearPageCache(pagination.value.currentPage, pagination.value.articlesPerPage);

        // Обновляем кэш для первой страницы
        await loadArticles(1, pagination.value.articlesPerPage);
        
        return response.data.data.article;
      } catch (err) {
        const errorObj = err as AxiosError | Error;
        const errorMessage = axios.isAxiosError(errorObj)
          ? errorObj.response?.data?.error || errorObj.message
          : errorObj.message;
        
        error.value = 'Ошибка добавления статьи: ' + errorMessage;
        console.error('Ошибка добавления статьи:', err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const editArticle = async (articleData: Article & { file?: File }): Promise<Article> => {
      loading.value = true;

      try {
        const formData = new FormData();
        formData.append('title', articleData.title);
        formData.append('content', articleData.content);
        
        if (articleData.image_url) {
          formData.append('image_url', articleData.image_url);
        }
        
        if (articleData.file) {
          formData.append('image', articleData.file);
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        const response = await axios.put<{ data: { article: Article } }>(
          `/api/articles/${articleData.id}`,
          formData,
          {
            headers: { 
              Authorization: token ? `Bearer ${token}` : '',
              'Content-Type': 'multipart/form-data',
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

        return response.data.data.article;
      } catch (err) {
        const errorObj = err as AxiosError | Error;
        console.error('Ошибка редактирования статьи:', err);
        throw errorObj;
      } finally {
        loading.value = false;
      }
    };

    const deleteArticle = async (id: number): Promise<void> => {
      loading.value = true;
      error.value = null;

      try {
        await axios.delete(`/api/articles/${id}`);

        // Удаляем статью из всех кэшей страниц
        for (const key in pages.value) {
          if (pages.value[key]?.data?.data) {
            pages.value[key].data.data = pages.value[key].data.data.filter((a) => a.id !== id);

            if (pages.value[key].meta) {
              pages.value[key].meta.total -= 1;
              pages.value[key].meta.total_pages = Math.ceil(
                pages.value[key].meta.total / pages.value[key].meta.per_page
              );
            }

            const [perPage, pageNum] = key.split('_').map(Number);
            if (pageNum === pagination.value.currentPage && perPage === pagination.value.articlesPerPage) {
              articles.value = [...pages.value[key].data.data];
            }
          }
        }

        // Обновляем пагинацию
        pagination.value.totalArticles = Math.max(0, pagination.value.totalArticles - 1);
        pagination.value.totalPages = Math.ceil(
          pagination.value.totalArticles / pagination.value.articlesPerPage
        );

        // Очищаем текущую статью если она удалена
        if (article.value?.id === id) {
          article.value = null;
        }

        // Очищаем кэш статьи
        if (cachedArticle.value[id]) {
          delete cachedArticle.value[id];
        }

        // Очищаем кэш текущей страницы
        clearPageCache(pagination.value.currentPage, pagination.value.articlesPerPage);

        // Обновляем текущие статьи (используем кэш если есть)
        const cacheKey = `${pagination.value.articlesPerPage}_${pagination.value.currentPage}`;
        if (pages.value[cacheKey]) {
          articles.value = [...pages.value[cacheKey].data.data];
        } else if (pagination.value.totalArticles > 0) {
          // Если есть статьи но нет кэша - загружаем заново
          await loadArticles(pagination.value.currentPage, pagination.value.articlesPerPage);
        } else {
          // Если статей нет - очищаем
          articles.value = [];
        }
      } catch (err) {
        const errorObj = err as AxiosError | Error;
        error.value = 'Ошибка удаления статьи: ' + errorObj.message;
        console.error('Ошибка удаления статьи:', err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    // Getters (computed)
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
      loadArticleById,
      clearPageCache,
      addArticle,
      editArticle,
      deleteArticle,
      
      // Getters
      getCurrentArticles,
      isLoading,
      getError,
      getArticleById,
      hasCachedData,
    };
  },
  {
    // Persist options (третий аргумент)
    // persist: {
    //   key: 'articles_store',
    //   storage: localStorage,
    //   paths: ['pages', 'cachedArticle', 'pagination'],
    // },
  }
);