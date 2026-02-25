<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from '#imports';
import { useAuthStore } from '@/store/auth';
import { useArticlesStore } from '@/store/articles';
import { useCategoryStore } from '@/store/categories';
import { formatDate, getFullImageUrl } from '@/utils/common';
import Pagination from '@/components/UI/pagination.vue';

definePageMeta({
  ssr: false,
});

const route = useRoute();
const router = useRouter();
const articlesStore = useArticlesStore();
const authStore = useAuthStore();
const categoryStore = useCategoryStore();
const dialogOpen = ref(false);
const isEditing = ref(false);
const currentTab = ref<'articles' | 'categories'>('articles');
const categoryDialogOpen = ref(false);
const selectedFilterCategory = ref<number | null>(null);
const currentArticle = ref<{
  id: number | null;
  title: string;
  content: string;
  image_url: string | null;
  file: File | null;
  fileName: string;
  imagePreview: string | null;
  is_published: boolean;
  category_id: number | null;
}>({
  id: null,
  title: '',
  content: '',
  image_url: null,
  file: null,
  fileName: '',
  imagePreview: null,
  is_published: true,
  category_id: null,
});

const currentCategory = ref<{
  id: number | null;
  name: string;
  slug: string;
  description?: string | null;
}>({
  id: null,
  name: '',
  slug: '',
  description: null,
});

// Используем articlesStore для работы со статьями
const articles = computed(() => articlesStore.getCurrentArticles);
const pagination = computed(() => articlesStore.pagination);
const categories = computed(() => categoryStore.getCategories);

function resetForm() {
  if (currentArticle.value.imagePreview && currentArticle.value.imagePreview.startsWith('blob:')) {
    URL.revokeObjectURL(currentArticle.value.imagePreview);
  }
  currentArticle.value = {
    id: null,
    title: '',
    content: '',
    image_url: null,
    file: null,
    fileName: '',
    imagePreview: null,
    is_published: true,
    category_id: null,
  };
  isEditing.value = false;
}

function resetCategoryForm() {
  currentCategory.value = {
    id: null,
    name: '',
    slug: '',
    description: '',
  };
}

function openAddDialog() {
  resetForm();
  dialogOpen.value = true;
}

function openAddCategoryDialog() {
  resetCategoryForm();
  categoryDialogOpen.value = true;
}

function openEditCategoryDialog(category: any) {
  currentCategory.value = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || null,
  };
  categoryDialogOpen.value = true;
}

async function saveCategory() {
  try {
    if (currentCategory.value.id) {
      await categoryStore.updateCategory(currentCategory.value.id, {
        name: currentCategory.value.name,
        slug: currentCategory.value.slug,
        description: currentCategory.value.description || undefined,
      });
    } else {
      await categoryStore.createCategory({
        name: currentCategory.value.name,
        slug: currentCategory.value.slug,
        description: currentCategory.value.description || undefined,
      });
    }
    
    categoryDialogOpen.value = false;
    resetCategoryForm();
  } catch (error: any) {
    // eslint-disable-next-line no-alert
    alert(`Ошибка при сохранении категории: ${error.message}`);
  }
}

async function deleteCategory(id: number) {
  if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
    try {
      await categoryStore.deleteCategory(id);
    } catch (error: any) {
      // eslint-disable-next-line no-alert
      alert(`Ошибка при удалении категории: ${error.message}`);
    }
  }
}

function openEditDialog(article: any) {
  currentArticle.value = {
    id: article.id,
    title: article.title,
    content: article.content,
    image_url: article.image_url,
    file: null,
    fileName: '',
    imagePreview: getFullImageUrl(article.image_url),
    is_published: article.is_published ?? true,
    category_id: article.category_id ?? null,
  };
  isEditing.value = true;
  dialogOpen.value = true;
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] ?? null;
  if (file) {
    currentArticle.value.file = file;
    currentArticle.value.fileName = file.name;
    currentArticle.value.imagePreview = URL.createObjectURL(file);
    currentArticle.value.image_url = null;
  }
}

async function saveArticle() {
  try {
    const articleData = { ...currentArticle.value };
    console.log('saveArticle called with currentArticle:', currentArticle.value);
    console.log('currentArticle.category_id:', currentArticle.value.category_id);
    console.log('articleData after spread:', articleData);
    console.log('articleData.category_id:', articleData.category_id);
    
    if (!articleData.title || !articleData.content) {
      throw new Error('Заголовок и контент обязательны');
    }
    if (!articleData.file && !articleData.image_url && !isEditing.value) {
      throw new Error('Изображение обязательно для новой статьи');
    }

    const formData = new FormData();
    formData.append('title', articleData.title);
    formData.append('content', articleData.content);
    formData.append('is_published', String(articleData.is_published));
    
    // Добавляем category_id
    if (articleData.category_id) {
      formData.append('category_id', String(articleData.category_id));
      console.log('Added category_id to FormData:', articleData.category_id);
    } else {
      console.log('No category_id to add to FormData');
    }
    
    // Логируем все FormData для отладки
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    if (articleData.file) {
      formData.append('image', articleData.file);
    } else if (articleData.image_url) {
      formData.append('image_url', articleData.image_url);
    }

    if (isEditing.value && articleData.id != null) {
      formData.append('id', String(articleData.id));
      await articlesStore.editArticle({
        id: articleData.id,
        title: articleData.title,
        content: articleData.content,
        image_url: articleData.image_url || null,
        file: articleData.file || undefined,
        category_id: articleData.category_id,
      });
      await articlesStore.loadAdminArticles(
        articlesStore.pagination.currentPage,
        articlesStore.pagination.articlesPerPage,
        selectedFilterCategory.value,
      );
    } else {
      await articlesStore.addArticle({
        title: articleData.title,
        content: articleData.content,
        file: articleData.file || undefined,
        image_url: articleData.image_url || undefined,
        category_id: articleData.category_id,
      });
      await articlesStore.loadAdminArticles(1, articlesStore.pagination.articlesPerPage || 4, selectedFilterCategory.value);
    }

    resetForm();
    dialogOpen.value = false;
  } catch (error: any) {
    // eslint-disable-next-line no-alert
    alert(`Ошибка при сохранении статьи: ${error?.response?.data?.error || error.message}`);
  }
}

async function deleteArticle(id: number) {
  try {
    await articlesStore.deleteArticle(id);
    // Перезагружаем админские статьи после удаления
    await articlesStore.loadAdminArticles(
      articlesStore.pagination.currentPage,
      articlesStore.pagination.articlesPerPage,
    );
  } catch (error: any) {
    // eslint-disable-next-line no-alert
    alert(`Ошибка при удалении статьи: ${error.message}`);
  }
}

async function togglePublishStatus(id: number) {
  try {
    await articlesStore.togglePublish(id);
    // Перезагружаем админские статьи после изменения статуса
    await articlesStore.loadAdminArticles(
      articlesStore.pagination.currentPage,
      articlesStore.pagination.articlesPerPage,
    );
  } catch (error: any) {
    // eslint-disable-next-line no-alert
    alert(`Ошибка при изменении статуса: ${error.message}`);
  }
}

function clearAllCache() {
  articlesStore.clearAllCache();
  if (process.client) {
    location.reload();
  }
}

async function changePage(page: number) {
  const pageNum = Number.parseInt(String(page), 10) || 1;
  
  if (pageNum < 1 || pageNum > articlesStore.pagination.totalPages) {
    // eslint-disable-next-line no-console
    console.warn('Некорректный номер страницы:', page);
    return;
  }

  // Загружаем статьи с учетом фильтра категории
  if (pageNum !== articlesStore.pagination.currentPage) {
    try {
      await articlesStore.loadAdminArticles(pageNum, 4, selectedFilterCategory.value);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Ошибка при загрузке страницы:', error);
    }
  }
  
  // Обновляем URL
  if (pageNum === 1) {
    const query = selectedFilterCategory.value 
      ? { category_id: selectedFilterCategory.value.toString() }
      : {};
    router.push({ path: '/admin', query });
  } else {
    const query = selectedFilterCategory.value 
      ? { page: pageNum.toString(), category_id: selectedFilterCategory.value.toString() }
      : { page: pageNum.toString() };
    router.push({ path: '/admin', query });
  }
}

async function loadFilteredArticles() {
  // Всегда начинаем с первой страницы при изменении фильтра
  const page = 1;
  console.log('Loading filtered articles:', { page, categoryId: selectedFilterCategory.value });
  
  // Обновляем URL с текущим фильтром
  await router.push({
    path: route.path,
    query: {
      ...route.query,
      category_id: selectedFilterCategory.value || undefined,
      page: '1' // Сбрасываем на первую страницу при изменении фильтра
    }
  });
  
  await articlesStore.loadAdminArticles(page, 4, selectedFilterCategory.value);
}

function clearCategoryFilter() {
  selectedFilterCategory.value = null;
  // Обновляем URL убирая category_id
  router.push({
    path: route.path,
    query: {
      ...route.query,
      category_id: undefined,
      page: '1'
    }
  });
}

function switchToCategoriesTab() {
  currentTab.value = 'categories';
  clearCategoryFilter();
  // Загружаем категории при переключении
  categoryStore.loadCategories();
  // Загружаем статьи с учетом фильтра
  loadFilteredArticles();
}

async function switchToArticlesTab() {
  currentTab.value = 'articles';
  // Загружаем статьи без фильтра
  const page = Number.parseInt((route.query.page as string) || '1', 10) || 1;
  await articlesStore.loadAdminArticles(page, 4);
}

onMounted(async () => {
  console.log('Admin page mounted');
  
  // Даем время плагину авторизации загрузиться
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log('Auth state after delay:', {
    isAuthenticated: authStore.isAuthenticated,
    isAdmin: authStore.isAdmin,
    user: authStore.user,
    token: authStore.token
  });
  
  // Если нет токена, выходим
  if (!authStore.token) {
    console.log('No token found, redirecting to auth');
    router.push('/auth');
    return;
  }
  
  // Если пользователь не загружен, пробуем проверить авторизацию
  if (!authStore.user) {
    console.log('User not loaded, trying checkAuth');
    try {
      await authStore.checkAuth();
    } catch (error) {
      console.error('checkAuth failed:', error);
      router.push('/auth');
      return;
    }
  }
  
  // Финальная проверка
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    console.log('Redirecting to home - not authenticated or not admin');
    router.push('/');
    return;
  }

  // Загружаем категории
  await categoryStore.loadCategories();

  // Получаем параметры из URL
  const page = Number.parseInt((route.query.page as string) || '1', 10) || 1;
  const categoryId = route.query.category_id ? Number.parseInt(route.query.category_id as string, 10) : null;
  
  // Устанавливаем фильтр
  if (categoryId) {
    selectedFilterCategory.value = categoryId;
  }
  
  // Загружаем статьи с учетом фильтра
  await articlesStore.loadAdminArticles(page, 4, categoryId);
});

// Следим за изменениями URL для обновления данных
watch(
  () => route.query,
  async (query) => {
    const page = Number.parseInt((query.page as string) || '1', 10) || 1;
    const categoryId = query.category_id ? Number.parseInt(query.category_id as string, 10) : null;
    
    // Обновляем фильтр только если он изменился
    if (categoryId !== selectedFilterCategory.value) {
      selectedFilterCategory.value = categoryId;
    }
    
    if (page !== articlesStore.pagination.currentPage || categoryId !== selectedFilterCategory.value) {
      await articlesStore.loadAdminArticles(page, 4, categoryId);
    }
  },
);
</script>

<template>
  <div class="admin">
    <div class="container">
      <!-- Вкладки -->
      <div class="d-flex gap-2 mb-4">
        <button 
          class="btn"
          :class="currentTab === 'articles' ? 'btn--primary' : 'btn--light'"
          type="button" 
          @click="currentTab = 'articles'"
        >
          Статьи
        </button>
        <button 
          class="btn"
          :class="currentTab === 'categories' ? 'btn--primary' : 'btn--light'"
          type="button" 
          @click="switchToCategoriesTab"
        >
          Категории
        </button>
      </div>

      <!-- Управление статьями -->
      <div v-if="currentTab === 'articles'">
        <div class="d-flex justify-space-between mb-4 flex-wrap gap-2">
          <button class="btn btn--light" type="button" @click="openAddDialog">
            Добавить статью
          </button>
          <div class="d-flex gap-2 align-center">
            <label class="label mb-0">Фильтр по категории:</label>
            <select 
              v-model="selectedFilterCategory" 
              @change="loadFilteredArticles"
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
            <button class="btn btn--light" type="button" @click="clearAllCache">
              Очистить кэш
            </button>
          </div>
        </div>

        <div v-if="articles.length">
          <div class="row" style="row-gap: 16px;">
            <div
              v-for="article in articles"
              :key="article.id"
              class="col-12"
            >
              <article class="card admin__card">
                <div class="row no-gutters">
                  <div class="col-12 col-sm-4">
                    <img
                      :src="getFullImageUrl(article.image_url)"
                      alt=""
                      height="200"
                      class="w-100 object-cover"
                      loading="lazy"
                    >
                  </div>
                  <div class="col-12 col-sm-8 pa-3">
                    <h3 class="mb-2">
                      {{ article.title }}
                    </h3>
                    <p class="mb-2">
                      {{ article.content }}...
                    </p>
                    <p class="mb-1">
                      Создано: {{ formatDate(article.created_at) }}
                    </p>
                    <p class="mb-1">
                      Статус: 
                      <span :class="article.is_published ? 'text-success' : 'text-warning'">
                        {{ article.is_published ? 'Опубликовано' : 'Не опубликовано' }}
                      </span>
                    </p>
                    <p class="mb-3">
                      Автор: {{ article.author_name }}
                    </p>
                    <p v-if="article.category_name" class="mb-3">
                      Категория: {{ article.category_name }}
                    </p>
                    <div class="d-flex ga-2">
                      <button
                        class="btn"
                        type="button"
                        @click="togglePublishStatus(article.id)"
                      >
                        {{ article.is_published ? 'Снять с публикации' : 'Опубликовать' }}
                      </button>
                      <button
                        class="btn"
                        type="button"
                        @click="deleteArticle(article.id)"
                      >
                        Удалить
                      </button>
                      <button
                        class="btn"
                        type="button"
                        @click="openEditDialog(article)"
                      >
                        Редактировать
                      </button>
                    </div>
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
        <div v-else class="text-center">
          Нет статей
        </div>
      </div>

      <!-- Управление категориями -->
      <div v-if="currentTab === 'categories'">
        <div class="d-flex justify-space-between mb-4">
          <button class="btn btn--light" type="button" @click="openAddCategoryDialog">
            Добавить категорию
          </button>
        </div>

        <div v-if="categories.length">
          <div class="row" style="row-gap: 16px;">
            <div
              v-for="category in categories"
              :key="category.id"
              class="col-12 col-sm-6 col-lg-4"
            >
              <div class="card admin__card">
                <div class="pa-4">
                  <h4 class="mb-2">{{ category.name }}</h4>
                  <p v-if="category.slug" class="mb-2 text-muted">
                    Slug: {{ category.slug }}
                  </p>
                  <p v-if="category.description" class="mb-3">
                    {{ category.description }}
                  </p>
                  <div class="d-flex ga-2">
                    <button
                      class="btn"
                      type="button"
                      @click="openEditCategoryDialog(category)"
                    >
                      Редактировать
                    </button>
                    <button
                      class="btn btn--danger"
                      type="button"
                      @click="deleteCategory(category.id)"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center">
          Нет категорий
        </div>
      </div>

      <dialog v-if="dialogOpen" open class="modal">
        <section class="modal__content">
          <header class="modal__header">
            <h3>
              {{ isEditing ? 'Редактировать статью' : 'Добавить статью' }}
            </h3>
          </header>
          <div class="modal__body">
            <div class="field">
              <label class="label">Заголовок</label>
              <input v-model="currentArticle.title" type="text" class="input">
            </div>
            <div class="field">
              <label class="label">Контент</label>
              <textarea v-model="currentArticle.content" class="textarea" rows="5" />
            </div>
            <div class="field">
              <label class="label">Категория</label>
              <select v-model="currentArticle.category_id" class="select" @change="console.log('Category changed:', currentArticle.category_id)">
                <option :value="null">Без категории</option>
                <option 
                  v-for="category in categories" 
                  :key="category.id" 
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div class="field">
              <label class="label">Статус публикации</label>
              <label class="d-flex align-center ga-2">
                <input 
                  type="checkbox" 
                  v-model="currentArticle.is_published"
                  class="checkbox"
                >
                <span>Опубликовано</span>
              </label>
            </div>
            <div class="field">
              <label class="label">Изображение</label>
              <div class="mb-2">
                <img
                  v-if="currentArticle.imagePreview"
                  :src="currentArticle.imagePreview"
                  alt=""
                  height="100"
                  class="mb-2"
                >
                <div v-if="currentArticle.imagePreview" class="text-caption mb-2">
                  <span v-if="currentArticle.file">Выбрано изображение: {{ currentArticle.fileName }}</span>
                  <span v-else>Существующее изображение</span>
                </div>
              </div>
              <input type="file" accept="image/jpeg,image/png" @change="handleFileChange">
            </div>
          </div>
          <footer class="modal__footer d-flex ga-2 justify-end">
            <button class="btn" type="button" @click="dialogOpen = false">
              Закрыть
            </button>
            <button
              class="btn"
              type="button"
              :disabled="articlesStore.isLoading"
              @click="saveArticle"
            >
              Сохранить
            </button>
          </footer>
        </section>
      </dialog>

      <!-- Диалог для управления категориями -->
      <dialog v-if="categoryDialogOpen" open class="modal">
        <section class="modal__content">
          <header class="modal__header">
            <h3>
              {{ currentCategory.id ? 'Редактировать категорию' : 'Добавить категорию' }}
            </h3>
          </header>
          <div class="modal__body">
            <div class="field">
              <label class="label">Название</label>
              <input v-model="currentCategory.name" type="text" class="input">
            </div>
            <div class="field">
              <label class="label">Slug</label>
              <input v-model="currentCategory.slug" type="text" class="input">
            </div>
            <div class="field">
              <label class="label">Описание</label>
              <textarea v-model="currentCategory.description" class="textarea" rows="3" />
            </div>
          </div>
          <footer class="modal__footer d-flex ga-2 justify-end">
            <button class="btn" type="button" @click="categoryDialogOpen = false">
              Закрыть
            </button>
            <button
              class="btn"
              type="button"
              :disabled="categoryStore.loading"
              @click="saveCategory"
            >
              Сохранить
            </button>
          </footer>
        </section>
      </dialog>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin {
  background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('/image/admin.jpg');
  background-position: center;
  background-size: cover;
}

// .admin__card {
//   background-color: color(cream);
// }

.modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);
  border: none;
  padding: 0;
}

.modal__content {
  background-color: #fff;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  padding: 16px;
}

.field {
  margin-bottom: 12px;
}

.label {
  display: block;
  margin-bottom: 4px;
}

.input,
.textarea {
  width: 100%;
}
</style>

