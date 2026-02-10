<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const pages = computed(() => {
  const total = props.totalPages;
  const current = props.modelValue;
  const max = 3;

  let start = Math.max(1, current - Math.floor(max / 2));
  let end = Math.min(total, start + max - 1);

  if (end - start < max - 1) {
    start = Math.max(1, end - max + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});
</script>

<template>
  <div v-if="totalPages > 1" class="pagination">
    <button
      class="btn pagination__arrow"
      type="button"
      :disabled="modelValue === 1"
      @click="emit('update:modelValue', 1)"
    >
      ←
    </button>

    <button
      v-for="page in pages"
      :key="page"
      class="btn pagination__page"
      :class="{ 'pagination__page--active': page === modelValue }"
      type="button"
      @click="emit('update:modelValue', page)"
    >
      {{ page }}
    </button>

    <button
      class="btn pagination__arrow"
      type="button"
      :disabled="modelValue === totalPages"
      @click="emit('update:modelValue', totalPages)"
    >
      →
    </button>
  </div>
</template>

<style scoped lang="scss">
.pagination {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
}

.pagination__page--active {
  font-weight: 700;
}
</style>
