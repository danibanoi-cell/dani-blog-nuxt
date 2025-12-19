<template>
  <div class="app-shell">
    <SidebarNav :open="sidebarOpen" :links="links" :isDark="isDark" @set-theme="setTheme" @close="sidebarOpen = false" />
    <div class="main-wrapper">
      <HeaderBar :links="links" brand="danibanoi." @toggle-sidebar="toggleSidebar" />

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
import { ref } from 'vue'
import HeaderBar from '~/components/HeaderBar.vue'
import SidebarNav from '~/components/SidebarNav.vue'
import FooterBar from '~/components/FooterBar.vue'
import { useTheme } from '~/composables/useTheme'

const links = [
  { label: 'Overview', href: '#overview' },
  { label: 'Motion', href: '#motion' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '/contact' },
]

const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Theme management wired to sidebar toggle
const { isDark, setTheme } = useTheme()
</script>

<style>
/* Global theme variables */
:root.light {
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

@media (max-width: 864px) {
  .app-shell {
    flex-direction: column;
  }

  .main-wrapper {
    width: 100%;
  }
}
</style>

