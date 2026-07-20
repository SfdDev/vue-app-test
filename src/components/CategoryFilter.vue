<template>
  <div class="category-filter">
    <div class="container">
      <div class="category-filter__row">
        <h3 class="category-filter__title">Фильтр по категориям:</h3>
        <select
          v-model="selectedCategoryId"
          class="select"
          @change="onCategoryChange"
        >
          <option :value="null">Все категории</option>
          <option :value="UNCATEGORIZED_CATEGORY_ID">{{ UNCATEGORIZED_CATEGORY_NAME }}</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
        <button
          v-if="selectedCategoryId != null"
          class="btn btn--outline"
          type="button"
          @click="clearFilter"
        >
          Сбросить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCategoryStore } from '@/store/categories';
import {
  UNCATEGORIZED_CATEGORY_ID,
  UNCATEGORIZED_CATEGORY_NAME,
} from '@/shared/category-filter';

interface Category {
  id: number;
  name: string;
  slug: string;
}

const emit = defineEmits<{
  categoryChanged: [categoryId: number | null]
}>();

const categoryStore = useCategoryStore();
const categories = ref<Category[]>([]);
const selectedCategoryId = ref<number | null>(null);

onMounted(async () => {
  await categoryStore.loadCategories();
  categories.value = categoryStore.getCategories;
});

function onCategoryChange() {
  const value = selectedCategoryId.value;
  // HTML select may coerce to string
  const normalized =
    value === null || value === ('' as unknown)
      ? null
      : Number(value);
  selectedCategoryId.value = Number.isNaN(normalized as number) ? null : normalized;
  emit('categoryChanged', selectedCategoryId.value);
}

function clearFilter() {
  selectedCategoryId.value = null;
  emit('categoryChanged', null);
}
</script>

<style scoped lang="scss">
.category-filter {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 1rem;

  &__row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__title {
    margin: 0;
    font-size: 1.1rem;
  }

  .select {
    max-width: 280px;
  }
}
</style>
