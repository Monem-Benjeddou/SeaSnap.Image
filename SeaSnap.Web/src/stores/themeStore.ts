import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((state) => ({ isDark: false })),
    }),
    {
      name: 'theme-storage',
    }
  )
);