import { defineStore } from 'pinia';
import { reactive } from 'vue';

export interface HeroState {
  home: {
    heroText: string;
    description: string;
  };
  blog: {
    heroText: string;
    description: string;
  };
  about: {
    heroText: string;
    description: string;
  };
  learn: {
    heroText: string;
    description: string;
  };
  todo: {
    heroText: string;
    description: string;
  };
  parallax: {
    heroText: string;
    description: string;
  };
}

export const useHeroStore = defineStore('heroStore', () => {
  const state = reactive<HeroState>({
    home: {
      heroText: 'Добро пожаловать!',
      description: 'Это главная страница нашего сайта, где вы найдёте всё самое интересное!',
    },
    blog: {
      heroText: 'Блог',
      description: 'Читайте наши последние статьи и новости в блоге.',
    },
    about: {
      heroText: 'О нас',
      description: 'Узнайте больше о нашей команде и миссии.',
    },
    learn: {
      heroText: 'Обучение',
      description: 'Узнайте больше о разработке вместе с нами',
    },
    todo: {
      heroText: 'Задачник',
      description: 'Создавайте задачи и совершенствуйтесь в их выполнении',
    },
    parallax: {
      heroText: 'Параллакс',
      description: 'Создавайте задачи и совершенствуйтесь в их выполнении',
    },
  });

  // Универсальный геттер
  function getContent(routeName: keyof HeroState, key: 'heroText' | 'description', fallback = '') {
    // Проверяем, существует ли маршрут
    if (state[routeName] && state[routeName][key]) {
      return state[routeName][key];
    }
    
    // Возвращаем значение по умолчанию
    return fallback;
  }

  return {
    getContent,
  };
});
