<script setup lang="ts">
import Header from '@/components/header.vue';
import Footer from '@/components/footer.vue';
</script>

<template>
  <div class="app">
    <Header />
    <main>
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
}
</style>

