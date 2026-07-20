import { computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, navigateTo } from '#imports';
import { useArticlesStore } from '@/store/articles';
import { useCategoryStore } from '@/store/categories';
import { ARTICLES_CHANGED_EVENT, ARTICLES_SYNC_KEY } from '@/shared/articles-sync';
import {
  categoryFilterToSlug,
  resolveCategoryFilterQuery,
} from '@/shared/category-filter';

export function useBlog(perPage = 6, _baseRoute = '/blog') {
  const articlesStore = useArticlesStore();
  const categoryStore = useCategoryStore();
  const route = useRoute();

  const articles = computed(() => articlesStore.getCurrentArticles);
  let activeCategoryId: number | null = null;
  let routeSyncLock = false;

  function blogListQuery(page: number) {
    const query: Record<string, string> = {};
    if (page > 1) query.page = String(page);
    const slug = categoryFilterToSlug(activeCategoryId, categoryStore.getCategories);
    if (slug) query.category = slug;
    return query;
  }

  async function syncBlogRoute(page: number) {
    const nextQuery = blogListQuery(page);
    const same =
      String(route.query.page ?? '') === String(nextQuery.page ?? '') &&
      String(route.query.category ?? '') === String(nextQuery.category ?? '');
    if (same) return;

    routeSyncLock = true;
    try {
      await navigateTo({ path: '/blog', query: nextQuery }, { replace: true });
      await nextTick();
    } finally {
      routeSyncLock = false;
    }
  }

  const refresh = async (page = 1, categoryId: number | null = activeCategoryId) => {
    let targetPage = Math.max(1, page);
    activeCategoryId = categoryId;

    await articlesStore.loadArticles(targetPage, perPage, activeCategoryId, true);

    const totalPages = articlesStore.pagination.totalPages;
    if (totalPages > 0 && targetPage > totalPages) {
      targetPage = totalPages;
      await articlesStore.loadArticles(targetPage, perPage, activeCategoryId, true);
    } else if (targetPage > 1 && articlesStore.articles.length === 0) {
      targetPage = 1;
      await articlesStore.loadArticles(targetPage, perPage, activeCategoryId, true);
    }

    if (route.path === '/blog') {
      await syncBlogRoute(targetPage);
    }
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === ARTICLES_SYNC_KEY) {
      void refresh(articlesStore.pagination.currentPage, activeCategoryId);
    }
  };

  const onArticlesChanged = () => {
    if (!route.path.startsWith('/blog') || route.path.startsWith('/blog/')) return;
    void refresh(articlesStore.pagination.currentPage, activeCategoryId);
  };

  onMounted(() => {
    window.addEventListener('storage', onStorage);
    window.addEventListener(ARTICLES_CHANGED_EVENT, onArticlesChanged);
  });

  onUnmounted(() => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(ARTICLES_CHANGED_EVENT, onArticlesChanged);
  });

  // Fresh fetch on every visit to /blog (including SPA navigation from admin)
  watch(
    () => route.fullPath,
    async (path) => {
      if (routeSyncLock) return;
      if (!path.startsWith('/blog') || path.startsWith('/blog/')) return;

      if (!categoryStore.getCategories.length) {
        await categoryStore.loadCategories();
      }

      const page = Number.parseInt((route.query.page as string) || '1', 10) || 1;
      const categoryId = resolveCategoryFilterQuery(
        route.query.category,
        categoryStore.getCategories,
        route.query.category_id,
      );
      await refresh(page, categoryId);
    },
    { immediate: true },
  );

  const changePage = async (page: number) => {
    const pageNum = Number.parseInt(String(page), 10) || 1;

    if (pageNum < 1 || pageNum > articlesStore.pagination.totalPages) {
      console.warn('Некорректный номер страницы:', page);
      return;
    }

    if (pageNum !== articlesStore.pagination.currentPage) {
      try {
        await refresh(pageNum, activeCategoryId);
      } catch (error) {
        console.error('Ошибка при загрузке страницы:', error);
      }
    }
  };

  return {
    articles,
    pagination: computed(() => articlesStore.pagination),
    changePage,
    loadArticles: async (page: number, categoryId?: number | null) => {
      await refresh(page, categoryId ?? null);
    },
  };
}
