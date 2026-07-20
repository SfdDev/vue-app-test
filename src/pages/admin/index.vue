<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useRoute, useRouter, navigateTo } from '#imports';
import { useAuthStore } from '@/store/auth';
import { useArticlesStore } from '@/store/articles';
import { useCategoryStore } from '@/store/categories';
import { formatDate, getFullImageUrl } from '@/utils/common';
import Pagination from '@/components/UI/pagination.vue';
import {
  UNCATEGORIZED_CATEGORY_ID,
  UNCATEGORIZED_CATEGORY_NAME,
  categoryFilterToSlug,
  resolveCategoryFilterQuery,
} from '@/shared/category-filter';

interface CategoryArticle {
  id: number;
  title: string;
  category_id?: number | null;
  is_published?: boolean;
}

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
const categoryArticles = ref<CategoryArticle[]>([]);
const categoryArticlesLoading = ref(false);
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
const articles = computed(() => articlesStore.getAdminArticles);
const pagination = computed(() => articlesStore.adminPagination);
const categories = computed(() => categoryStore.getCategories);

const categoriesWithArticles = computed(() => {
  const groups = categories.value.map((category: { id: number; name: string; slug: string; description?: string | null }) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    isVirtual: false,
    articles: categoryArticles.value.filter((article: CategoryArticle) => article.category_id === category.id),
  }));

  groups.unshift({
    id: UNCATEGORIZED_CATEGORY_ID,
    name: UNCATEGORIZED_CATEGORY_NAME,
    slug: 'uncategorized',
    description: 'Статьи без выбранной категории',
    isVirtual: true,
    articles: categoryArticles.value.filter((article: CategoryArticle) => article.category_id == null),
  });

  return groups;
});

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
    if (currentTab.value === 'categories') {
      await loadCategoryArticles();
    }
  } catch (error: any) {
    // eslint-disable-next-line no-alert
    alert(`Ошибка при сохранении категории: ${error.message}`);
  }
}

async function deleteCategory(id: number) {
  if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
    try {
      await categoryStore.deleteCategory(id);
      if (currentTab.value === 'categories') {
        await loadCategoryArticles();
      }
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

const ADMIN_PER_PAGE = 4;
/** Skip route watcher while we update URL ourselves */
let routeSyncLock = false;

function adminListQuery(page: number, categoryId: number | null = selectedFilterCategory.value) {
  const query: Record<string, string> = {};
  if (page > 1) query.page = String(page);
  const slug = categoryFilterToSlug(categoryId, categoryStore.getCategories);
  if (slug) query.category = slug;
  return query;
}

function resolveAdminCategoryFromRoute(): number | null {
  return resolveCategoryFilterQuery(
    route.query.category,
    categoryStore.getCategories,
    route.query.category_id,
  );
}

function normalizeFilterValue(raw: unknown): number | null {
  if (raw === '' || raw === null || raw === undefined || raw === 'null') {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

async function withRouteLock(fn: () => Promise<void>) {
  routeSyncLock = true;
  try {
    await fn();
  } finally {
    await nextTick();
    routeSyncLock = false;
  }
}

async function writeAdminUrl(page: number, categoryId: number | null) {
  const query = adminListQuery(page, categoryId);
  const same =
    String(route.query.page ?? '') === String(query.page ?? '') &&
    String(route.query.category ?? '') === String(query.category ?? '');
  if (same) return;

  await withRouteLock(async () => {
    await navigateTo({ path: '/admin', query }, { replace: true });
  });
}

async function syncAdminRoute(page: number, categoryId: number | null = selectedFilterCategory.value) {
  await writeAdminUrl(page, categoryId);
}

async function reloadAdminList(page = 1, categoryId: number | null = selectedFilterCategory.value) {
  let targetPage = Math.max(1, page);
  selectedFilterCategory.value = categoryId;

  await articlesStore.loadAdminArticles(targetPage, ADMIN_PER_PAGE, categoryId);

  const totalPages = articlesStore.adminPagination.totalPages;
  if (totalPages > 0 && targetPage > totalPages) {
    targetPage = totalPages;
    await articlesStore.loadAdminArticles(targetPage, ADMIN_PER_PAGE, categoryId);
  } else if (targetPage > 1 && articlesStore.adminArticles.length === 0) {
    targetPage = 1;
    await articlesStore.loadAdminArticles(1, ADMIN_PER_PAGE, categoryId);
  }

  await writeAdminUrl(targetPage, categoryId);
}

async function saveArticle() {
  try {
    const articleData = { ...currentArticle.value };
    if (!articleData.title || !articleData.content) {
      throw new Error('Заголовок и контент обязательны');
    }
    if (!articleData.file && !articleData.image_url && !isEditing.value) {
      throw new Error('Изображение обязательно для новой статьи');
    }

    if (isEditing.value && articleData.id != null) {
      await articlesStore.editArticle({
        id: articleData.id,
        title: articleData.title,
        content: articleData.content,
        image_url: articleData.image_url || null,
        file: articleData.file || undefined,
        is_published: articleData.is_published,
        category_id: articleData.category_id ?? null,
      });
      await reloadAdminList(articlesStore.adminPagination.currentPage);
    } else {
      await articlesStore.addArticle({
        title: articleData.title,
        content: articleData.content,
        file: articleData.file || undefined,
        image_url: articleData.image_url || undefined,
        is_published: articleData.is_published,
        category_id: articleData.category_id ?? null,
      });
      await reloadAdminList(1);
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
    const page = articlesStore.adminPagination.currentPage;
    await reloadAdminList(page);
    if (!articlesStore.adminArticles.length && page > 1) {
      await reloadAdminList(page - 1);
    }
  } catch (error: any) {
    // eslint-disable-next-line no-alert
    alert(`Ошибка при удалении статьи: ${error.message}`);
  }
}

async function togglePublishStatus(id: number) {
  try {
    await articlesStore.togglePublish(id);
    await reloadAdminList(articlesStore.adminPagination.currentPage);
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

  if (pageNum < 1 || pageNum > articlesStore.adminPagination.totalPages) {
    console.warn('Некорректный номер страницы:', page);
    return;
  }

  await reloadAdminList(pageNum);
}

/** Category filter owns its own pagination — write URL first, then fetch */
async function onCategoryFilterChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const categoryId = normalizeFilterValue(target.value === '' ? null : target.value);
  selectedFilterCategory.value = categoryId;

  // Always rewrite URL on filter change (drops stale ?page=)
  await writeAdminUrl(1, categoryId);
  await articlesStore.loadAdminArticles(1, ADMIN_PER_PAGE, categoryId);
}

async function loadCategoryArticles() {
  categoryArticlesLoading.value = true;
  try {
    const authStoreHeaders = useAuthStore().getAuthHeader();
    const response = await $fetch<{ data: CategoryArticle[] }>('/api/admin/articles', {
      query: { page: 1, per_page: 200 },
      headers: authStoreHeaders,
    });
    categoryArticles.value = response.data;
  } catch (error) {
    console.error('Ошибка загрузки статей для категорий:', error);
    categoryArticles.value = [];
  } finally {
    categoryArticlesLoading.value = false;
  }
}

async function switchToCategoriesTab() {
  currentTab.value = 'categories';
  await categoryStore.loadCategories();
  await loadCategoryArticles();
}

async function switchToArticlesTab() {
  currentTab.value = 'articles';
  const page = Number.parseInt((route.query.page as string) || '1', 10) || 1;
  const categoryId = resolveAdminCategoryFromRoute();
  selectedFilterCategory.value = categoryId;
  await articlesStore.loadAdminArticles(page, ADMIN_PER_PAGE, categoryId);
}

onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    router.push('/');
    return;
  }

  await categoryStore.loadCategories();

  const page = Number.parseInt((route.query.page as string) || '1', 10) || 1;
  const categoryId = resolveAdminCategoryFromRoute();
  selectedFilterCategory.value = categoryId;
  await articlesStore.loadAdminArticles(page, ADMIN_PER_PAGE, categoryId);
});

// Browser back/forward only — in-page filter/page updates set routeSyncLock
watch(
  () => [route.query.page, route.query.category, route.query.category_id] as const,
  async ([pageRaw, categoryRaw, legacyIdRaw], previous) => {
    if (routeSyncLock) return;
    if (currentTab.value !== 'articles') return;

    const prevCategoryRaw = previous?.[1];
    const prevLegacyRaw = previous?.[2];
    const categoryId = resolveCategoryFilterQuery(
      categoryRaw,
      categoryStore.getCategories,
      legacyIdRaw,
    );
    const prevCategoryId = resolveCategoryFilterQuery(
      prevCategoryRaw,
      categoryStore.getCategories,
      prevLegacyRaw,
    );
    const categoryChanged = categoryId !== prevCategoryId;

    // Never keep page from a previous filter
    const page = categoryChanged
      ? 1
      : Number.parseInt((pageRaw as string) || '1', 10) || 1;

    if (
      !categoryChanged &&
      page === articlesStore.adminPagination.currentPage &&
      categoryId === selectedFilterCategory.value
    ) {
      return;
    }

    selectedFilterCategory.value = categoryId;
    await articlesStore.loadAdminArticles(page, ADMIN_PER_PAGE, categoryId);

    // Fix URL if history had stale ?page= together with a filter change
    if (categoryChanged && pageRaw != null && pageRaw !== '') {
      await syncAdminRoute(1, categoryId);
    }
  },
);
</script>

<template>
  <section class="admin">
    <div class="container">
      <div class="admin__tabs">
        <button
          class="btn"
          :class="currentTab === 'articles' ? 'btn--primary' : 'btn--light'"
          type="button"
          @click="switchToArticlesTab"
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

      <div v-if="currentTab === 'articles'">
        <div class="admin__toolbar">
          <button class="btn btn--light" type="button" @click="openAddDialog">
            Добавить статью
          </button>
          <div class="admin__filters">
            <label class="label">Фильтр по категории:</label>
            <select
              class="select"
              :value="selectedFilterCategory === null ? '' : selectedFilterCategory"
              @change="onCategoryFilterChange"
            >
              <option value="">Все категории</option>
              <option :value="UNCATEGORIZED_CATEGORY_ID">{{ UNCATEGORIZED_CATEGORY_NAME }}</option>
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
          <div class="row admin__list">
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
                      class="admin__card-image"
                      loading="lazy"
                    >
                  </div>
                  <div class="col-12 col-sm-8 admin__card-body">
                    <h3 class="admin__card-title">
                      {{ article.title }}
                    </h3>
                    <p class="admin__card-text">
                      {{ article.content }}...
                    </p>
                    <p class="admin__card-meta">
                      Создано: {{ formatDate(article.created_at) }}
                    </p>
                    <p class="admin__card-meta">
                      Статус:
                      <span :class="article.is_published ? 'text-success' : 'text-warning'">
                        {{ article.is_published ? 'Опубликовано' : 'Не опубликовано' }}
                      </span>
                    </p>
                    <p class="admin__card-meta">
                      Автор: {{ article.author_name }}
                    </p>
                    <p class="admin__card-meta">
                      Категория: {{ article.category_name || UNCATEGORIZED_CATEGORY_NAME }}
                    </p>
                    <div class="admin__card-actions">
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
            :sync-route="false"
            @update:model-value="changePage"
          />
        </div>
        <div v-else class="admin__empty">
          <p>Нет статей</p>
          <Pagination
            v-if="pagination.totalPages > 1"
            :total-pages="pagination.totalPages"
            :model-value="pagination.currentPage"
            :sync-route="false"
            @update:model-value="changePage"
          />
        </div>
      </div>

      <div v-if="currentTab === 'categories'">
        <div class="admin__toolbar">
          <button class="btn btn--light" type="button" @click="openAddCategoryDialog">
            Добавить категорию
          </button>
        </div>

        <div v-if="categoryArticlesLoading" class="admin__empty">
          Загрузка...
        </div>
        <div v-else class="row admin__list">
          <div
            v-for="group in categoriesWithArticles"
            :key="group.id"
            class="col-12 col-sm-6 col-lg-4"
          >
            <div class="card admin__card">
              <div class="admin__card-body">
                <h4 class="admin__card-title">{{ group.name }}</h4>
                <p v-if="group.slug && !group.isVirtual" class="admin__card-meta text-muted">
                  Slug: {{ group.slug }}
                </p>
                <p v-if="group.description" class="admin__card-text">
                  {{ group.description }}
                </p>
                <p class="admin__card-meta">
                  Статей: {{ group.articles.length }}
                </p>

                <ul v-if="group.articles.length" class="admin__category-articles">
                  <li
                    v-for="article in group.articles"
                    :key="article.id"
                  >
                    <button
                      class="admin__category-article-link"
                      type="button"
                      @click="openEditDialog(article)"
                    >
                      {{ article.title }}
                    </button>
                    <span
                      class="admin__category-article-status"
                      :class="article.is_published ? 'text-success' : 'text-warning'"
                    >
                      {{ article.is_published ? 'опубл.' : 'черновик' }}
                    </span>
                  </li>
                </ul>
                <p v-else class="admin__card-meta text-muted">
                  Нет статей
                </p>

                <div v-if="!group.isVirtual" class="admin__card-actions">
                  <button
                    class="btn"
                    type="button"
                    @click="openEditCategoryDialog(group)"
                  >
                    Редактировать
                  </button>
                  <button
                    class="btn btn--danger"
                    type="button"
                    @click="deleteCategory(group.id)"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
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
              <select v-model="currentArticle.category_id" class="select">
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
              <label class="admin__checkbox">
                <input
                  v-model="currentArticle.is_published"
                  type="checkbox"
                  class="checkbox"
                >
                <span>Опубликовано</span>
              </label>
            </div>
            <div class="field">
              <label class="label">Изображение</label>
              <div class="admin__preview">
                <img
                  v-if="currentArticle.imagePreview"
                  :src="currentArticle.imagePreview"
                  alt=""
                  height="100"
                >
                <div v-if="currentArticle.imagePreview" class="admin__preview-caption">
                  <span v-if="currentArticle.file">Выбрано изображение: {{ currentArticle.fileName }}</span>
                  <span v-else>Существующее изображение</span>
                </div>
              </div>
              <input type="file" accept="image/jpeg,image/png" @change="handleFileChange">
            </div>
          </div>
          <footer class="modal__footer">
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
              <label class="label">Slug (латиницей, например cars)</label>
              <input
                v-model="currentCategory.slug"
                type="text"
                class="input"
                placeholder="оставьте пустым — сгенерируется из названия"
              >
            </div>
            <div class="field">
              <label class="label">Описание</label>
              <textarea v-model="currentCategory.description" class="textarea" rows="3" />
            </div>
          </div>
          <footer class="modal__footer">
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
  </section>
</template>

<style scoped lang="scss">
.admin {
  &__tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  &__toolbar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__filters {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;

    .label {
      margin-bottom: 0;
    }

    .select {
      width: auto;
      min-width: 180px;
    }
  }

  &__list {
    row-gap: 16px;
  }

  &__card {
    background-color: #f5deb3;
  }

  &__card-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  &__card-body {
    padding: 1rem;
  }

  &__card-title {
    margin: 0 0 0.5rem;
  }

  &__card-text {
    margin: 0 0 0.5rem;
  }

  &__card-meta {
    margin: 0 0 0.35rem;
  }

  &__card-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.75rem;
  }

  &__category-articles {
    list-style: none;
    margin: 0.75rem 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__category-article-link {
    background: none;
    border: none;
    padding: 0;
    color: inherit;
    text-align: left;
    cursor: pointer;
    text-decoration: underline;
    font: inherit;
  }

  &__category-article-status {
    margin-left: 0.35rem;
    font-size: 0.85em;
  }

  &__empty {
    text-align: center;
    padding: 2rem 0;
  }

  &__checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__preview {
    margin-bottom: 0.5rem;
  }

  &__preview-caption {
    margin-top: 0.35rem;
    font-size: 0.85rem;
  }
}

.modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);
  border: none;
  padding: 0;
  max-width: none;
  width: 100%;
  height: 100%;
}

.modal__content {
  background-color: #fff;
  border-radius: 8px;
  max-width: 500px;
  width: calc(100% - 2rem);
  padding: 16px;
  color: #323136;
}
</style>

