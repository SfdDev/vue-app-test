import { computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from '#imports';
import { useArticlesStore } from '@/store/articles';

export function useBlog(perPage = 6, baseRoute = '/blog') {
  const articlesStore = useArticlesStore();
  const route = useRoute();
  const router = useRouter();

  const articles = computed(() => articlesStore.getCurrentArticles);

  const loadArticles = async (page: number, categoryId?: number | null) => {
    await articlesStore.loadArticles(page, perPage, categoryId);
  };

  return {
    articles,
    pagination: computed(() => articlesStore.pagination),
    loadArticles,
  };
}
