<template>
  <!-- Copyright Notice for Photography Protection -->
  <div class="copyright-notice">
    <div class="copyright-icon" aria-hidden="true">©</div>
    <div class="copyright-text">
      <p class="copyright-main">
        <strong>{{ $t('copyright.main', { year: currentYear }) }}</strong>
      </p>
      <p class="copyright-details">
        {{ $t('copyright.details') }}
      </p>
      <p class="copyright-legal">
        {{ $t('copyright.legal') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  // Current year for copyright notice
  const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
  /* ============================================
   COPYRIGHT NOTICE - PHOTO PROTECTION
   ============================================ */

  /* Main copyright container */
  .copyright-notice {
    display: flex;
    gap: 1rem;
    padding: 2rem 1.5rem;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(32, 32, 32, 0.95));
    border-top: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    margin: 3rem 0 2rem;
    backdrop-filter: blur(8px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  /* Copyright icon - large © symbol */
  .copyright-icon {
    font-size: 3rem;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1;
    flex-shrink: 0;
  }

  /* Text content container */
  .copyright-text {
    flex: 1;
    color: #e2e8f0;
  }

  /* Main copyright line - artist name and location */
  .copyright-main {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
    color: #ffffff;
    font-family: var(--font-heading);
    letter-spacing: 0.02em;
  }

  .copyright-main strong {
    font-weight: 700;
  }

  /* Italian copyright details */
  .copyright-details {
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 0.75rem;
    color: #cbd5e1;
    font-style: italic;
  }

  /* English legal notice */
  .copyright-legal {
    font-size: 0.875rem;
    line-height: 1.6;
    color: #94a3b8;
    margin: 0;
  }

  /* ============================================
   RESPONSIVE DESIGN
   ============================================ */

  /* Mobile layout adjustments */
  @media (max-width: 640px) {
    .copyright-notice {
      flex-direction: column;
      padding: 1.5rem 1rem;
      gap: 0.75rem;
    }

    .copyright-icon {
      font-size: 2.5rem;
    }

    .copyright-main {
      font-size: 1rem;
    }

    .copyright-details,
    .copyright-legal {
      font-size: 0.875rem;
    }
  }
</style>
