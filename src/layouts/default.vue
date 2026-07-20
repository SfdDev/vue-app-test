<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from '#imports';
import Header from '@/components/header.vue';
import Footer from '@/components/footer.vue';

const route = useRoute();

const pageClassByRoute: Record<string, string> = {
  index: 'home-page',
  home: 'home-page',
  about: 'about-page',
  learn: 'learn-page',
  blog: 'blog-page',
  'blog-id': 'article-page',
  'blog-article': 'article-page',
  auth: 'auth-page',
  admin: 'admin-page',
  'parallax-container': 'parallax-page',
};

const pageClass = computed(() => {
  const name = String(route.name ?? '');
  return pageClassByRoute[name] ?? '';
});
</script>

<template>
  <div class="app">
    <Header />
    <main :class="pageClass">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<style scoped lang="scss">
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}
</style>
