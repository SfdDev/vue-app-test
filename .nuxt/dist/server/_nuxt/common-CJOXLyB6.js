import { u as useAuthStore } from "./auth-DqrS12MN.js";
import { ref, computed } from "vue";
import { defineStore } from "pinia";
import "/home/dmt/projects/vue-app-test/node_modules/hookable/dist/index.mjs";
import "../server.mjs";
const useArticlesStore = defineStore("articles", () => {
  const articles = ref([]);
  const article = ref(null);
  const pages = ref({});
  const cachedArticle = ref({});
  const loading = ref(false);
  const error = ref(null);
  const uploadProgress = ref(0);
  const originPage = ref(1);
  const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalArticles: 0,
    articlesPerPage: 6
  });
  const setOriginPage = (page) => {
    originPage.value = page;
  };
  const clearAllCache = () => {
    pages.value = {};
    cachedArticle.value = {};
    pagination.value = {
      currentPage: 1,
      totalPages: 1,
      totalArticles: 0,
      articlesPerPage: 6
    };
    articles.value = [];
  };
  const loadArticles = async (page = 1, perPage = 6, categoryId) => {
    const cacheKey = `${perPage}_${page}_${categoryId || "all"}`;
    if (pages.value[cacheKey]) {
      articles.value = [...pages.value[cacheKey].data.data];
      pagination.value = {
        ...pagination.value,
        currentPage: page,
        totalPages: pages.value[cacheKey].meta.total_pages,
        totalArticles: pages.value[cacheKey].meta.total
      };
      return articles.value;
    }
    loading.value = true;
    error.value = null;
    try {
      const query = { page, per_page: perPage };
      if (categoryId) {
        query.category_id = categoryId;
      }
      const response = await $fetch(`/api/articles`, {
        query
      });
      articles.value = [...response.data];
      pagination.value = {
        ...pagination.value,
        currentPage: page,
        totalPages: response.meta.total_pages,
        totalArticles: response.meta.total,
        articlesPerPage: perPage
      };
      pages.value[cacheKey] = {
        data: response,
        meta: response.meta
      };
      return articles.value;
    } catch (err) {
      const errorObj = err;
      error.value = "Ошибка загрузки статей: " + errorObj.message;
      console.error("Ошибка загрузки статей:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const loadAdminArticles = async (page = 1, perPage = 4, categoryId) => {
    const cacheKey = `${perPage}_${page}_${categoryId || "all"}`;
    loading.value = true;
    error.value = null;
    try {
      const query = { page, per_page: perPage };
      if (categoryId) {
        query.category_id = categoryId;
      }
      const authStore = useAuthStore();
      const response = await $fetch(`/api/admin/articles`, {
        query,
        headers: authStore.getAuthHeader()
      });
      articles.value = [...response.data];
      pagination.value = {
        ...pagination.value,
        currentPage: page,
        totalPages: response.meta.total_pages,
        totalArticles: response.meta.total,
        articlesPerPage: perPage
      };
      pages.value[cacheKey] = {
        data: response,
        meta: response.meta
      };
      return articles.value;
    } catch (err) {
      const errorObj = err;
      error.value = "Ошибка загрузки статей: " + errorObj.message;
      console.error("Ошибка загрузки статей админки:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const loadArticleById = async (id) => {
    loading.value = true;
    error.value = null;
    const articleId = Number(id);
    if (cachedArticle.value[articleId]) {
      article.value = { ...cachedArticle.value[articleId] };
      loading.value = false;
      return;
    }
    try {
      const response = await $fetch(`/api/articles/${articleId}`);
      const articleData = response.data;
      const newArticle = {
        id: articleData.id,
        title: articleData.title,
        content: articleData.content,
        image_url: articleData.image_url,
        created_at: articleData.created_at,
        updated_at: articleData.updated_at,
        author_id: articleData.author_id,
        author_name: articleData.author_name,
        is_published: articleData.is_published
      };
      article.value = newArticle;
      cachedArticle.value[articleId] = { ...newArticle };
    } catch (err) {
      error.value = "Ошибка загрузки статьи";
      console.error("Ошибка загрузки статьи:", err);
      article.value = null;
    } finally {
      loading.value = false;
    }
  };
  const clearPageCache = (page, perPage) => {
    const cacheKey = `${perPage}_${page}`;
    if (pages.value[cacheKey]) {
      delete pages.value[cacheKey];
    }
  };
  const addArticle = async (articleData) => {
    loading.value = true;
    error.value = null;
    try {
      const formData = new FormData();
      formData.append("title", articleData.title);
      formData.append("content", articleData.content);
      formData.append("is_published", String(articleData.is_published ?? true));
      if (articleData.category_id != null && articleData.category_id !== void 0) {
        formData.append("category_id", String(articleData.category_id));
      }
      if (articleData.file) {
        formData.append("image", articleData.file);
      } else if (articleData.image_url) {
        formData.append("image_url", articleData.image_url);
      }
      const authStore = useAuthStore();
      const response = await $fetch(
        `/api/articles`,
        {
          method: "POST",
          body: formData,
          headers: authStore.getAuthHeader()
        }
      );
      clearPageCache(pagination.value.currentPage, pagination.value.articlesPerPage);
      await loadArticles(1, pagination.value.articlesPerPage);
      return response.data.article;
    } catch (err) {
      const errorObj = err;
      const errorMessage = errorObj.data?.error || errorObj.message;
      error.value = `Ошибка добавления статьи: ${errorMessage}`;
      console.error("Ошибка добавления статьи:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const editArticle = async (articleData) => {
    loading.value = true;
    error.value = null;
    try {
      const formData = new FormData();
      formData.append("title", articleData.title);
      formData.append("content", articleData.content);
      formData.append("is_published", String(articleData.is_published ?? true));
      if (articleData.category_id !== void 0) {
        formData.append("category_id", String(articleData.category_id));
      }
      if (articleData.file) {
        formData.append("image", articleData.file);
      } else if (articleData.image_url) {
        formData.append("image_url", articleData.image_url);
      }
      const authStore = useAuthStore();
      const response = await $fetch(
        `/api/articles/${articleData.id}`,
        {
          method: "PUT",
          body: formData,
          headers: authStore.getAuthHeader()
        }
      );
      clearPageCache(pagination.value.currentPage, pagination.value.articlesPerPage);
      if (cachedArticle.value[articleData.id]) {
        delete cachedArticle.value[articleData.id];
      }
      await loadArticles(pagination.value.currentPage, pagination.value.articlesPerPage);
      return response.data.article;
    } catch (err) {
      console.error("Ошибка редактирования статьи:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const deleteArticle = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const authStore = useAuthStore();
      await $fetch(`/api/articles/${id}`, {
        method: "DELETE",
        headers: authStore.getAuthHeader()
      });
      for (const key in pages.value) {
        const pageData = pages.value[key];
        pageData.data.data = pageData.data.data.filter((article2) => article2.id !== id);
      }
      if (cachedArticle.value[id]) {
        delete cachedArticle.value[id];
      }
      articles.value = articles.value.filter((article2) => article2.id !== id);
      pagination.value.totalArticles = Math.max(0, pagination.value.totalArticles - 1);
      pagination.value.totalPages = Math.ceil(
        pagination.value.totalArticles / pagination.value.articlesPerPage
      );
      if (article.value?.id === id) {
        article.value = null;
      }
    } catch (err) {
      const errorObj = err;
      error.value = "Ошибка удаления статьи: " + errorObj.message;
      console.error("Ошибка удаления статьи:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const togglePublish = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const authStore = useAuthStore();
      const response = await $fetch(
        `/api/articles/${id}/toggle-publish`,
        {
          method: "POST",
          headers: authStore.getAuthHeader()
        }
      );
      const updatedArticle = response.data.article;
      if (cachedArticle.value[id]) {
        cachedArticle.value[id] = { ...updatedArticle };
      }
      for (const key in pages.value) {
        const pageData = pages.value[key];
        const articleIndex2 = pageData.data.data.findIndex((article2) => article2.id === id);
        if (articleIndex2 !== -1) {
          pageData.data.data[articleIndex2] = { ...updatedArticle };
        }
      }
      const articleIndex = articles.value.findIndex((article2) => article2.id === id);
      if (articleIndex !== -1) {
        articles.value[articleIndex] = { ...updatedArticle };
      }
      if (article.value?.id === id) {
        article.value = { ...updatedArticle };
      }
      return updatedArticle;
    } catch (err) {
      const errorObj = err;
      error.value = "Ошибка изменения статуса публикации: " + errorObj.message;
      console.error("Ошибка изменения статуса публикации:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const getCurrentArticles = computed(() => {
    const cacheKey = `${pagination.value.articlesPerPage}_${pagination.value.currentPage}`;
    return pages.value[cacheKey]?.data?.data || articles.value;
  });
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);
  const getArticleById = (id) => cachedArticle.value[id] || null;
  const hasCachedData = computed(
    () => Object.keys(pages.value).length > 0 || Object.keys(cachedArticle.value).length > 0
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
    hasCachedData
  };
});
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("/")) {
    return imagePath;
  }
  return `/${imagePath}`;
};
function useAuth() {
  const authStore = useAuthStore();
  const isAuthenticated = computed(() => !!authStore.user);
  const currentUsername = computed(() => authStore.user?.username || "");
  return {
    isAuthenticated,
    currentUsername
  };
}
function useBaseLinks() {
  const navLinks = ref([
    { text: "Главная", href: "/" },
    { text: "О нас", href: "/about" },
    { text: "Блог", href: "/blog", hasSubmenu: true }
  ]);
  return { navLinks };
}
function useSocialIcons() {
  const socialIcons = ref([
    { name: "instagram", link: "https://www.instagram.com" },
    { name: "telegram", link: "https://telegram.org" },
    { name: "vk", link: "https://vk.com" },
    { name: "github", link: "https://github.com" },
    { name: "youtube", link: "https://www.youtube.com" }
  ]);
  return { socialIcons };
}
export {
  useAuth as a,
  useSocialIcons as b,
  useBaseLinks as c,
  formatDate as f,
  getFullImageUrl as g,
  useArticlesStore as u
};
//# sourceMappingURL=common-CJOXLyB6.js.map
