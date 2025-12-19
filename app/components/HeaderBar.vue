<template>
  <header class="header">
    <!-- Left: burger menu -->
    <button class="menu-btn" type="button" @click="$emit('toggle-sidebar')" aria-label="Open menu">
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
      <a class="ig-btn" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
        <svg viewBox="0 0 24 24" class="ig-icon" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="white" stroke-width="1.6" />
          <circle cx="12" cy="12" r="5" fill="none" stroke="white" stroke-width="1.6" />
          <circle cx="17" cy="7" r="1.4" fill="white" />
        </svg>
      </a>
    </div>
  </header>
</template>

<script setup lang="ts">
interface NavLink {
  label: string
  href: string
}

defineProps<{ 
  links: NavLink[]
  brand: string
  isDark?: boolean
}>()

const scrollToTop = () => {
  if (process.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  min-height: 10rem;
  z-index: 200;
  display: grid;
  grid-template-columns: auto 1fr auto; /* left / center / right */
  align-items: center;
  padding: 20px 40px;
  background: var(--bg-primary);
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  transition: background-color 0.3s ease;
}
.brand {
  display: inline-flex;
  align-items: center;
  font-size: 2.25em;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: none;
  color: var(--text-primary);
  justify-self: center; /* center column */
  transition: color 0.3s ease;
  text-decoration: none;
  cursor: pointer;
}

.brand-text {
  line-height: 1;
  font-family: var(--font-body); /* Roboto */
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
  width: 36px;
  height: 28px;
  display: flex; /* always visible as burger */
  flex-direction: column;
  justify-content: space-between;
  background: none;
  border: none;
  padding: 4px 0;
  cursor: pointer;
}

.menu-btn span {
  display: block;
  height: 2px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: background-color 0.3s ease;
}

/* Right actions container */
.right-actions {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 8px;
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

@media (max-width: 900px) {
  .header { gap: 8px; padding: 16px 16px; }
}
</style>
