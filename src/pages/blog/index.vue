<script setup lang="ts">
import Hero from '@/components/hero.vue';
import Pagination from '@/components/UI/pagination.vue';
import CategoryFilter from '@/components/CategoryFilter.vue';
import { formatDate, getFullImageUrl } from '@/utils/common';
import { useBlog } from '@/composables/useBlog';
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from '#imports';

const { articles, pagination, loadArticles } = useBlog(6, '/blog');
const selectedCategory = ref<number | null>(null);
const router = useRouter();
const route = useRoute();

// Синхронизируем категорию с URL при загрузке
onMounted(async () => {
  const categoryId = route.query.category_id ? Number.parseInt(route.query.category_id as string, 10) : null;
  const page = Number.parseInt((route.query.page as string) || '1', 10) || 1;
  
  selectedCategory.value = categoryId;
  await loadArticles(page, categoryId);
});

function onCategoryChanged(categoryId: number | null) {
  selectedCategory.value = categoryId;
  
  // При смене категории всегда переходим на страницу 1 и загружаем статьи
  const query: any = { page: '1' };
  if (categoryId) {
    query.category_id = categoryId.toString();
  }
  router.push({ path: '/blog', query });
  
  // Загружаем статьи для новой категории
  loadArticles(1, categoryId);
}

async function onPageChange(page: number) {
  // Обновляем URL, всегда включая page параметр
  const query: any = { page: page.toString() };
  if (selectedCategory.value) {
    query.category_id = selectedCategory.value.toString();
  }
  await router.push({ path: '/blog', query });
  
  // Загружаем статьи напрямую
  await loadArticles(page, selectedCategory.value);
}

function getArticleUrl(article: any) {
  const baseUrl = `/blog/${article.category_slug || 'bez-kategorii'}/${article.id}`;
  
  // Если есть фильтр категории, сохраняем состояние в sessionStorage
  if (selectedCategory.value) {
    sessionStorage.setItem('blogReferrer', JSON.stringify({
      category_id: selectedCategory.value,
      page: pagination.value.currentPage
    }));
  } else {
    sessionStorage.removeItem('blogReferrer');
  }
  
  return baseUrl;
}
</script>

<template>
  <Hero />
  <CategoryFilter @categoryChanged="onCategoryChanged" />
  <div class="blog__content">
    <div class="container">
      <div class="row">
        <div
          v-for="article in articles"
          :key="article.id"
          class="col-12 col-sm-6 col-lg-4"
        >
          <article class="card" @click="$router.push(getArticleUrl(article))">
            <img
              class="card__image"
              :src="getFullImageUrl(article.image_url)"
              alt=""
              loading="lazy"
            >
            <div class="pa-5">
              <h3 class="card__headline">
                {{ article.title }}
              </h3>
              <hr class="hr-pixel">
              <div class="card__created">
                Опубликовано: {{ formatDate(article.created_at) }}
              </div>
              <hr class="hr-pixel">
              <div class="card__author">
                Автор: {{ article.author_name }}
              </div>
              <hr class="hr-pixel" v-if="article.category_name">
              <div class="card__category" v-if="article.category_name">
                Категория: {{ article.category_name }}
              </div>
              <hr class="hr-pixel" v-if="article.category_name">
              <p class="card__description">
                {{ article.content }}...
              </p>
              <hr class="hr-pixel">
              <div class="card__footer mt-5">
                <button
                  class="btn"
                  type="button"
                  @click.stop="$router.push(getArticleUrl(article))"
                >
                  Читать дальше
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <Pagination
        :total-pages="pagination.totalPages"
        :model-value="pagination.currentPage"
        @update:model-value="onPageChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.blog {
  background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('/image/2wq.webp');
  background-position: center;
  background-size: cover;
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
</style>

