<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from '#imports';
import { useArticlesStore } from '@/store/articles';
import { useAuthStore } from '@/store/auth';
import { useAuth, useBaseLinks, useSocialIcons } from '@/utils/common';

const { isAuthenticated, currentUsername } = useAuth();
const { socialIcons } = useSocialIcons();
const store = useArticlesStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const isMenuOpen = ref(false);
const { navLinks } = useBaseLinks();
const articles = computed(() => store.articles);

const logoutHandler = () => {
  authStore.logout();
  if (route.path === '/admin') {
    router.push('/auth');
  }
};

watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false;
    updateHtmlClass();
  },
);

const updateHtmlClass = () => {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (isMenuOpen.value) {
    html.classList.add('hidden');
  } else {
    html.classList.remove('hidden');
  }
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  updateHtmlClass();
};

const allNavLinks = computed(() => {
  const links = [...navLinks.value];
  
  // Добавляем отладочные логи
  console.log('Computing nav links, auth state:', {
    isClient: process.client,
    isAuthenticated: authStore.isAuthenticated,
    isAdmin: authStore.isAdmin
  });
  
  // Проверяем только на клиенте, чтобы избежать проблем с SSR
  if (process.client && authStore.isAuthenticated && authStore.isAdmin) {
    console.log('Adding admin link');
    links.push({ text: 'Админ-панель', href: '/admin' });
  }
  
  console.log('Final links:', links.map(l => l.text));
  return links;
});

// Обновляем навигацию после загрузки на клиенте
onMounted(() => {
  console.log('Header mounted, auth state:', {
    isAuthenticated: authStore.isAuthenticated,
    isAdmin: authStore.isAdmin,
    user: authStore.user
  });
});

// Следим за изменениями авторизации
watch(
  () => ({
    isAuthenticated: authStore.isAuthenticated,
    isAdmin: authStore.isAdmin
  }),
  (newState) => {
    console.log('Auth state changed:', newState);
    // Принудительно обновляем computed, вызывая его
    void allNavLinks.value;
  },
  { immediate: true }
);
</script>

<template>
  <header :class="['header', { 'bg--dark-gray': isMenuOpen }]">
    <div class="container">
      <div class="row align-center">
        <NuxtLink class="logo" to="/">
          <img src="#" alt="logo for header">
        </NuxtLink>

        <div v-if="isAuthenticated" class="name-user text-capitalize">
          /{{ currentUsername }}
        </div>

        <button
          class="toggle d-lg-none"
          :class="{ 'toggle--open': isMenuOpen }"
          type="button"
          @click="toggleMenu"
        >
          <svg viewBox="0 0 800 600">
            <path
              d="M300,220 C300,220 520,220 540,220 C740,220 640,540 520,420 C440,340 300,200 300,200"
              class="top"
            />
            <path d="M300,320 L540,320" class="middle" />
            <path
              d="M300,210 C300,210 520,210 540,210 C740,210 640,530 520,410 C440,330 300,190 300,190"
              class="bottom"
              transform="translate(480, 320) scale(1, -1) translate(-480, -318) "
            />
          </svg>
        </button>

        <div class="social-icons social-icons--pixel ma-auto d-none d-lg-flex">
          <a
            v-for="(icon, index) in socialIcons"
            :key="index"
            :href="icon.link"
            target="_blank"
            rel="noopener noreferrer"
            :class="['social-icons__link', `icon-${icon.name}`]"
          />
        </div>

        <nav class="d-none d-lg-flex">
          <NuxtLink
            v-for="link in allNavLinks"
            :key="link.text"
            class="py-2 btn btn--pixel"
            :to="link.href"
          >
            {{ link.text }}
          </NuxtLink>
        </nav>

        <div class="d-none d-lg-flex ml-4">
          <NuxtLink
            v-if="!isAuthenticated"
            to="/auth"
            class="py-2 btn-login btn btn--pixel"
          >
            Вход/Регистрация
          </NuxtLink>
          <button
            v-else
            class="py-2 btn-logout btn btn--pixel"
            type="button"
            @click="logoutHandler"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>

    <transition name="fade">
      <aside v-if="isMenuOpen" class="nav d-lg-none">
        <ul class="nav__list">
          <li
            v-for="link in allNavLinks"
            :key="link.text"
            class="mobile btn btn--pixel"
          >
            <NuxtLink
              :to="link.href"
              @click="isMenuOpen = false"
            >
              {{ link.text }}
            </NuxtLink>
          </li>

          <li
            v-if="!isAuthenticated"
            class="btn-login btn btn--pixel"
          >
            <NuxtLink to="/auth" @click="isMenuOpen = false">
              Вход / Регистрация
            </NuxtLink>
          </li>
          <li
            v-else
            class="btn-logout btn btn--pixel"
          >
            <button type="button" @click="logoutHandler">
              Выйти
            </button>
          </li>

          <li class="social-icons">
            <a
              v-for="(icon, index) in socialIcons"
              :key="index"
              :href="icon.link"
              target="_blank"
              rel="noopener noreferrer"
              :class="['social-icons__link', `icon-${icon.name}`]"
            />
          </li>
        </ul>
      </aside>
    </transition>
  </header>
</template>

<style lang="scss">

</style>