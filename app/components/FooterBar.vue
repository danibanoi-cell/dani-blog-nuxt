<template>
  <footer class="footer" role="contentinfo" aria-label="Footer">
    <!-- Left: Social links -->
    <div class="footer-left">
      <a
        class="ig-btn"
        href="https://instagram.com"
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram"
      >
        <svg viewBox="0 0 24 24" class="ig-icon" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="17" cy="7" r="1.4" />
        </svg>
      </a>
    </div>

    <!-- Center: Copyright -->
    <div class="footer-center">
      <span class="copyright-text"
        >© {{ currentYear }} danibanoi. • All Rights Reserved • Unauthorized use prohibited</span
      >
    </div>

    <!-- Right: Quick link + Language + Theme -->
    <div class="footer-right">
      <NuxtLink class="contact-link" to="/contact" aria-label="Contact"> Contact </NuxtLink>
      <div class="lang-switch" role="group" aria-label="Language">
        <NuxtLink
          :to="switchLocalePath('it')"
          class="lang-link"
          :class="{ active: currentLocale === 'it' }"
          >IT</NuxtLink
        >
        <NuxtLink
          :to="switchLocalePath('en')"
          class="lang-link"
          :class="{ active: currentLocale === 'en' }"
          >EN</NuxtLink
        >
      </div>
      <div class="theme-switch" role="group" aria-label="Theme">
        <button
          class="theme-link"
          :class="{ active: !isDark }"
          type="button"
          :aria-pressed="!isDark"
          @click="setTheme('light')"
        >
          Light
        </button>
        <button
          class="theme-link"
          :class="{ active: isDark }"
          type="button"
          :aria-pressed="isDark"
          @click="setTheme('dark')"
        >
          Dark
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
  const currentYear = new Date().getFullYear();
  const { locale } = useI18n();
  const switchLocalePath = useSwitchLocalePath();
  const currentLocale = computed(() => locale.value);
  const { toggleTheme, isDark, setTheme } = useTheme();
</script>

<style scoped>
  .footer {
    position: relative;
    min-height: 10rem;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    padding: 20px 40px;
    background: var(--bg-primary);
    border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.12));
    max-width: var(--site-max-width);
    margin: 0 auto;
    width: 100%;
    transition: background-color 0.3s ease;
  }

  .footer-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .footer-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .footer-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .lang-switch {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }
  .lang-link {
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 6px 10px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease,
      opacity 0.2s ease;
  }
  .lang-link:hover {
    opacity: 0.8;
  }
  .lang-link.active {
    background: var(--bg-secondary);
  }
  .theme-switch {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }
  .theme-link {
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 6px 10px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    background: transparent;
    cursor: pointer;
  }
  .theme-link:hover {
    opacity: 0.8;
  }
  .theme-link.active {
    background: var(--bg-secondary);
  }
  .contact-link {
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }
  .contact-link:hover {
    background: var(--bg-secondary);
  }

  .copyright-text {
    color: var(--text-primary);
    font-size: 0.9rem;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-align: center;
  }

  .ig-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .ig-btn:hover {
    opacity: 0.7;
  }

  .ig-icon {
    width: 24px;
    height: 24px;
    stroke: var(--text-primary);
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* Smartphone (320px - 480px) */
  @media (max-width: 480px) {
    .footer {
      padding: 20px;
      min-height: 8rem;
    }

    .copyright-text {
      font-size: 0.8rem;
    }

    .ig-icon {
      width: 20px;
      height: 20px;
    }
  }
</style>
