import { useAuthStore } from '@/store/auth';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from '#imports';
import { useArticlesStore } from '@/store/articles';

// Интерфейсы для типов
export interface NavLink {
  text: string;
  href: string;
  hasSubmenu?: boolean;
}

export interface SocialIcon {
  name: string;
  link: string;
}

//функция форматирования даты
export const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    return new Date(date).toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

//получение полного урл изображения (API уже отдаёт /images/...)
export const getFullImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('/')) {
        return imagePath;
    }
    return `/${imagePath}`;
};

//получение имени пользователя
export function useAuth() {
    const authStore = useAuthStore();

    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const currentUsername = computed(() => authStore.user?.username || '');

    return {
        isAuthenticated,
        currentUsername,
    };
}

// Базовые ссылки
export function useBaseLinks() {
    const navLinks = ref<NavLink[]>([
        { text: 'Главная', href: '/' },
        { text: 'О нас', href: '/about' },
        { text: 'Блог', href: '/blog', hasSubmenu: true },
    ]);

    return { navLinks };
}

//иконки соц-сетей
export function useSocialIcons() {
    const socialIcons = ref<SocialIcon[]>([
        { name: 'instagram', link: 'https://www.instagram.com' },
        { name: 'telegram', link: 'https://telegram.org' },
        { name: 'vk', link: 'https://vk.com' },
        { name: 'github', link: 'https://github.com' },
        { name: 'youtube', link: 'https://www.youtube.com' },
    ]);

    return { socialIcons };
}

export function useChangePage(perPage: number, baseRoute = '/blog') {
    const articlesStore = useArticlesStore();
    const router = useRouter();
    const route = useRoute();

    const loadInitialData = async () => {
        const page = Number.parseInt((route.query.page as string) || '1', 10) || 1;
        await articlesStore.loadArticles(page, perPage);
    };

    onMounted(async () => {
        await loadInitialData();
    });

    watch(
        () => route.query.page,
        async (newPage) => {
            const page = Number.parseInt((newPage as string) || '1', 10) || 1;
            if (page !== articlesStore.pagination.currentPage) {
                await articlesStore.loadArticles(page, perPage);
            }
        }
    );

    const changePage = async (page: number | string) => {
        const pageNum = Number.parseInt(String(page), 10) || 1;

        if (pageNum < 1 || pageNum > articlesStore.pagination.totalPages) {
            console.warn('Некорректный номер страницы:', page);
            return;
        }

        if (pageNum !== articlesStore.pagination.currentPage) {
            try {
                await articlesStore.loadArticles(pageNum, perPage);
                if (pageNum === 1) {
                    router.push({ path: baseRoute }); // без query-параметра
                } else {
                    router.push({ path: baseRoute, query: { page: pageNum } });
                }
            } catch (error) {
                console.error('Ошибка при загрузке страницы:', error);
            }
        }
    };

    return { changePage };
}
