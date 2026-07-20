<script setup lang="ts">
import { computed, nextTick } from 'vue';
import { useRouter, useRoute } from '#imports';

const props = defineProps<{
  modelValue: number;
  totalPages: number;
  syncRoute?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const router = useRouter();
const route = useRoute();

const MAX_VISIBLE_PAGES = 5;

const pages = computed(() => {
  const total = props.totalPages;
  const current = props.modelValue;
  const max = MAX_VISIBLE_PAGES;

  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = Math.max(1, current - Math.floor(max / 2));
  let end = Math.min(total, start + max - 1);

  if (end - start < max - 1) {
    start = Math.max(1, end - max + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

const isFirstPage = computed(() => props.modelValue <= 1);
const isLastPage = computed(() => props.modelValue >= props.totalPages);

const handlePageChange = (page: number) => {
  if (page < 1 || page > props.totalPages || page === props.modelValue) return;

  emit('update:modelValue', page);

  if (props.syncRoute === false) return;

  nextTick(() => {
    const currentPath = route.path;
    if (page === 1) {
      router.push(currentPath);
    } else {
      router.push({ path: currentPath, query: { page: page.toString() } });
    }
  });
};
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="pagination"
    aria-label="Пагинация"
  >
    <button
      class="btn pagination__edge"
      type="button"
      :disabled="isFirstPage"
      aria-label="Первая страница"
      title="Первая страница"
      @click="handlePageChange(1)"
    >
      «
    </button>

    <button
      class="btn pagination__step"
      type="button"
      :disabled="isFirstPage"
      aria-label="Предыдущая страница"
      @click="handlePageChange(modelValue - 1)"
    >
      Назад
    </button>

    <button
      v-for="page in pages"
      :key="page"
      class="btn pagination__page"
      :class="{ 'pagination__page--active': page === modelValue }"
      type="button"
      :aria-current="page === modelValue ? 'page' : undefined"
      :aria-label="`Страница ${page}`"
      @click="handlePageChange(page)"
    >
      {{ page }}
    </button>

    <button
      class="btn pagination__step"
      type="button"
      :disabled="isLastPage"
      aria-label="Следующая страница"
      @click="handlePageChange(modelValue + 1)"
    >
      Вперёд
    </button>

    <button
      class="btn pagination__edge"
      type="button"
      :disabled="isLastPage"
      aria-label="Последняя страница"
      title="Последняя страница"
      @click="handlePageChange(totalPages)"
    >
      »
    </button>
  </nav>
</template>

<style scoped lang="scss">
.pagination {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 16px;
}

.pagination__page--active {
  font-weight: 700;
}

.pagination__step {
  min-width: 5.5rem;
}
</style>
