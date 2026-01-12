<template>
  <Transition name="sidebar-overlay">
    <div v-if="open" class="overlay" @click="$emit('close')"></div>
  </Transition>
  <Transition name="sidebar-slide">
    <aside v-show="open" class="sidebar" aria-label="Navigation">
      <div class="sidebar-content">
        <button class="close" type="button" aria-label="Close navigation" @click="$emit('close')">
          <svg viewBox="0 0 24 24" class="close-icon">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <nav>
          <NuxtLink v-for="link in links" :key="link.href" :to="link.href" class="nav-link" @click="$emit('close')">
            {{ $t(link.label) }}
          </NuxtLink>
        </nav>

        <!-- Bottom controls: Theme + Language toggles -->
        <div class="sidebar-controls">
          <div class="toggle-group theme-toggle" role="group" aria-label="Theme">
            <span class="toggle-indicator" :class="{ active: isDark }" aria-hidden="true"></span>
            <button class="toggle-btn" :class="{ active: !isDark }" type="button" :aria-pressed="!isDark"
              @click="$emit('set-theme', 'light')">Light</button>
            <button class="toggle-btn" :class="{ active: isDark }" type="button" :aria-pressed="isDark"
              @click="$emit('set-theme', 'dark')">Dark</button>
          </div>
          <div class="toggle-group language-toggle" role="group" aria-label="Language">
            <span class="toggle-indicator" :class="{ active: currentLocale === 'en' }" aria-hidden="true"></span>
            <button class="toggle-btn" :class="{ active: currentLocale === 'it' }" type="button"
              :aria-pressed="currentLocale === 'it'" @click="setLanguage('it')">IT</button>
            <button class="toggle-btn" :class="{ active: currentLocale === 'en' }" type="button"
              :aria-pressed="currentLocale === 'en'" @click="setLanguage('en')">EN</button>
          </div>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

interface NavLink {
  label: string
  href: string
}

type Language = 'it' | 'en';
type Locale = Language;

defineProps<{ links: NavLink[]; open: boolean; isDark: boolean }>()
defineEmits<{
  (e: 'set-theme', theme: 'light' | 'dark'): void
  (e: 'close'): void
}>()

const { t, locale, setLocale } = useI18n<{ locale: Locale; setLocale: (code: Locale) => void }>();
const switchLocalePath = useSwitchLocalePath()
const router = useRouter()
const currentLocale = computed(() => locale.value)

const setLanguage = (lang: 'it' | 'en') => {
  setLocale(lang);
  // const path = switchLocalePath(lang)
  // await router.push(path)
}
</script>

<style scoped>
  .overlay {
    position: fixed;
    inset: 0;
    background: var(--overlay-bg, rgba(0, 0, 0, 0.25));
    backdrop-filter: blur(2px);
    z-index: 290;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 50vw;
    background: var(--bg-primary, #ffffff);
    border-right: 1px solid var(--border-color, #e0e0e0);
    box-shadow: 8px 0 24px var(--shadow-color, rgba(0, 0, 0, 0.1));
    z-index: 300;
    overflow-y: auto;
  }

  .sidebar-content {
    position: relative;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    gap: 48px;
    height: 100%;
  }

  .close {
    align-self: flex-end;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--text-primary, #333);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
    padding: 0;
  }

  .close:hover {
    transform: scale(1.1);
  }

  .close-icon {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  .nav-link {
    display: block;
    width: 100%;
    padding: 8px 0;
    text-decoration: none;
    color: var(--text-primary, #0b1020);
    background: transparent;
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    transition: color 0.12s ease;
    cursor: pointer;
    text-align: left;
  }

  .nav-link:hover {
    color: var(--accent, #a44a48);
  }

  .nav-label {
    display: inline-block;
  }

  .nav-link.active {
    color: var(--accent-dark, #7a2f2e);
  }

  /* Transitions */
  .sidebar-overlay-enter-active,
  .sidebar-overlay-leave-active {
    transition: opacity 0.25s ease;
  }

  .sidebar-overlay-enter-from,
  .sidebar-overlay-leave-to {
    opacity: 0;
  }

  .sidebar-slide-enter-active,
  .sidebar-slide-leave-active {
    transition: transform 0.25s ease;
  }

  .sidebar-slide-enter-from,
  .sidebar-slide-leave-to {
    transform: translateX(-100%);
  }

  .sidebar-controls {
    margin-top: auto;
    display: flex;
    flex-direction: row;
    gap: 16px 16px;
    padding-top: 18px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .toggle-group {
    display: inline-flex;
    align-items: center;
    gap: 0;
    background: var(--bg-secondary, #f6f6f6);
    border: 1px solid var(--border-color, #d0d0d0);
    border-radius: 999px;
    padding: 4px;
    position: relative;
    overflow: hidden;
    min-height: 34px;
  }

  .toggle-btn {
    appearance: none;
    border: none;
    background: transparent;
    color: var(--text-primary, #222);
    font-size: 0.8rem;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    z-index: 1;
    min-width: 64px;
    transition: color 0.2s ease;
  }

  .toggle-btn.active {
    color: #a44a48;
  }

  .theme-toggle {
    width: 150px;
  }

  .theme-toggle .toggle-indicator {
    position: absolute;
    top: 3px;
    left: 3px;
    width: calc(50% - 3px);
    height: calc(100% - 6px);
    background: #e5e5e5;
    border-radius: 8px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
    transition: transform 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease;
  }

  .theme-toggle .toggle-indicator.active {
    transform: translateX(100%);
    background: #a44a48;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  }

  .language-toggle {
    width: 140px;
  }

  .language-toggle .toggle-indicator {
    position: absolute;
    top: 3px;
    left: 3px;
    width: calc(50% - 3px);
    height: calc(100% - 6px);
    background: #e5e5e5;
    border-radius: 8px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
    transition: transform 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease;
  }

  .language-toggle .toggle-indicator.active {
    transform: translateX(100%);
    background: #a44a48;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  }

  @media (min-width: 865px) {
    .sidebar {
      width: 350px;
      box-shadow: 8px 0 24px var(--shadow-color, rgba(0, 0, 0, 0.15));
    }

    nav {
      margin-top: 20px;
    }
  }
</style>
