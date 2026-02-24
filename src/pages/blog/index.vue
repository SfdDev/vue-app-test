<script setup lang="ts">
import Hero from '@/components/hero.vue';
import Pagination from '@/components/UI/pagination.vue';
import CategoryFilter from '@/components/CategoryFilter.vue';
import { formatDate, getFullImageUrl } from '@/utils/common';
import { useBlog } from '@/composables/useBlog';
import { ref, watch } from 'vue';

const { articles, pagination, loadArticles } = useBlog(6, '/blog');
const selectedCategory = ref<number | null>(null);

// Следим за изменением категории и перезагружаем статьи
watch(selectedCategory, async (newCategory) => {
  await loadArticles(1, newCategory);
});

function onCategoryChanged(categoryId: number | null) {
  selectedCategory.value = categoryId;
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
          <article class="card" @click="$router.push(`/blog/${article.id}`)">
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
                  @click.stop="$router.push(`/blog/${article.id}`)"
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
        @update:model-value="(page) => pagination.currentPage = page"
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
</style>

