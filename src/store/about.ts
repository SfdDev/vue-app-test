import { defineStore } from 'pinia';

export interface AboutState {
  aboutText: string;
}

export const useAboutStore = defineStore('about', {
  state: (): AboutState => ({
    aboutText: 'About Page'
  }),
  
  actions: {
    updateAboutText(newText: string) {
      this.aboutText = newText;
    }
  },
});
