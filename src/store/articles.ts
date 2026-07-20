import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { categoryFilterCacheKey } from '@/shared/category-filter';
import { notifyArticlesChanged } from '@/shared/articles-sync';


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
  category_name?: string;
  category_slug?: string;
  slug?: string | null;
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
  const adminArticles = ref<Article[]>([]);
  const article = ref<Article | null>(null);
  const pages = ref<Record<string, PageCache>>({});
  const adminPages = ref<Record<string, PageCache>>({});
  const cachedArticle = ref<Record<number, Article>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);
  const uploadProgress = ref(0);
  const originPage = ref<number>(1);

  // Default pagination state (blog)
  const pagination = ref<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalArticles: 0,
    articlesPerPage: 6,
  });

  const adminPagination = ref<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalArticles: 0,
    articlesPerPage: 4,
  });

  // ==================== ACTIONS ====================

  const setOriginPage = (page: number) => {
    originPage.value = page;
  };

  const clearAllCache = (): void => {
    pages.value = {};
    adminPages.value = {};
    cachedArticle.value = {};
    pagination.value = {
      currentPage: 1,
      totalPages: 1,
      totalArticles: 0,
      articlesPerPage: 6,
    };
    adminPagination.value = {
      currentPage: 1,
      totalPages: 1,
      totalArticles: 0,
      articlesPerPage: 4,
    };
    articles.value = [];
    adminArticles.value = [];
  };

  const invalidatePublicCache = (): void => {
    pages.value = {};
    cachedArticle.value = {};
    notifyArticlesChanged();
  };

  const loadArticles = async (
    page: number = 1,
    perPage: number = 6,
    categoryId?: number | null,
    force = false,
  ): Promise<Article[]> => {
    const cacheKey = `${perPage}_${page}_${categoryFilterCacheKey(categoryId)}`;

    if (!force && pages.value[cacheKey]) {
      articles.value = [...pages.value[cacheKey].data.data];
      pagination.value = {
        ...pagination.value,
        currentPage: page,
        totalPages: pages.value[cacheKey].meta.total_pages,
        totalArticles: pages.value[cacheKey].meta.total,
        articlesPerPage: perPage,
      };
      return articles.value;
    }

    loading.value = true;
    error.value = null;

    try {
      const query: Record<string, string | number> = { page, per_page: perPage };
      if (categoryId != null) {
        query.category_id = categoryId;
      }
      if (force) {
        query._ = Date.now();
      }

      const response = await $fetch<ArticlesResponse>(`/api/articles`, {
        query,
      });

      // Public API returns only published; keep a hard filter as safety
      articles.value = response.data.filter((item) => item.is_published !== false);
      pagination.value = {
        ...pagination.value,
        currentPage: page,
        totalPages: response.meta.total_pages,
        totalArticles: response.meta.total,
        articlesPerPage: perPage,
      };

      pages.value[cacheKey] = {
        data: { ...response, data: articles.value },
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
    const cacheKey = `${perPage}_${page}_${categoryFilterCacheKey(categoryId)}`;

    loading.value = true;
    error.value = null;

    try {
      const query: Record<string, string | number> = { page, per_page: perPage };
      if (categoryId != null) {
        query.category_id = categoryId;
      }

      const authStore = useAuthStore();
      const response = await $fetch<ArticlesResponse>(`/api/admin/articles`, {
        query,
        headers: authStore.getAuthHeader(),
      });

      adminArticles.value = [...response.data];
      adminPagination.value = {
        ...adminPagination.value,
        currentPage: page,
        totalPages: response.meta.total_pages,
        totalArticles: response.meta.total,
        articlesPerPage: perPage,
      };

      adminPages.value[cacheKey] = {
        data: response,
        meta: response.meta,
      };

      return adminArticles.value;
    } catch (err) {
      const errorObj = err as Error;
      error.value = 'Ошибка загрузки статей: ' + errorObj.message;
      console.error('Ошибка загрузки статей админки:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadArticleById = async (id: string | number): Promise<Article | null> => {
    loading.value = true;
    error.value = null;

    const articleId = Number(id);

    if (cachedArticle.value[articleId]) {
      article.value = { ...cachedArticle.value[articleId] };
      loading.value = false;
      return article.value;
    }

    try {
      const response = await $fetch<Article | { data: Article }>(`/api/articles/${articleId}`);
      const articleData = 'data' in response && response.data && typeof response.data === 'object' && 'id' in response.data
        ? response.data
        : (response as Article);

      if (!articleData?.id) {
        throw new Error('Статья не найдена');
      }

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
        category_id: articleData.category_id ?? null,
        category_name: articleData.category_name,
        category_slug: articleData.category_slug,
        slug: articleData.slug ?? null,
      };

      article.value = newArticle;
      cachedArticle.value[articleId] = { ...newArticle };
      return newArticle;
    } catch (err) {
      const errorObj = err as Error;
      error.value = 'Ошибка загрузки статьи';
      console.error('Ошибка загрузки статьи:', err);
      article.value = null;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const loadArticleByPath = async (categorySlug: string, articleSlug: string): Promise<Article | null> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<Article>(
        `/api/articles/by-path/${encodeURIComponent(categorySlug)}/${encodeURIComponent(articleSlug)}`,
      );

      const newArticle: Article = {
        id: response.id,
        title: response.title,
        content: response.content,
        image_url: response.image_url,
        created_at: response.created_at,
        updated_at: response.updated_at,
        author_id: response.author_id,
        author_name: response.author_name,
        is_published: response.is_published,
        category_id: response.category_id ?? null,
        category_name: response.category_name,
        category_slug: response.category_slug,
        slug: response.slug ?? null,
      };

      article.value = newArticle;
      cachedArticle.value[newArticle.id] = { ...newArticle };
      return newArticle;
    } catch (err) {
      console.error('Ошибка загрузки статьи по пути:', err);
      error.value = 'Ошибка загрузки статьи';
      article.value = null;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const clearPageCache = (page: number, perPage: number, categoryId?: number | null): void => {
    const cacheKey = `${perPage}_${page}_${categoryFilterCacheKey(categoryId)}`;
    delete pages.value[cacheKey];
    delete adminPages.value[cacheKey];
  };

  const addArticle = async (articleData: ArticleFormData): Promise<Article> => {
    loading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append('title', articleData.title);
      formData.append('content', articleData.content);
      formData.append('is_published', String(articleData.is_published ?? true));
      
      if (articleData.category_id != null && articleData.category_id !== undefined) {
        formData.append('category_id', String(articleData.category_id));
      }
      
      if (articleData.file) {
        formData.append('image', articleData.file);
      } else if (articleData.image_url) {
        formData.append('image_url', articleData.image_url);
      }

      const authStore = useAuthStore();
      const response = await $fetch<{ data: { article: Article } }>(
        `/api/articles`,
        {
          method: 'POST',
          body: formData,
          headers: authStore.getAuthHeader(),
        }
      );

      invalidatePublicCache();
      adminPages.value = {};
      
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

      const authStore = useAuthStore();
      const response = await $fetch<{ data: { article: Article } }>(
        `/api/articles/${articleData.id}`,
        {
          method: 'PUT',
          body: formData,
          headers: authStore.getAuthHeader(),
        }
      );

      invalidatePublicCache();
      adminPages.value = {};
      delete cachedArticle.value[articleData.id];

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
      const authStore = useAuthStore();
      await $fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers: authStore.getAuthHeader(),
      });

      invalidatePublicCache();
      adminPages.value = {};
      delete cachedArticle.value[id];
      articles.value = articles.value.filter(a => a.id !== id);
      adminArticles.value = adminArticles.value.filter(a => a.id !== id);

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
      const authStore = useAuthStore();
      const response = await $fetch<{ data: { article: Article; message: string } }>(
        `/api/articles/${id}/toggle-publish`,
        {
          method: 'POST',
          headers: authStore.getAuthHeader(),
        }
      );

      const updatedArticle = response.data.article;

      invalidatePublicCache();
      adminPages.value = {};

      if (cachedArticle.value[id]) {
        cachedArticle.value[id] = { ...updatedArticle };
      }

      const adminIndex = adminArticles.value.findIndex(a => a.id === id);
      if (adminIndex !== -1) {
        adminArticles.value[adminIndex] = { ...updatedArticle };
      }

      // Keep blog list free of unpublished articles
      if (updatedArticle.is_published) {
        const blogIndex = articles.value.findIndex(a => a.id === id);
        if (blogIndex === -1) {
          // will appear after next blog refresh
        } else {
          articles.value[blogIndex] = { ...updatedArticle };
        }
      } else {
        articles.value = articles.value.filter(a => a.id !== id);
      }

      if (article.value?.id === id) {
        article.value = updatedArticle.is_published ? { ...updatedArticle } : null;
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
  const getCurrentArticles = computed((): Article[] =>
    articles.value.filter((item) => item.is_published !== false),
  );
  const getAdminArticles = computed((): Article[] => adminArticles.value);

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
    adminArticles,
    article,
    pages,
    cachedArticle,
    loading,
    error,
    uploadProgress,
    pagination,
    adminPagination,
    originPage,
    
    // Actions
    setOriginPage,
    clearAllCache,
    invalidatePublicCache,
    loadArticles,
    loadAdminArticles,
    loadArticleById,
    loadArticleByPath,
    clearPageCache,
    addArticle,
    editArticle,
    deleteArticle,
    togglePublish,
    
    // Getters
    getCurrentArticles,
    getAdminArticles,
    isLoading,
    getError,
    getArticleById,
    hasCachedData,
  };
});
