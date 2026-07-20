<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter, navigateTo } from '#imports';
import { articlePublicPath } from '@/shared/slugify';

definePageMeta({
  name: 'blog-id',
});

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  const raw = String(route.params.id || '');
  const id = Number.parseInt(raw, 10);
  if (!id) {
    await navigateTo('/blog');
    return;
  }

  try {
    const article = await $fetch<{
      id: number;
      slug?: string | null;
      category_id?: number | null;
      category_slug?: string | null;
    }>(`/api/articles/${id}`);
    await router.replace(articlePublicPath(article));
  } catch {
    await navigateTo('/blog');
  }
});
</script>

<template>
  <section class="article">
    <div class="container">
      <div class="article__loading">
        Перенаправление…
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.article__loading {
  text-align: center;
  padding: 3rem 0;
}
</style>
