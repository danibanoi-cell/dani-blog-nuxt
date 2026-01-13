<template>
  <header class="header">
    <!-- Left: Brand name -->
    <NuxtLink to="/" class="brand" aria-label="Home" @click="scrollToTop">
      <span class="brand-text">danibanoi.</span>
    </NuxtLink>

    <!-- Right: Instagram icon only -->
    <a
      class="ig-btn"
      href="https://instagram.com/danibanoi"
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
  </header>
</template>

<script setup lang="ts">
const scrollToTop = () => {
  if (typeof window !== 'undefined') {
    // Reset landing page state if it exists
    const landingWrapper = document.querySelector('.landing-wrapper') as HTMLElement | null
    if (landingWrapper) {
      landingWrapper.style.transform = 'translateY(0)'
      landingWrapper.style.filter = 'blur(0px)'
      landingWrapper.style.visibility = 'visible'
      landingWrapper.style.pointerEvents = 'auto'
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Re-lock scroll for landing (if landing gating is active)
    setTimeout(() => {
      if (landingWrapper && window.scrollY === 0) {
        document.documentElement.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'
        document.body.style.touchAction = 'none'
      }
    }, 500)
  }
}
</script>

<style scoped>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 400;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 18px;
    background: transparent;
    max-width: var(--site-max-width);
    margin: 0 auto;
    width: 100%;
    pointer-events: none; /* hide bar feel; icons still clickable */
  }

  .brand {
    display: inline-flex;
    align-items: center;
    font-size: 1.6rem;
    font-weight: 400;
    letter-spacing: 0.08em;
    text-transform: none;
    color: var(--text-primary);
    text-decoration: none;
    cursor: pointer;
    opacity: 1;
    transition: opacity 0.2s ease;
    text-shadow: none;
    pointer-events: auto;
  }

.brand:hover {
  opacity: 0.7;
}

.brand-text {
  font-family: var(--font-heading, sans-serif);
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
}

  .ig-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    text-decoration: none;
    opacity: 0.9;
    transition: opacity 0.2s ease;
    pointer-events: auto;
  }

.ig-btn:hover {
  opacity: 1;
}

  .ig-icon {
    width: 42px;
    height: 42px;
    display: block;
  }

.ig-icon rect,
.ig-icon circle {
  stroke: var(--text-primary);
  fill: transparent;
  stroke-width: 1.5;
}

.ig-icon circle:last-child {
  fill: var(--text-primary);
}

@media (max-width: 768px) {
  .header {
    padding: 16px 20px;
    min-height: 3.5rem;
  }

  .brand {
    font-size: 1.4rem;
    letter-spacing: 0.06em;
  }

  .ig-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
