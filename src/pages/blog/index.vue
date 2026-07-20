<script setup lang="ts">
import Hero from '@/components/hero.vue';
import Pagination from '@/components/UI/pagination.vue';
import CategoryFilter from '@/components/CategoryFilter.vue';
import { formatDate, getFullImageUrl } from '@/utils/common';
import { useBlog } from '@/composables/useBlog';
import { ref, watch } from 'vue';
import { articlePublicPath } from '@/shared/slugify';

const { articles, pagination, loadArticles, changePage } = useBlog(6, '/blog');
const selectedCategory = ref<number | null>(null);

watch(selectedCategory, async (newCategory) => {
  // Reset to page 1 for the selected filter (do not keep ?page from previous filter)
  await loadArticles(1, newCategory);
});

function onCategoryChanged(categoryId: number | null) {
  selectedCategory.value = categoryId;
}

function articleLink(article: { id: number; slug?: string | null; category_id?: number | null; category_slug?: string | null }) {
  return articlePublicPath(article);
}
</script>

<template>
  <Hero />
  <section class="blog">
    <CategoryFilter @categoryChanged="onCategoryChanged" />
    <div class="blog__content">
      <div class="container">
        <div class="row">
          <div
            v-for="article in articles"
            :key="article.id"
            class="col-12 col-sm-6 col-lg-4"
          >
            <article class="card" @click="$router.push(articleLink(article))">
              <img
                class="card__image"
                :src="getFullImageUrl(article.image_url)"
                alt=""
                loading="lazy"
              >
              <div class="card__body">
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
                <hr class="hr-pixel">
                <div class="card__category">
                  Категория: {{ article.category_name || 'Без категории' }}
                </div>
                <hr class="hr-pixel">
                <p class="card__description">
                  {{ article.content }}...
                </p>
                <hr class="hr-pixel">
                <div class="card__footer">
                  <button
                    class="btn"
                    type="button"
                    @click.stop="$router.push(articleLink(article))"
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
          :sync-route="false"
          @update:model-value="changePage"
        />
      </div>
    </div>
  </section>
</template>
