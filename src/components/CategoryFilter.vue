<template>
  <div class="category-filter mb-4">
    <div class="container">
      <div class="d-flex align-center ga-4 flex-wrap">
        <h3 class="text-h6 mb-0">Фильтр по категориям:</h3>
        <select 
          v-model="selectedCategoryId" 
          @change="onCategoryChange"
          class="select"
        >
          <option :value="null">Все категории</option>
          <option 
            v-for="category in categories" 
            :key="category.id" 
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
        <button 
          v-if="selectedCategoryId"
          @click="clearFilter"
          class="btn btn--outline"
          type="button"
        >
          Сбросить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from '#imports';
import { useCategoryStore } from '@/store/categories';

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
const route = useRoute();

onMounted(async () => {
  await categoryStore.loadCategories();
  categories.value = categoryStore.getCategories;
  
  // Синхронизируем с URL при загрузке
  const categoryId = route.query.category_id ? Number.parseInt(route.query.category_id as string, 10) : null;
  if (categoryId !== null) {
    selectedCategoryId.value = categoryId;
  }
});

function onCategoryChange() {
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
}
</style>
