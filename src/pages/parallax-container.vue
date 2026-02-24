<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from '@/components/hero.vue';

gsap.registerPlugin(ScrollTrigger);

const box = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!box.value) return;
  gsap.from(box.value, {
    scrollTrigger: {
      trigger: box.value,
      start: 'top 80%',
      end: 'top 30%',
      toggleActions: 'play none none reverse',
    },
    y: 100,
    opacity: 0,
    duration: 1,
    ease: 'power2.out',
  });
});
</script>

<template>
  <Hero />
  <section style="height: 150vh; background: #f3f3f3;">
    <div ref="box" class="box">
      ScrollTrigger работает 🚀
    </div>
  </section>
  <div class="parallax-container" />
  <div class="scroll-spacer" />
</template>

<style scoped lang="scss">
.parallax {
  background-image: url('/image/todo.webp');
  background-position: center;
  background-size: cover;
}
</style>

