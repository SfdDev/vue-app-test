<script setup lang="ts">
import Hero from '@/components/hero.vue';
import Pagination from '@/components/UI/pagination.vue';
import { formatDate, getFullImageUrl } from '@/utils/common';
import { useBlog } from '@/composables/useBlog';

const { articles, pagination, changePage } = useBlog(6, '/blog');
</script>

<template>
  <Hero />
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
              <hr class="hr-pixel">
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
        @update:model-value="changePage"
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

