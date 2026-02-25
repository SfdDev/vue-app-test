<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from '#imports';
import { useArticlesStore } from '@/store/articles';
import { formatDate, getFullImageUrl } from '@/utils/common';

const articlesStore = useArticlesStore();
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const hadCategoryFilter = ref(false);

const currentId = computed(() => Number(route.params.id));
const article = computed(() => articlesStore.article);

const currentIndex = computed(() => {
  if (!article.value || !articlesStore.articles.length) return -1;
  return articlesStore.articles.findIndex((a: any) => a.id === article.value?.id);
});

const canGoPrevious = computed(() => {
  if (currentIndex.value === -1) return false;
  return currentIndex.value > 0 || articlesStore.pagination.currentPage > 1;
});

const canGoNext = computed(() => {
  if (currentIndex.value === -1) return false;
  return currentIndex.value < articlesStore.articles.length - 1 || articlesStore.pagination.currentPage < articlesStore.pagination.totalPages;
});

async function loadPageForArticle(id: number) {
  if (!id || Number.isNaN(id)) return;
  
  // Сначала загружаем статью чтобы узнать ее категорию
  await articlesStore.loadArticleById(id);
  const currentArticle = articlesStore.article;
  
  if (!currentArticle) return;
  
  const { articlesPerPage } = articlesStore.pagination;
  const categoryId = currentArticle.category_id;

  const response = await $fetch<{ page: number }>(`/api/articles/page-of/${id}`, {
    query: { per_page: articlesPerPage, category_id: categoryId },
  });
  const page = response.page;
  
  // Читаем состояние из sessionStorage
  const referrerData = sessionStorage.getItem('blogReferrer');
  let hadFilter = false;
  let originPageToSave = page;
  
  if (referrerData) {
    try {
      const referrer = JSON.parse(referrerData);
      hadFilter = referrer.category_id !== null;
      originPageToSave = hadFilter ? referrer.page : page;
    } catch (e) {
      console.error('Error parsing referrer data:', e);
    }
    // Очищаем sessionStorage после использования
    sessionStorage.removeItem('blogReferrer');
  }
  
  hadCategoryFilter.value = hadFilter;
  articlesStore.setOriginPage(originPageToSave);

  await articlesStore.loadArticles(page, articlesPerPage, categoryId);
  await articlesStore.loadArticleById(id);
}

async function goToPrevious() {
  if (!article.value?.id) return;

  const { articles, pagination } = articlesStore;
  const idx = articles.findIndex((a: any) => a.id === article.value?.id);

  if (idx > 0) {
    const prevArticle = articles[idx - 1];
    await router.push(`/blog/${prevArticle.category_slug || 'bez-kategorii'}/${prevArticle.id}`);
    return;
  }

  if (pagination.currentPage > 1) {
    const prevPage = pagination.currentPage - 1;
    await articlesStore.loadArticles(prevPage, pagination.articlesPerPage);
    if (articlesStore.articles.length) {
      const lastArticle = articlesStore.articles[articlesStore.articles.length - 1];
      await router.push(`/blog/${lastArticle.category_slug || 'bez-kategorii'}/${lastArticle.id}`);
    }
  }
}

async function goToNext() {
  if (!article.value?.id) return;

  const { articles, pagination } = articlesStore;
  const idx = articles.findIndex((a: any) => a.id === article.value?.id);

  if (idx < articles.length - 1) {
    const nextArticle = articles[idx + 1];
    await router.push(`/blog/${nextArticle.category_slug || 'bez-kategorii'}/${nextArticle.id}`);
  } else if (pagination.currentPage < pagination.totalPages) {
    const nextPage = pagination.currentPage + 1;
    await articlesStore.loadArticles(nextPage);
    if (articlesStore.articles.length) {
      const firstArticle = articlesStore.articles[0];
      await router.push(`/blog/${firstArticle.category_slug || 'bez-kategorii'}/${firstArticle.id}`);
    }
  }
}

function goBack() {
  const page = articlesStore.originPage ?? 1;
  const currentArticle = articlesStore.article;
  const categoryId = currentArticle?.category_id;
  
  let url = '/blog';
  const query: any = {};
  
  if (page > 1) {
    query.page = page.toString();
  }
  
  // Добавляем категорию только если пользователь пришел из отфильтрованного списка
  if (hadCategoryFilter.value && categoryId) {
    query.category_id = categoryId.toString();
  }
  
  if (Object.keys(query).length > 0) {
    url += '?' + new URLSearchParams(query).toString();
  }
  
  router.push(url);
}

onMounted(async () => {
  await loadPageForArticle(currentId.value);
  loading.value = false;
});

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      loading.value = true;
      await loadPageForArticle(Number(newId));
      loading.value = false;
    }
  },
);
</script>

<template>
  <div class="container">
    <div v-if="article && !loading" class="row justify-center">
      <div class="col-12 col-sm-8 col-md-7">
        <article class="card">
          <h1 class="mb-4">
            {{ article.title }}
          </h1>
          <div class="mb-4">
            <div class="d-flex align-center">
              <span>Автор: {{ article.author_name }}</span>
            </div>
            <div class="d-flex align-center">
              <span>Опубликовано: {{ formatDate(article.created_at) }}</span>
            </div>
            <div v-if="article.category_name" class="d-flex align-center">
              <NuxtLink 
                :to="`/blog?category_id=${article.category_id}`" 
                class="category-link"
              >
                Категория: {{ article.category_name }}
              </NuxtLink>
            </div>
          </div>

          <img
            v-if="article.image_url"
            :src="getFullImageUrl(article.image_url)"
            :alt="article.title"
            class="article-image"
            loading="lazy"
          >

          <div class="pa-1">
            <p class="article-content" v-html="article.content" />
          </div>

          <div class="d-flex justify-space-between flex-wrap ga-3 mt-4">
            <NuxtLink to="/blog" class="btn btn--link">
              ← Назад к блогу
            </NuxtLink>
            <button
              class="btn"
              type="button"
              @click="goBack"
            >
              Назад
            </button>

            <div class="d-flex justify-space-between ga-3">
              <button
                class="btn"
                type="button"
                :disabled="!canGoPrevious"
                :aria-disabled="!canGoPrevious"
                @click="goToPrevious"
              >
                Предыдущая
              </button>
              <button
                class="btn"
                type="button"
                :disabled="!canGoNext"
                :aria-disabled="!canGoNext"
                @click="goToNext"
              >
                Следующая
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>

    <div v-else class="row fill-height">
      <div class="col text-center">
        Загрузка...
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.article {
  background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('/image/X9PvihJXUDNmsaJpAPJD--0--6soyy.webp');
  background-position: center;
  background-size: cover;
}

.article-content :deep(p) {
  margin-bottom: 1rem;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.article-image {
  border-radius: 4px;
  margin: 16px 0;
}

.category-link {
  color: #1976d2;
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: #1565c0;
    text-decoration: underline;
  }
}

.btn--link {
  text-decoration: none;
  color: inherit;
}
</style>

