<template>
  <div class="app-shell">
    <div class="main-wrapper">
      <div class="masthead" :class="{ 'hide-header': hideHeader }">
        <HeaderBar />
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
import { ref, onMounted, onUnmounted } from 'vue'
import HeaderBar from '../components/HeaderBar.vue'
import FooterBar from '../components/FooterBar.vue'

// Track header visibility
const hideHeader = ref(false)

// Smooth scroll functionality
const setupSmoothScroll = () => {
  document.documentElement.style.scrollBehavior = 'smooth'

  // Handle anchor links with smooth scroll
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    const link = target.closest('a')

    if (link && link.href.includes('#')) {
      const hash = link.href.split('#')[1]
      if (hash) {
        event.preventDefault()
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }
  })
}

onMounted(() => {
  setupSmoothScroll()
})
</script>

<style>
  /* Global theme variables */
  :root {
    /* Scroll snap timing variables for consistency */
    --scroll-snap-duration: 0.8s;
    --scroll-transition-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    --header-height: 80px;
  }

  :root.light {
    --site-max-width: 1440px; /* global content cap */
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --text-primary: #0f0f0f;
    --text-secondary: #555555;
    --text-muted: #777777;
    --border-color: #d8d8d8;
    --accent-primary: #ff6b35;
    --accent-hover: #ff5a1f;
    --overlay-bg: rgba(0, 0, 0, 0.25);
    --shadow-color: rgba(0, 0, 0, 0.12);
  }

  :root.dark {
    --site-max-width: 1440px; /* global content cap */
    --bg-primary: #0a0a0a;
    --bg-secondary: #1a1a1a;
    --text-primary: #e8e8e8;
    --text-secondary: #c0c0c0;
    --text-muted: #a0a0a0;
    --border-color: #2a2a2a;
    --accent-primary: #ff6b35;
    --accent-hover: #ff8050;
    --overlay-bg: rgba(255, 255, 255, 0.15);
    --shadow-color: rgba(0, 0, 0, 0.6);
  }

  /* HTML root - abilita scroll smooth globale */
  html {
    /* scroll-behavior: smooth FONDAMENTALE per non avere scroll scattosi
       Crea animazione fluida quando navighi tra sezioni
       Importante: deve essere su html, non body per supporto universale */
    scroll-behavior: smooth;

    /* scroll-padding-top ESSENZIALE per prevenire che header fisso copra il contenuto
       Quando scrolli verso anchor link, il browser aggiunge padding al top
       Questo spacciamento evita che contenuto sia nascosto dall'header sticky */
    scroll-padding-top: var(--header-height);

    /* overscroll-behavior: none FONDAMENTALE per evitare rimbalzo elastico
       Su iOS/Android, lo scroll ha effetto rimbalzo (rubberbanding)
       Questo previene quel comportamento non-naturale, mantiene esperienza fluida */
    overscroll-behavior-y: none;
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
    background: transparent; /* Fully transparent header wrapper */
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    opacity: 1;
    pointer-events: auto;
    border-bottom: 0;
    /* cubic-bezier per transizione fluida e naturale dell'header
       Easing personalizzato rende il movimento meno meccanico e più elegante */
    transition: opacity var(--scroll-snap-duration) var(--scroll-transition-easing),
                pointer-events var(--scroll-snap-duration) var(--scroll-transition-easing),
                transform var(--scroll-snap-duration) var(--scroll-transition-easing),
                background var(--scroll-snap-duration) var(--scroll-transition-easing);
  }

  .masthead.hide-header {
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
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
