/**
 * Theme Management Composable
 * Handles dark/light mode toggle with localStorage persistence
 */

import { ref, watch, onMounted, computed } from 'vue';

export type Theme = 'light' | 'dark';

const isDark = ref<boolean>(false);
const STORAGE_KEY = 'dani-portfolio-theme';

export function useTheme() {
  let followSystem = true;
  let mediaQuery: MediaQueryList | null = null;
  let mediaListener: ((e: MediaQueryListEvent) => void) | null = null;

  // Initialize theme from localStorage or system preference
  const initTheme = () => {
    if (process.client) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        isDark.value = stored === 'dark';
        followSystem = false;
      } else {
        // Check system preference
        mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        isDark.value = mediaQuery.matches;
        followSystem = true;
        // Listen for system theme changes if user hasn't overridden
        mediaListener = (e: MediaQueryListEvent) => {
          if (followSystem) {
            isDark.value = e.matches;
            applyTheme();
          }
        };
        // Cross-browser listener registration
        if (typeof mediaQuery.addEventListener === 'function') {
          mediaQuery.addEventListener('change', mediaListener);
        } else if (typeof mediaQuery.addListener === 'function') {
          // Safari fallback
          mediaQuery.addListener(mediaListener as any);
        }
      }
      applyTheme();
    }
  };

  // Apply theme to document
  const applyTheme = () => {
    if (process.client) {
      if (isDark.value) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    isDark.value = !isDark.value;
    if (process.client) {
      localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light');
      followSystem = false;
      applyTheme();
    }
  };

  // Set specific theme
  const setTheme = (theme: Theme) => {
    isDark.value = theme === 'dark';
    if (process.client) {
      localStorage.setItem(STORAGE_KEY, theme);
      followSystem = false;
      applyTheme();
    }
  };

  // Get current theme
  const currentTheme = computed<Theme>(() => (isDark.value ? 'dark' : 'light'));

  // Watch for changes
  watch(isDark, () => {
    applyTheme();
  });

  // Initialize on mount
  onMounted(() => {
    initTheme();
  });

  return {
    isDark,
    currentTheme,
    toggleTheme,
    setTheme,
    initTheme,
  };
}
