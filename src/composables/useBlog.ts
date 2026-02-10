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

  onMounted(loadInitialData);

  watch(
    () => route.query.page,
    async (newPage) => {
      const page = Number.parseInt((newPage as string) || '1', 10) || 1;
      if (page !== articlesStore.pagination.currentPage) {
        await articlesStore.loadArticles(page, perPage);
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

    if (pageNum !== articlesStore.pagination.currentPage) {
      try {
        await articlesStore.loadArticles(pageNum, perPage);
        if (pageNum === 1) {
          router.push({ path: baseRoute });
        } else {
          router.push({ path: baseRoute, query: { page: pageNum } });
        }
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
  };
}

