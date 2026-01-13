<template>
  <header class="header">
    <!-- Left: burger menu -->
    <button class="menu-btn" type="button" aria-label="Open menu" @click="$emit('toggle-sidebar')">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Center: brand -->
    <NuxtLink to="/" class="brand" aria-label="Brand" @click="scrollToTop">
      <span class="brand-text">{{ brand }}</span>
    </NuxtLink>

    <!-- Right: Instagram badge -->
    <div class="right-actions">
      <a
        class="ig-btn"
        href="https://instagram.com"
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram"
      >
        <svg viewBox="0 0 24 24" class="ig-icon" aria-hidden="true">
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
            fill="none"
            stroke="white"
            stroke-width="1.6"
          />
          <circle cx="12" cy="12" r="5" fill="none" stroke="white" stroke-width="1.6" />
          <circle cx="17" cy="7" r="1.4" fill="white" />
        </svg>
      </a>
    </div>
  </header>
</template>

<script setup lang="ts">
  interface NavLink {
    label: string;
    href: string;
  }

  defineProps<{
    links: NavLink[];
    brand: string;
    isDark?: boolean;
  }>();

  const scrollToTop = () => {
    if (process.client) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
</script>

<style scoped>
  .header {
    position: static; /* sticky moved to wrapper in layout */
    min-height: 7rem;
    z-index: 200;
    display: grid;
    grid-template-columns: auto 1fr auto; /* left / center / right */
    column-gap: 18px;
    align-items: center;
    padding: 18px 32px;
    background: var(--bg-primary);
    max-width: var(--site-max-width); /* align with site width cap */
    margin: 0 auto;
    width: 100%;
    transition: background-color 0.3s ease;
  }
  .brand {
    display: inline-flex;
    align-items: center;
    font-size: 2.25em;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: none;
    color: var(--text-strong, #f8fafc);
    justify-self: center; /* center column */
    transition: color 0.3s ease;
    text-decoration: none;
    cursor: pointer;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    padding: 6px 10px;
    border-radius: 12px;
  }

  .brand-text {
    line-height: 1;
    font-family: var(--font-heading, var(--font-body)); /* Prefer heading font for stronger weight */
    text-transform: lowercase;
  }

  /* removed verified badge */

  .nav-links {
    display: flex;
    justify-content: center;
    gap: 28px;
  }

  .nav-links a {
    text-decoration: none;
    color: #333;
    font-size: 0.95rem;
    letter-spacing: 0.04em;
  }

  .nav-links a:hover {
    color: #a44a48;
  }

  .menu-btn {
    justify-self: start; /* left column */
    width: 38px;
    height: 26px;
    display: flex; /* always visible as burger */
    flex-direction: column;
    justify-content: space-between;
    background: none;
    border: none;
    padding: 4px 0;
    cursor: pointer;
    border-radius: 10px;
  }

  .menu-btn span {
    display: block;
    height: 2.5px;
    background: var(--text-primary);
    border-radius: 3px;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }

  /* Right actions container */
  .right-actions {
    justify-self: end;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  /* Theme toggle button */
  /* removed theme toggle button */

  /* Instagram button */
  .ig-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    text-decoration: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4, #405de6);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  }

  .ig-btn:hover {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.24);
    filter: brightness(1.05);
  }

  .ig-icon {
    width: 24px;
    height: 24px;
    display: block;
  }

  /* Tablet (481px - 768px) & Smartphone (320px - 480px) */
  @media (max-width: 768px) {
    .header {
      gap: 8px;
      padding: 14px 18px;
    }

    .brand {
      font-size: 1.9em;
      letter-spacing: 0.04em;
      padding: 4px 8px;
    }
  }

  /* Laptop (769px+) - Desktop grandi (1200px+) */
  @media (min-width: 1200px) {
    .brand {
      font-size: 2.35em;
    }
  }

  /* Hide burger on Laptop / Desktop (769px+) */
  @media (min-width: 769px) {
    .menu-btn {
      display: none;
    }
  }
</style>
