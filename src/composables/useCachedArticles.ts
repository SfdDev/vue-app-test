import { computed } from 'vue'
import type { AsyncDataOptions } from 'nuxt/app'

export interface Article {
  id: number
  title: string
  content: string
  image_url: string | null
  created_at?: string
  updated_at?: string
  author_id?: number
  author_name?: string
  is_published?: boolean
}

export interface PaginationMeta {
  current_page: number
  total_pages: number
  total: number
  per_page: number
}

export interface ArticlesResponse {
  data: Article[]
  meta: PaginationMeta
}

// Ключи для кеширования
const CACHE_KEYS = {
  articles: (page: number, perPage: number) => `articles:${page}:${perPage}`,
  adminArticles: (page: number, perPage: number) => `admin:articles:${page}:${perPage}`,
  article: (id: number) => `article:${id}`,
}

// Время жизни кеша в секундах
const CACHE_TTL = {
  articles: 60 * 5, // 5 минут для списка статей
  article: 60 * 10, // 10 минут для отдельной статьи
  adminArticles: 60 * 1, // 1 минута для админских данных
}

export const useCachedArticles = async (page: number = 1, perPage: number = 6) => {
  const key = CACHE_KEYS.articles(page, perPage)
  
  const { data, refresh, pending, error } = await useAsyncData(
    key,
    () => $fetch<ArticlesResponse>('/api/articles', {
      query: { page, per_page: perPage }
    }),
    {
      default: () => ({ data: [], meta: { current_page: 1, total_pages: 0, total: 0, per_page: perPage } }),
      transform: (data: ArticlesResponse) => {
        // Добавляем полные URL для изображений
        return {
          ...data,
          data: data.data.map(article => ({
            ...article,
            image_url: article.image_url ? `/_nuxt/public${article.image_url}` : null
          }))
        }
      }
    }
  )

  const articles = computed(() => data.value?.data || [])
  const pagination = computed(() => data.value?.meta || { current_page: 1, total_pages: 0, total: 0, per_page: perPage })

  // Функция для сброса кеша
  const clearCache = () => {
    clearNuxtData(key)
    refresh()
  }

  return {
    articles,
    pagination,
    pending,
    error,
    refresh,
    clearCache
  }
}

export const useCachedAdminArticles = async (page: number = 1, perPage: number = 4) => {
  const key = CACHE_KEYS.adminArticles(page, perPage)
  
  const { data, refresh, pending, error } = await useAsyncData(
    key,
    () => $fetch<ArticlesResponse>('/api/admin/articles', {
      query: { page, per_page: perPage }
    }),
    {
      default: () => ({ data: [], meta: { current_page: 1, total_pages: 0, total: 0, per_page: perPage } }),
      transform: (data: ArticlesResponse) => {
        return {
          ...data,
          data: data.data.map(article => ({
            ...article,
            image_url: article.image_url ? `/_nuxt/public${article.image_url}` : null
          }))
        }
      }
    }
  )

  const articles = computed(() => data.value?.data || [])
  const pagination = computed(() => data.value?.meta || { current_page: 1, total_pages: 0, total: 0, per_page: perPage })

  const clearCache = () => {
    clearNuxtData(key)
    refresh()
  }

  return {
    articles,
    pagination,
    pending,
    error,
    refresh,
    clearCache
  }
}

export const useCachedArticle = async (id: number) => {
  const key = CACHE_KEYS.article(id)
  
  const { data, refresh, pending, error } = await useAsyncData(
    key,
    () => $fetch<Article>(`/api/articles/${id}`),
    {
      default: () => null,
      transform: (article: Article) => ({
        ...article,
        image_url: article.image_url ? `/_nuxt/public${article.image_url}` : null
      })
    }
  )

  const article = computed(() => data.value)

  const clearCache = () => {
    clearNuxtData(key)
    refresh()
  }

  return {
    article,
    pending,
    error,
    refresh,
    clearCache
  }
}

// Функция для очистки всех кешей статей
export const clearArticlesCache = () => {
  // Очищаем все кеши статей
  Object.values(CACHE_KEYS).forEach(keyPattern => {
    if (typeof keyPattern === 'function') return
    clearNuxtData(keyPattern)
  })
  
  // Также можно очистить по паттернам, но в Nuxt 3 это сложнее
  // Поэтому будем очищать конкретные ключи при необходимости
}

// Функция для очистки кеша списка статей
export const clearArticlesListCache = () => {
  // Очищаем первые несколько страниц кеша
  for (let page = 1; page <= 5; page++) {
    clearNuxtData(CACHE_KEYS.articles(page, 6))
    clearNuxtData(CACHE_KEYS.adminArticles(page, 4))
  }
}
