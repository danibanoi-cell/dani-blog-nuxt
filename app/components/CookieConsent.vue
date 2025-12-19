<template>
  <!-- Cookie Consent Banner - GDPR Compliant for Italian/EU visitors -->
  <Transition name="slide-up">
    <div v-if="showBanner" class="cookie-banner" role="region" aria-label="Cookie consent">
      <div class="cookie-content">
        <h3 class="cookie-title">Cookie & Privacy</h3>
        <p class="cookie-text">
          Questo sito utilizza cookie tecnici necessari per il funzionamento. Continuando la
          navigazione accetti l'uso dei cookie. Maggiori informazioni nella nostra
          <a href="#privacy" class="cookie-link">privacy policy</a>.
        </p>
        <div class="cookie-actions">
          <button @click="acceptCookies" class="cookie-btn cookie-btn-accept">Accetta</button>
          <button @click="declineCookies" class="cookie-btn cookie-btn-decline">Rifiuta</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  const showBanner = ref(false);

  // Check if user has already made a consent choice
  onMounted(() => {
    const consentStatus = localStorage.getItem('cookieConsent');
    if (!consentStatus) {
      // Show banner after 1 second delay for better UX
      setTimeout(() => {
        showBanner.value = true;
      }, 1000);
    }
  });

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    showBanner.value = false;
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    showBanner.value = false;
  };
</script>

<style scoped>
  /* ============================================
   COOKIE CONSENT BANNER
   ============================================ */

  /* Cookie banner container - fixed bottom with backdrop blur */
  .cookie-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999; /* Ensure it's above all content */
    background: rgba(15, 23, 42, 0.95); /* Dark navy with slight transparency */
    backdrop-filter: blur(10px); /* Glass effect */
    border-top: 1px solid rgba(255, 255, 255, 0.1); /* Subtle top border */
    padding: 1.5rem;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3); /* Shadow pointing upward */
  }

  /* Banner content wrapper - responsive layout */
  .cookie-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem; /* Space between title, text, and buttons */
  }

  /* Cookie banner title */
  .cookie-title {
    color: #f8fafc; /* Light text */
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    font-family: var(--font-heading); /* Use Oswald for consistency */
  }

  /* Cookie banner text - readable and informative */
  .cookie-text {
    color: #cbd5e1; /* Light gray for secondary text */
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
    font-family: var(--font-body); /* Use Roboto for body text */
  }

  /* Privacy policy link styling */
  .cookie-link {
    color: #7dd3fc; /* Light blue for link visibility */
    text-decoration: underline;
    transition: color 0.2s ease;
  }

  .cookie-link:hover {
    color: #06b6d4; /* Darker blue on hover */
  }

  /* Cookie action buttons container */
  .cookie-actions {
    display: flex;
    gap: 0.75rem; /* Space between buttons */
    flex-wrap: wrap; /* Allow buttons to wrap on small screens */
  }

  /* Base button styling */
  .cookie-btn {
    padding: 0.5rem 1.25rem;
    border: none;
    border-radius: 0.5rem; /* Squared rounded corners */
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 120px; /* Minimum width for clickability */
  }

  /* Accept button - prominent style */
  .cookie-btn-accept {
    background: #3b82f6; /* Blue background */
    color: white;
  }

  .cookie-btn-accept:hover {
    background: #2563eb; /* Darker blue on hover */
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  /* Decline button - secondary style */
  .cookie-btn-decline {
    background: transparent;
    color: #94a3b8; /* Light gray text */
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .cookie-btn-decline:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* ============================================
   SLIDE UP TRANSITION
   ============================================ */

  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: all 0.3s ease;
  }

  .slide-up-enter-from {
    transform: translateY(100%);
    opacity: 0;
  }

  .slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
  }

  /* ============================================
   RESPONSIVE ADJUSTMENTS
   ============================================ */

  /* Mobile - stack buttons vertically */
  @media (max-width: 640px) {
    .cookie-banner {
      padding: 1.25rem;
    }

    .cookie-content {
      gap: 0.875rem;
    }

    .cookie-text {
      font-size: 0.8125rem;
    }

    .cookie-actions {
      flex-direction: column;
    }

    .cookie-btn {
      width: 100%;
      padding: 0.625rem 1rem;
    }
  }
</style>
