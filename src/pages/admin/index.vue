<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from '#imports';
import { useArticlesStore } from '@/store/articles';
import { formatDate, getFullImageUrl } from '@/utils/common';
import Pagination from '@/components/UI/pagination.vue';

definePageMeta({
  ssr: false,
});

const route = useRoute();
const articlesStore = useArticlesStore();
const dialogOpen = ref(false);
const isEditing = ref(false);
const currentArticle = ref<{
  id: number | null;
  title: string;
  content: string;
  image_url: string | null;
  file: File | null;
  fileName: string;
  imagePreview: string | null;
}>({
  id: null,
  title: '',
  content: '',
  image_url: null,
  file: null,
  fileName: '',
  imagePreview: null,
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
  };
  isEditing.value = false;
}

function openAddDialog() {
  resetForm();
  dialogOpen.value = true;
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
    if (!articleData.title || !articleData.content) {
      throw new Error('Заголовок и контент обязательны');
    }
    if (!articleData.file && !articleData.image_url && !isEditing.value) {
      throw new Error('Изображение обязательно для новой статьи');
    }

    const payload: any = {
      title: articleData.title,
      content: articleData.content,
      image_url: articleData.file ? null : articleData.image_url,
      file: articleData.file,
    };

    if (isEditing.value && articleData.id != null) {
      payload.id = articleData.id;
      await articlesStore.editArticle(payload);
      await articlesStore.loadArticles(
        articlesStore.pagination.currentPage,
        articlesStore.pagination.articlesPerPage,
      );
    } else {
      await articlesStore.addArticle(payload);
      await articlesStore.loadArticles(1, articlesStore.pagination.articlesPerPage || 6);
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
  } catch (error: any) {
    // eslint-disable-next-line no-alert
    alert(`Ошибка при удалении статьи: ${error.message}`);
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
  if (pageNum < 1 || pageNum > articlesStore.pagination.totalPages) return;
  await articlesStore.loadArticles(pageNum, articlesStore.pagination.articlesPerPage);
}

onMounted(() => {
  const page = Number.parseInt((route.query.page as string) || '1', 10) || 1;
  articlesStore.loadArticles(page, 4);
});
</script>

<template>
  <div class="admin">
    <div class="container">
      <div class="d-flex justify-space-between mb-4">
        <button class="btn btn--light" type="button" @click="openAddDialog">
          Добавить статью
        </button>
        <button class="btn btn--light" type="button" @click="clearAllCache">
          Очистить кэш
        </button>
      </div>

      <div v-if="articlesStore.getCurrentArticles.length">
        <div class="row" style="row-gap: 16px;">
          <div
            v-for="article in articlesStore.getCurrentArticles"
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
                    Опубликовано: {{ formatDate(article.created_at) }}
                  </p>
                  <p class="mb-3">
                    Автор: {{ article.author_name }}
                  </p>
                  <div class="d-flex ga-2">
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
          :total-pages="articlesStore.pagination.totalPages"
          :model-value="articlesStore.pagination.currentPage"
          @update:model-value="changePage"
        />
      </div>
      <div v-else class="text-center">
        Нет статей
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
              :disabled="articlesStore.loading"
              @click="saveArticle"
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

.admin__card {
  background-color: color(cream);
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

