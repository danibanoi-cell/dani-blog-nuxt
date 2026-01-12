<template>
  <div class="app-shell">
    <SidebarNav
      :open="sidebarOpen"
      :links="links"
      :is-dark="isDark"
      @set-theme="setTheme"
      @close="sidebarOpen = false"
    />
    <div class="main-wrapper">
      <div class="masthead">
        <HeaderBar :links="links" brand="danibanoi." @toggle-sidebar="toggleSidebar" />
        <!-- Desktop navigation under header (hidden on mobile) -->
        <nav class="desktop-nav" aria-label="Primary Navigation">
          <ul class="desktop-nav-list">
            <li v-for="link in links" :key="link.href">
              <NuxtLink :to="link.href" class="desktop-nav-link">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </nav>
      </div>

      <main class="page-shell">
        <NuxtPage />
      </main>

      <FooterBar />
    </div>

    <!-- Cookie Consent Banner - GDPR compliant for EU/Italian visitors -->
    <CookieConsent />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import SidebarNav from '../components/SidebarNav.vue';
  import FooterBar from '../components/FooterBar.vue';
  import HeaderBar from '../components/HeaderBar.vue';
  import { useTheme } from '../composables/useTheme';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  // Localized navigation links
  const links = computed(() => [
    { label: t('nav.portfolio'), href: '/' },
    { label: t('index.title'), href: '#motion' },
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.contact'), href: '/contact' },
  ]);

  const sidebarOpen = ref(false);

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };

  // Theme management wired to sidebar toggle
  const { isDark, setTheme } = useTheme();

  // Smooth scroll functionality
  const setupSmoothScroll = () => {
    document.documentElement.style.scrollBehavior = 'smooth';

    // Handle anchor links with smooth scroll
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href.includes('#')) {
        const hash = link.href.split('#')[1];
        if (hash) {
          event.preventDefault();
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    });
  };

  onMounted(() => {
    setupSmoothScroll();
  });
</script>

<style>
  /* Global theme variables */
  :root.light {
    --site-max-width: 1440px; /* global content cap */
    --bg-primary: #ffffff;
    --bg-secondary: #f9f9f9;
    --text-primary: #0f0f0f;
    --text-secondary: #666;
    --text-muted: #999;
    --border-color: #e0e0e0;
    --overlay-bg: rgba(0, 0, 0, 0.25);
    --shadow-color: rgba(0, 0, 0, 0.1);
  }

  :root.dark {
    --site-max-width: 1440px; /* global content cap */
    --bg-primary: #0a0a0a;
    --bg-secondary: #1a1a1a;
    --text-primary: #f0f0f0;
    --text-secondary: #b0b0b0;
    --text-muted: #888;
    --border-color: #333;
    --overlay-bg: rgba(255, 255, 255, 0.15);
    --shadow-color: rgba(0, 0, 0, 0.5);
  }
</style>

<style scoped>
  .app-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: row;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .main-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .page-shell {
    flex: 1;
    width: 100%;
  }

  /* Sticky wrapper for header + nav */
  .masthead {
    position: sticky;
    top: 0;
    z-index: 200;
    background: var(--bg-primary);
  }

  /* Desktop nav styles */
  .desktop-nav {
    display: none; /* hidden by default, shown on desktop */
  }

  @media (min-width: 901px) {
    .desktop-nav {
      display: block;
      width: 100%;
      max-width: var(--site-max-width);
      margin: 0 auto;
      padding: 8px 24px 16px 24px; /* small bottom margin effect */
      border-top: 1px solid var(--border-color); /* visual separation from header */
    }

    .desktop-nav-list {
      display: flex;
      justify-content: center; /* previous centered layout */
      gap: 32px;
      list-style: none;

      margin: 0;
      padding: 0;
    }

    .desktop-nav-link {
      color: var(--text-primary);
      text-decoration: none;
      font-size: 0.98rem;
      letter-spacing: 0.04em;
      transition: opacity 0.2s ease;
    }

    .desktop-nav-link:hover {
      opacity: 0.7; /* no color change on hover per convention */
    }
  }

  @media (max-width: 864px) {
    .app-shell {
      flex-direction: column;
    }

    .main-wrapper {
      width: 100%;
    }
  }
</style>
