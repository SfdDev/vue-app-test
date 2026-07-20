<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from '#imports';
import { useArticlesStore } from '@/store/articles';
import { formatDate, getFullImageUrl } from '@/utils/common';
import {
  UNCATEGORIZED_CATEGORY_ID,
  UNCATEGORIZED_CATEGORY_NAME,
} from '@/shared/category-filter';
import { articlePublicPath } from '@/shared/slugify';
import Pagination from '@/components/UI/pagination.vue';

interface ArticleItem {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  created_at?: string;
  author_name?: string;
  is_published?: boolean;
  category_id?: number | null;
  category_name?: string;
  category_slug?: string | null;
  slug?: string | null;
}

definePageMeta({
  name: 'blog-article',
});

const SIBLINGS_PER_PAGE = 6;

const articlesStore = useArticlesStore();
const route = useRoute();

const loading = ref(true);
const loadError = ref<string | null>(null);
const categorySiblings = ref<ArticleItem[]>([]);
const siblingsPage = ref(1);
const siblingsTotalPages = ref(1);
const siblingsLoading = ref(false);
const activeCategoryId = ref<number | null>(null);

const categoryParam = computed(() => String(route.params.category || ''));
const slugParam = computed(() => String(route.params.slug || ''));
const article = computed(() => articlesStore.article);

const categoryLabel = computed(() => {
  if (!article.value) return '';
  return article.value.category_name || UNCATEGORIZED_CATEGORY_NAME;
});

function categoryFilterId(articleData: { category_id?: number | null }): number {
  return articleData.category_id ?? UNCATEGORIZED_CATEGORY_ID;
}

function pathFor(item: ArticleItem): string {
  return articlePublicPath(item);
}

async function loadCategorySiblings(categoryId: number, page = 1) {
  siblingsLoading.value = true;
  try {
    const response = await $fetch<{
      data: ArticleItem[];
      meta: { total_pages: number; current_page: number; total: number };
    }>('/api/articles', {
      query: {
        page,
        per_page: SIBLINGS_PER_PAGE,
        category_id: categoryId,
        _: Date.now(),
      },
    });

    categorySiblings.value = response.data.filter((item) => item.is_published !== false);
    siblingsPage.value = response.meta.current_page;
    siblingsTotalPages.value = Math.max(1, response.meta.total_pages);
  } finally {
    siblingsLoading.value = false;
  }
}

async function onSiblingsPageChange(page: number) {
  if (activeCategoryId.value == null) return;
  await loadCategorySiblings(activeCategoryId.value, page);
}

async function loadPageForPath(category: string, slug: string) {
  if (!category || !slug) {
    loadError.value = 'Некорректный адрес статьи';
    return;
  }

  loadError.value = null;
  const loaded = await articlesStore.loadArticleByPath(category, slug);
  if (!loaded) {
    loadError.value = 'Статья не найдена';
    categorySiblings.value = [];
    siblingsTotalPages.value = 1;
    return;
  }

  activeCategoryId.value = categoryFilterId(loaded);
  await loadCategorySiblings(activeCategoryId.value, 1);
}

watch(
  [categoryParam, slugParam],
  async ([category, slug]) => {
    loading.value = true;
    await loadPageForPath(category, slug);
    loading.value = false;
  },
  { immediate: true },
);
</script>

<template>
  <section class="article">
    <div class="container">
      <div v-if="article && !loading" class="row justify-center">
        <div class="col-12 col-sm-8 col-md-7">
          <article class="card article__card">
            <h1 class="article__title">
              {{ article.title }}
            </h1>
            <div class="article__meta">
              <div>Автор: {{ article.author_name }}</div>
              <div>Опубликовано: {{ formatDate(article.created_at) }}</div>
              <div>Категория: {{ categoryLabel }}</div>
            </div>

            <img
              v-if="article.image_url"
              :src="getFullImageUrl(article.image_url)"
              :alt="article.title"
              class="article-image"
              loading="lazy"
            >

            <div class="article__body">
              <p class="article-content" v-html="article.content" />
            </div>

            <div class="article__actions">
              <NuxtLink to="/blog" class="btn btn--link">
                ← Назад к блогу
              </NuxtLink>
            </div>

            <div class="article__siblings">
              <h2 class="article__siblings-title">
                Ещё в категории «{{ categoryLabel }}»
              </h2>

              <div v-if="siblingsLoading" class="article__siblings-loading">
                Загрузка…
              </div>
              <ul v-else-if="categorySiblings.length" class="article__siblings-list">
                <li
                  v-for="sibling in categorySiblings"
                  :key="sibling.id"
                >
                  <NuxtLink
                    :to="pathFor(sibling)"
                    class="article__sibling-link"
                    :class="{ 'article__sibling-link--current': sibling.id === article.id }"
                  >
                    {{ sibling.title }}
                  </NuxtLink>
                </li>
              </ul>
              <p v-else class="article__siblings-empty">
                Других статей в этой категории пока нет
              </p>

              <Pagination
                v-if="siblingsTotalPages > 1"
                :model-value="siblingsPage"
                :total-pages="siblingsTotalPages"
                :sync-route="false"
                @update:model-value="onSiblingsPageChange"
              />
            </div>
          </article>
        </div>
      </div>

      <div v-else-if="loading" class="article__loading">
        Загрузка...
      </div>
      <div v-else class="article__loading">
        {{ loadError || 'Статья не найдена' }}
        <div>
          <NuxtLink to="/blog" class="btn btn--link">
            ← Назад к блогу
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.article {
  &__card {
    padding: 1.5rem;
  }

  &__title {
    margin: 0 0 1rem;
  }

  &__meta {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__body {
    padding: 0.25rem 0;
  }

  &__actions {
    display: flex;
    margin-top: 1.5rem;
  }

  &__siblings {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  &__siblings-title {
    margin: 0 0 0.75rem;
    font-size: 1.1rem;
  }

  &__siblings-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__siblings-loading,
  &__siblings-empty {
    margin: 0.5rem 0 0;
    opacity: 0.8;
  }

  &__sibling-link {
    color: inherit;
    text-decoration: underline;

    &--current {
      font-weight: 700;
      text-decoration: none;
      pointer-events: none;
    }
  }

  &__loading {
    text-align: center;
    padding: 3rem 0;
  }
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
  width: 100%;
  max-height: 420px;
  object-fit: cover;
}
</style>
