/**
 * Theme Management Composable
 * Handles dark/light mode toggle with localStorage persistence
 */

import { ref, watch, onMounted } from 'vue'

export type Theme = 'light' | 'dark'

const isDark = ref<boolean>(false)
const STORAGE_KEY = 'dani-portfolio-theme'

export function useTheme() {
  // Initialize theme from localStorage or system preference
  const initTheme = () => {
    if (process.client) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        isDark.value = stored === 'dark'
      } else {
        // Check system preference
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      applyTheme()
    }
  }

  // Apply theme to document
  const applyTheme = () => {
    if (process.client) {
      if (isDark.value) {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
      }
    }
  }

  // Toggle between light and dark
  const toggleTheme = () => {
    isDark.value = !isDark.value
    if (process.client) {
      localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
      applyTheme()
    }
  }

  // Set specific theme
  const setTheme = (theme: Theme) => {
    isDark.value = theme === 'dark'
    if (process.client) {
      localStorage.setItem(STORAGE_KEY, theme)
      applyTheme()
    }
  }

  // Get current theme
  const currentTheme = computed<Theme>(() => isDark.value ? 'dark' : 'light')

  // Watch for changes
  watch(isDark, () => {
    applyTheme()
  })

  // Initialize on mount
  onMounted(() => {
    initTheme()
  })

  return {
    isDark,
    currentTheme,
    toggleTheme,
    setTheme,
    initTheme
  }
}
