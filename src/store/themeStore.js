import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: 'light',
  setTheme: () => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.removeItem('letters_theme');
      } catch (e) {}
    }
    set({ theme: 'light' });
  },
  toggleTheme: () => {
    // Light mode locked
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
    }
  },
  initTheme: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('letters_theme');
        document.documentElement.classList.remove('dark');
      } catch (e) {}
      set({ theme: 'light' });
    }
  },
}));
