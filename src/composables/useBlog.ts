import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from '#imports';
import { useArticlesStore } from '@/store/articles';

export function useBlog(perPage = 6, baseRoute = '/blog') {
  const articlesStore = useArticlesStore();
  const route = useRoute();
  const router = useRouter();

  const articles = computed(() => articlesStore.getCurrentArticles);

  const loadInitialData = async () => {
    const page = Number.parseInt((route.query.page as string) || '1', 10) || 1;
    await articlesStore.loadArticles(page, perPage);
  };

  const loadArticles = async (page: number, categoryId?: number | null) => {
    await articlesStore.loadArticles(page, perPage, categoryId);
  };

  onMounted(loadInitialData);

  // Следим за изменениями URL для обновления данных
  watch(
    () => route.query.page,
    async (newPage) => {
      const page = Number.parseInt((newPage as string) || '1', 10) || 1;
      if (page !== articlesStore.pagination.currentPage) {
        await articlesStore.loadArticles(page, perPage);
      }
    },
  );

  // Следим за изменениями currentPage для загрузки данных
  watch(
    () => articlesStore.pagination.currentPage,
    async (newPage) => {
      if (newPage && newPage !== Number.parseInt((route.query.page as string) || '1', 10)) {
        await articlesStore.loadArticles(newPage, perPage);
      }
    },
  );

  const changePage = async (page: number) => {
    const pageNum = Number.parseInt(String(page), 10) || 1;

    if (pageNum < 1 || pageNum > articlesStore.pagination.totalPages) {
      // eslint-disable-next-line no-console
      console.warn('Некорректный номер страницы:', page);
      return;
    }

    // Просто обновляем данные, URL обновится в компоненте пагинации
    if (pageNum !== articlesStore.pagination.currentPage) {
      try {
        await articlesStore.loadArticles(pageNum, perPage);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Ошибка при загрузке страницы:', error);
      }
    }
  };

  return {
    articles,
    pagination: computed(() => articlesStore.pagination),
    changePage,
    loadArticles,
  };
}

