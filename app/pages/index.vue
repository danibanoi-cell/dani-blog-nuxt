<template>
  <!-- SEO: Main page container with semantic HTML structure -->
  <div class="page-container" :class="{ 'landing-active': !landingDone }" itemscope itemtype="https://schema.org/CollectionPage">
    
    <!-- LANDING PAGE OVERLAY - Independent fixed overlay that slides up on scroll -->
    <div class="landing-wrapper">
      <!-- KINFOLK-INSPIRED LANDING SECTION -->
      <section class="landing-section" aria-labelledby="landing-title" @click="finishLanding">
        <div class="landing-grid">
          <!-- Left Column: Text Content -->
          <div class="landing-text">
            <h1 id="landing-title" class="landing-title">{{ $t('landing.title') || 'Dani Banoi' }}</h1>
            <p class="landing-subtitle">{{ $t('landing.subtitle') || 'Fotografo | Verona' }}</p>
            <p class="landing-description">{{ $t('landing.description') || 'Storie raccontate attraverso la luce e l\'autenticità del momento.' }}</p>
          </div>
          
          <!-- Right Column: Vertical Photo -->
          <div class="landing-photo">
            <img 
              :src="randomHeroImage?.src || heroImages?.[0]?.src || ''" 
              :alt="randomHeroImage?.alt || heroImages?.[0]?.alt || ''"
              class="landing-image"
            />
          </div>
        </div>
        
        <!-- Scroll Indicator removed per request -->
      </section>
    </div>

    <!-- FULLSCREEN PHOTO SECTION - First content element -->
    <section class="photo-section">
      <img 
        src="/foto-sito/alice_alice-portrait-elegance_1_1766139336530.jpg"
        alt="Featured photography"
        class="section-image"
      />

      <!-- Kinfolk-like caption overlay that reacts to scroll -->
      <div class="kinfolk-caption" aria-hidden="true">
        <div class="kinfolk-caption-inner">
          <p class="kinfolk-eyebrow">{{ $t('index.eyebrow') }}</p>
          <h2 class="kinfolk-headline">{{ $t('index.headline') }}</h2>
        </div>
      </div>
    </section>
    
    <!-- ALBUMS SECTION -->
    <main class="main-content" role="main">
      <section class="intro" aria-labelledby="albums-headline">
        <p class="eyebrow">{{ $t('index.eyebrow') }}</p>
        <h2 id="albums-headline" class="headline" itemprop="name">{{ $t('index.headline') }}</h2>
        <p class="lede" itemprop="description">{{ $t('index.payoff') }}</p>
      </section>

      <!-- Albums with Horizontal Galleries -->
      <div v-if="loading" class="loading-container" role="status" aria-live="polite">
        <p>{{ $t('index.loadingAlbums') }}</p>
      </div>

      <div v-else class="albums-container">
        <div v-for="album in albums" :key="album.slug" class="album-section">
          <SlideGallery
            :items="album.allPhotos"
            :title="album.title"
            :subtitle="`${album.location} • ${album.date}`"
            :auto-play="false"
            @card-click="(item: AlbumPhoto, index: number) => openLightbox(album.allPhotos, index)"
          />
        </div>

        <div v-if="hasMoreAlbums" class="load-more-albums-container">
          <button class="action-btn load-more-albums" @click="loadMoreAlbums">
            <span>{{ $t('index.loadMoreAlbums') }}</span>
            <svg viewBox="0 0 24 24" class="btn-icon">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <p class="albums-count-text">
            {{ $t('index.showingAlbums', { current: albums.length, total: allAlbums.length }) }}
          </p>
        </div>
        <div class="lightbox-counter">
          {{ currentImageIndex + 1 }} / {{ lightboxImages.length }}
        </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n, useHead } from '#imports'
import type { Album, AlbumPhoto, ProcessedPhoto, Photo } from '../types'

  // SEO: Page-specific meta tags for photography portfolio (localized)
  const { t } = useI18n()

  useHead({
    title: t('index.title'),
    meta: [
      { name: 'description', content: t('index.description') },
      { name: 'keywords', content: t('index.keywords') || 'fotografo Verona, photography Valpolicella, Lago di Garda' },
      { property: 'og:title', content: t('index.ogTitle') || t('index.title') },
      { property: 'og:description', content: t('index.ogDescription') || t('index.description') },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: process.env.I18N_LOCALE || 'it_IT' },
      { name: 'geo.region', content: 'IT-VR' },
      { name: 'geo.placename', content: 'Verona' },
      { name: 'twitter:title', content: t('index.twitterTitle') || t('index.title') },
      { name: 'twitter:description', content: t('index.twitterDescription') || t('index.description') },
    ],
    link: [{ rel: 'preconnect', href: 'https://fonts.googleapis.com' }, { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' }],
  });

  // Normalize filepaths returned from the API to web-accessible paths
  const normalizeFilepath = (fp?: string): string => {
    if (!fp) return ''
    const s = String(fp)
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s
    const cleaned = s.replace(/\\\\/g, '/').trim()
    if (cleaned.includes('public/uploads/')) {
      return '/uploads/' + cleaned.split('public/uploads/').pop()
    }
    if (cleaned.includes('public/foto-sito/')) {
      return '/foto-sito/' + cleaned.split('public/foto-sito/').pop()
    }
    if (cleaned.includes('uploads/')) {
      return '/uploads/' + cleaned.split('uploads/').pop()
    }
    if (cleaned.includes('foto-sito/')) {
      return '/foto-sito/' + cleaned.split('foto-sito/').pop()
    }
    // Fallback to basename
    const parts = cleaned.split('/').filter(Boolean)
    return parts.length ? `/${parts[parts.length - 1]}` : cleaned
  }

  // Posts feed loaded from API
  const posts = ref<ProcessedPhoto[]>([])
  const loading = ref(true)
  const visibleAlbumsCount = ref(5)

  // Hero images for landing
  const heroImages = ref([
    { src: '/foto-sito/alice_alice-portrait-elegance_1_1766139336530.jpg', alt: 'Portrait Elegance' },
    { src: '/foto-sito/alice_alice-portrait-elegance_2_1766139336726.jpg', alt: 'Portrait Elegance' },
    { src: '/foto-sito/alice_alice-portrait-elegance_3_1766139337054.jpg', alt: 'Portrait Elegance' },
    { src: '/foto-sito/alice_alice-portrait-elegance_4_1766139337197.jpg', alt: 'Portrait Elegance' },
    { src: '/foto-sito/alice_alice-portrait-elegance_5_1766139337340.jpg', alt: 'Portrait Elegance' },
    { src: '/foto-sito/alice_alice-natural-light_1_1766139337450.jpg', alt: 'Natural Light' },
    { src: '/foto-sito/alice_alice-natural-light_2_1766139337651.jpg', alt: 'Natural Light' },
    { src: '/foto-sito/alice_alice-natural-light_3_1766139337800.jpg', alt: 'Natural Light' },
    { src: '/foto-sito/alice_alice-natural-light_4_1766139338080.jpg', alt: 'Natural Light' },
    { src: '/foto-sito/alice_alice-natural-light_5_1766139338221.jpg', alt: 'Natural Light' },
  ])

  const randomHeroImageIndex = ref(0)
  const randomHeroImage = computed(() => heroImages.value[randomHeroImageIndex.value])

  // Group photos by album (session_slug)
  const allAlbums = computed((): Album[] => {
    const albumsMap = new Map<string, Album>()

    // Group all photos by session_slug
    posts.value.forEach((post: ProcessedPhoto) => {
      const slug = post.session_slug || 'uncategorized'
      if (!albumsMap.has(slug)) {
        albumsMap.set(slug, {
          slug: slug,
          title: post.title,
          location: post.location || 'Studio',
          date: post.date_taken || '2025',
          photos: [],
          allPhotos: [],
          totalPhotos: 0
        })
      }
      const album = albumsMap.get(slug)!
      album.allPhotos.push({
        id: post.id,
        image: post.src,
        title: post.title,
        description: post.excerpt,
      })
    })

    // Convert to array with all photos sorted by ID ascending within each album
    return Array.from(albumsMap.values())
      .map((album) => ({
        ...album,
        allPhotos: (album.allPhotos as AlbumPhoto[]).sort((a, b) => a.id - b.id),
        totalPhotos: album.allPhotos.length,
      }))
      .filter(album => album.slug !== 'uncategorized')
  })

  // Visible albums (limited to visibleAlbumsCount)
  const albums = computed((): Album[] => {
    return allAlbums.value.slice(0, visibleAlbumsCount.value)
  })

  // Check if there are more albums to load
  const hasMoreAlbums = computed((): boolean => {
    return allAlbums.value.length > visibleAlbumsCount.value
  })

  // Load more albums
  const loadMoreAlbums = (): void => {
    visibleAlbumsCount.value += 5
  }

  // Lightbox state
  const lightboxOpen = ref(false)
  const lightboxImages = ref<AlbumPhoto[]>([])
  const currentImageIndex = ref(0)

  // Open lightbox with album photos
  const openLightbox = (photos: AlbumPhoto[], index: number): void => {
    lightboxImages.value = photos
    currentImageIndex.value = index
    lightboxOpen.value = true
    document.body.style.overflow = 'hidden'
  }

  // Close lightbox
  const closeLightbox = (): void => {
    lightboxOpen.value = false
    // Keep scroll locked if landing isn't finished yet
    if (landingDone.value) document.body.style.overflow = ''
  }

  // Navigate lightbox
  const nextImage = (): void => {
    if (currentImageIndex.value < lightboxImages.value.length - 1) {
      currentImageIndex.value++
    }
  }

  const prevImage = (): void => {
    if (currentImageIndex.value > 0) {
      currentImageIndex.value--
    }
  }

  // Keyboard navigation
  const handleKeydown = (e: KeyboardEvent): void => {
    // Allow keyboard dismissal of landing
    if (!landingDone.value && !lightboxOpen.value) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        finishLanding()
        return
      }
    }

    if (!lightboxOpen.value) return

    if (e.key === 'Escape') closeLightbox()
    else if (e.key === 'ArrowRight') nextImage()
    else if (e.key === 'ArrowLeft') prevImage()
  }

  // Landing scroll gating: block page scroll until landing fully slides away
  const landingDone = ref(false)
  const landingOffset = ref(0)
  const landingHeight = ref(0)
  let touchLastY = 0

  const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value))

  const applyLandingStyles = (): void => {
    const landingWrapper = document.querySelector('.landing-wrapper') as HTMLElement | null
    if (!landingWrapper || landingHeight.value <= 0) return

    const progress = landingHeight.value ? landingOffset.value / landingHeight.value : 0
    const blurAmount = progress > 0.8 ? ((progress - 0.8) / 0.2) * 8 : 0

    landingWrapper.style.transform = `translateY(-${landingOffset.value}px)`
    landingWrapper.style.filter = `blur(${blurAmount}px)`

    if (landingDone.value) {
      landingWrapper.style.pointerEvents = 'none'
      landingWrapper.style.visibility = 'hidden'
    } else {
      landingWrapper.style.pointerEvents = 'auto'
      landingWrapper.style.visibility = 'visible'
    }
  }

  const lockPageScroll = (): void => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
  }

  const unlockPageScroll = (): void => {
    document.documentElement.style.overflow = ''
    if (!lightboxOpen.value) document.body.style.overflow = ''
    document.body.style.touchAction = ''
  }

  const finishLanding = (): void => {
    landingDone.value = true
    landingOffset.value = landingHeight.value
    applyLandingStyles()
    unlockPageScroll()
  }

  // Allow re-triggering the landing slide when scrolling back to top
  const resetLandingIfAtTop = (): void => {
    if (lightboxOpen.value) return
    if (window.scrollY <= 4 && landingDone.value) {
      landingDone.value = false
      landingOffset.value = 0
      applyLandingStyles()
      lockPageScroll()
    }
  }

  // =========================
  // Kinfolk-like caption parallax
  // =========================
  let photoSectionEl: HTMLElement | null = null
  let captionEl: HTMLElement | null = null
  let photoTop = 0
  let photoHeight = 0
  let captionTicking = false

  const recalcPhotoMetrics = (): void => {
    if (!photoSectionEl) return
    // offsetTop is stable for our static layout
    photoTop = photoSectionEl.offsetTop
    photoHeight = photoSectionEl.offsetHeight
  }

  const updateCaptionOnScroll = (): void => {
    if (!photoSectionEl || !captionEl) return
    if (captionTicking) return
    captionTicking = true

    requestAnimationFrame(() => {
      const y = window.scrollY
      // Map when the section is traversed to [0..1]
      const progress = clamp((y - photoTop) / (photoHeight || 1), 0, 1)
      // Subtle vertical drift and gentle opacity shaping
      const translateY = (1 - progress) * 40 - 20 // from ~+20px to ~-20px
      const opacity = clamp(0.9 - Math.abs(progress - 0.5) * 0.4, 0.6, 1)

      captionEl!.style.transform = `translateY(${translateY}px)`
      captionEl!.style.opacity = String(opacity)
      captionTicking = false
    })
  }

  const onWheel = (event: WheelEvent): void => {
    if (landingDone.value || lightboxOpen.value) return
    event.preventDefault()

    // Apply a gentle easing factor to reduce jumpiness
    const delta = event.deltaY * 0.65
    landingOffset.value = clamp(landingOffset.value + delta, 0, landingHeight.value)
    applyLandingStyles()

    if (landingOffset.value >= landingHeight.value - 12) finishLanding()
  }

  const onTouchStart = (event: TouchEvent): void => {
    if (landingDone.value || lightboxOpen.value) return
    const touch = event.touches.item(0)
    if (!touch) return
    touchLastY = touch.clientY
  }

  const onTouchMove = (event: TouchEvent): void => {
    if (landingDone.value || lightboxOpen.value) return
    const touch = event.touches.item(0)
    if (!touch) return
    event.preventDefault()

    const currentY = touch.clientY
    const deltaY = (touchLastY - currentY) * 0.65
    touchLastY = currentY

    landingOffset.value = clamp(landingOffset.value + deltaY, 0, landingHeight.value)
    applyLandingStyles()

    if (landingOffset.value >= landingHeight.value - 12) finishLanding()
  }

  // SEO: Fetch and display published photos on mount
  onMounted(async () => {
    // Set random hero image for landing
    randomHeroImageIndex.value = Math.floor(Math.random() * heroImages.value.length)

    // Measure landing height and lock scroll until landing is dismissed
    const landingWrapper = document.querySelector('.landing-wrapper') as HTMLElement | null
    if (landingWrapper) {
      landingHeight.value = landingWrapper.getBoundingClientRect().height
      landingOffset.value = 0
      landingDone.value = false
      applyLandingStyles()
      lockPageScroll()

      window.addEventListener('wheel', onWheel, { passive: false })
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchmove', onTouchMove, { passive: false })

    }

    // Caption parallax: cache refs and prime metrics
    photoSectionEl = document.querySelector('.photo-section') as HTMLElement | null
    captionEl = document.querySelector('.kinfolk-caption') as HTMLElement | null
    recalcPhotoMetrics()
    updateCaptionOnScroll()
    window.addEventListener('resize', recalcPhotoMetrics, { passive: true })
    window.addEventListener('scroll', updateCaptionOnScroll, { passive: true })
    window.addEventListener('scroll', resetLandingIfAtTop, { passive: true })

    // Add keyboard event listener
    window.addEventListener('keydown', handleKeydown)

    // (Scroll is gated via wheel/touch until landing finishes)

    // Track page visit for analytics
    try {
      await $fetch('/api/analytics/track', {
        method: 'POST',
        body: {
          page: window.location.pathname,
        },
      })
    } catch (error) {
      // Silent fail - analytics tracking shouldn't block page load
    }

    try {
      const response = await $fetch<{ success: boolean; data?: Photo[]; photos?: Photo[] }>('/api/photos?published=true')
      
      if (response.success && (Array.isArray(response.data) || Array.isArray(response.photos))) {
        const photoArray = Array.isArray(response.data) ? response.data : response.photos || []
        
        // Map API response to ProcessedPhoto format
        posts.value = photoArray.map((photo: Photo): ProcessedPhoto => {
          const normalized = normalizeFilepath(photo.filepath)
          return {
            ...photo,
            src: normalized,
            tags: Array.isArray(photo.tags) ? photo.tags : (photo.tags ? String(photo.tags).split(',') : ['Photography'])
          }
        })
      }
    } catch (error) {
      // Silently handle fetch errors
    } finally {
      loading.value = false
    }
  })

  // Cleanup on unmount
  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('wheel', onWheel as EventListener)
    window.removeEventListener('touchstart', onTouchStart as EventListener)
    window.removeEventListener('touchmove', onTouchMove as EventListener)
    unlockPageScroll()
    if (!lightboxOpen.value) document.body.style.overflow = ''

    window.removeEventListener('resize', recalcPhotoMetrics as EventListener)
    window.removeEventListener('scroll', updateCaptionOnScroll as EventListener)
    window.removeEventListener('scroll', resetLandingIfAtTop as EventListener)
  })
</script>

<style scoped>
  /* ============================================
   TYPOGRAPHY & GLOBAL STYLES
   ============================================ */

  /* Component-level reset for consistent spacing */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* Main page container - clean background for content focus */
  .page-container {
    position: relative;
    min-height: 100vh;
    overflow-x: hidden;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--font-body);
    transition: background-color 0.3s ease, color 0.3s ease;
    scroll-snap-type: y proximity;
  }

  /* While landing is active, hide main content but keep the photo section visible beneath */
  .page-container.landing-active .main-content {
    visibility: hidden;
  }

  .page-container.landing-active .landing-wrapper {
    visibility: visible;
    opacity: 1;
  }

  /* ============================================
   PHOTO SECTION - First visible content
   ============================================ */

  .photo-section {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: var(--bg-primary);
    scroll-snap-align: start;
  }

  .section-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  /* ============================================
   KINFOLK CAPTION OVERLAY
   ============================================ */

  .kinfolk-caption {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    will-change: transform, opacity;
    transform: translateY(20px);
    opacity: 0.95;
  }

  .kinfolk-caption-inner {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
    padding: 0 1rem;
    max-width: min(90vw, 1000px);
  }

  .kinfolk-eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-size: clamp(0.8rem, 1.6vw, 1rem);
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  }

  .kinfolk-headline {
    font-family: var(--font-heading);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    line-height: 1.04;
    font-size: clamp(2.5rem, 6.5vw, 5.25rem);
    color: #ffffff;
    -webkit-text-stroke: 0.35px rgba(0,0,0,0.35);
    text-shadow: 0 1px 2px rgba(0,0,0,0.65), 0 3px 28px rgba(0,0,0,0.5);
    position: relative;
    filter: contrast(1.1);
  }

  /* Grain overlay effect for kinfolk headline */
  .kinfolk-headline::before {
    content: '';
    position: absolute;
    inset: -10%;
    background-image: 
      url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' result='noise' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
    background-size: 100px 100px;
    pointer-events: none;
    mix-blend-mode: overlay;
  }

  /* ============================================
   LANDING WRAPPER - 100vh fixed overlay that slides on top
   ============================================ */

  .landing-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: var(--bg-primary);
    z-index: 100; /* Above everything */
    will-change: transform, filter;
    overflow: hidden;
    
    /* Scroll effect applied via JS */
    transform: translateY(0);
    filter: blur(0px);
    transition: none;
    scroll-snap-align: start;
  }

  /* ============================================
   LANDING SECTION - KINFOLK INSPIRED WITH PARALLAX
   ============================================ */

  .landing-section {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
    padding: 4rem 2rem;
  }

  .landing-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3rem;
    max-width: 900px;
    width: 100%;
    height: 100%;
    text-align: center;
  }

  .landing-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    width: 100%;
  }

  .landing-title {
    font-family: var(--font-heading);
    font-size: clamp(3.5rem, 8vw, 7rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.05;
    color: var(--text-primary);
    margin: 0;
  }

  .landing-subtitle {
    font-family: var(--font-body);
    font-size: clamp(1rem, 2vw, 1.5rem);
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .landing-description {
    font-family: var(--font-body);
    font-size: clamp(1.125rem, 2.2vw, 1.75rem);
    font-weight: 300;
    letter-spacing: 0.02em;
    line-height: 1.7;
    color: var(--text-secondary);
    max-width: 700px;
  }

  .landing-photo {
    width: 100%;
    max-width: 500px;
    height: 60vh;
    max-height: 700px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 2px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  }

  .landing-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  /* Mobile Responsive - Vertical Layout */
  @media (max-width: 768px) {
    .landing-grid {
      gap: 2rem;
      max-width: 100%;
      padding: 0;
    }

    .landing-title {
      font-size: clamp(2.5rem, 10vw, 4rem);
    }

    .landing-subtitle {
      font-size: clamp(0.875rem, 3vw, 1.125rem);
    }

    .landing-description {
      font-size: clamp(1rem, 4vw, 1.25rem);
      max-width: 90%;
    }

    .landing-photo {
      max-width: 90%;
      height: 50vh;
      max-height: 500px;
    }
  }

  /* Tablet - Adjust spacing */
  @media (max-width: 1024px) {
    .landing-grid {
      gap: 2.5rem;
      max-width: 700px;
    }

    .landing-photo {
      max-width: 400px;
      height: 55vh;
    }
  }

  /* Scroll Indicator */
  .scroll-indicator {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-secondary);
    animation: bounce 2s infinite;
  }

  .continue-btn {
    position: absolute;
    bottom: 5rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.85rem 1.6rem;
    border-radius: 999px;
    border: 1px solid var(--text-secondary);
    background: rgba(0,0,0,0.35);
    color: #fff;
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(6px);
  }

  .continue-btn:hover {
    background: rgba(0,0,0,0.55);
    transform: translateX(-50%) translateY(-1px);
  }

  .continue-btn:active {
    transform: translateX(-50%) translateY(0);
  }

  .scroll-arrow {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 1.5;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateX(-50%) translateY(0);
      opacity: 0.6;
    }
    50% {
      transform: translateX(-50%) translateY(8px);
      opacity: 0.3;
    }
  }

  /* ============================================
   MAIN CONTENT SECTION
   ============================================ */

  .main-content {
    position: relative;
    width: 100%;
    max-width: 80rem; /* 1280px - align with header/nav width */
    margin: 0 auto;
    padding: clamp(32px, 6vw, 64px) clamp(16px, 3vw, 32px) clamp(56px, 8vw, 96px);
    background: var(--bg-primary);
    z-index: 1;
    min-height: 100vh;
    scroll-snap-align: start;
  }

  /* Heading typography - uses Oswald for editorial impact */
  h1,
  h2,
  figcaption {
    font-family: var(--font-heading); /* Oswald font for strong headlines */
  }

  /* ============================================
   LAYOUT - MAIN CONTENT STRUCTURE
   ============================================ */

  /* Primary content wrapper - centers content with max-width constraint */
  .main-content {
    position: relative;
    z-index: 1;
    max-width: 80rem; /* 1280px - align with header/nav width */
    margin: 0 auto; /* Center alignment */
    padding: 0 clamp(16px, 3vw, 32px) clamp(56px, 8vw, 96px); /* Comfortable bottom padding */
  }

  /* ============================================
   ALBUMS CONTAINER
   ============================================ */

  .albums-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: clamp(40px, 6vw, 64px);
  }

  .album-section {
    width: 100%;
    scroll-snap-align: start; /* Snap to the start of each album section */
  }

  /* Load More Albums Section */
  .action-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 28px;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-primary);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px var(--shadow-color);
  }

  .action-btn:hover {
    background: var(--bg-secondary);
    border-color: var(--accent-primary);
    color: var(--accent-primary);
    box-shadow: 0 4px 16px var(--shadow-color);
    transform: translateY(-2px);
  }

  .action-btn:active {
    transform: translateY(0);
  }

  .btn-icon {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .load-more-albums-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-top: 60px;
    padding: 40px 0;
    border-top: 1px solid var(--border-color);
  }

  .load-more-albums {
    background: var(--accent-primary);
    color: #ffffff;
    border-color: var(--accent-primary);
    padding: 16px 40px;
    font-size: 1.05rem;
    font-weight: 600;
  }

  .load-more-albums:hover {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
  }

  .albums-count-text {
    font-size: 0.9rem;
    color: var(--text-secondary);
    text-align: center;
  }

  @media (max-width: 640px) {
    .load-more-albums {
      width: 90%;
    }
  }

  /* ============================================
   FULLSCREEN LIGHTBOX
   ============================================ */

  .lightbox-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px);
  }

  .lightbox-close {
    position: absolute;
    top: 24px;
    right: 24px;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10001;
    transition: all 0.3s ease;
  }

  .lightbox-close:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .close-icon {
    width: 24px;
    height: 24px;
    stroke: white;
    stroke-width: 2;
    stroke-linecap: round;
  }

  .lightbox-content {
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .lightbox-image {
    max-width: 100%;
    max-height: 85vh;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .lightbox-info {
    margin-top: 24px;
    text-align: center;
    color: white;
  }

  .lightbox-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .lightbox-description {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 56px;
    height: 56px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10001;
    transition: all 0.3s ease;
  }

  .lightbox-nav:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-50%) scale(1.1);
  }

  .lightbox-prev {
    left: 32px;
  }

  .lightbox-next {
    right: 32px;
  }

  .nav-arrow {
    width: 28px;
    height: 28px;
    stroke: white;
    stroke-width: 2;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .lightbox-counter {
    position: absolute;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    padding: 12px 24px;
    border-radius: 24px;
    color: white;
    font-size: 0.95rem;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  /* Lightbox transitions */
  .lightbox-fade-enter-active,
  .lightbox-fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .lightbox-fade-enter-from,
  .lightbox-fade-leave-to {
    opacity: 0;
  }

  @media (max-width: 768px) {
    .lightbox-close {
      top: 16px;
      right: 16px;
      width: 40px;
      height: 40px;
    }

    .close-icon {
      width: 20px;
      height: 20px;
    }

    .lightbox-nav {
      width: 44px;
      height: 44px;
    }

    .lightbox-prev {
      left: 16px;
    }

    .lightbox-next {
      right: 16px;
    }

    .nav-arrow {
      width: 20px;
      height: 20px;
    }

    .lightbox-image {
      max-height: 80vh;
    }

    .lightbox-counter {
      bottom: 20px;
      padding: 10px 20px;
      font-size: 0.85rem;
    }

    .lightbox-title {
      font-size: 1.2rem;
    }

    .lightbox-description {
      font-size: 0.9rem;
    }
  }

  /* ============================================
   INTRODUCTION SECTION
   ============================================ */

  /* Hero introduction block - sets context for page content */
  .intro {
    max-width: 56rem; /* 896px - optimal line length for readability */
    padding: clamp(40px, 8vw, 56px) 0; /* Increased padding for breathing room */
    margin-bottom: clamp(80px, 15vw, 120px); /* Increased separation */
    text-align: center; /* Center-align all intro text */
    margin-left: auto;
    margin-right: auto;
  }

  /* Eyebrow text - category or context label above headline */
  .eyebrow {
    text-transform: uppercase; /* All caps for label aesthetic */
    letter-spacing: 0.12em; /* Wider tracking for elegance */
    font-size: 0.875rem; /* 14px - subtle size */
    color: var(--accent-primary);
    font-weight: 600;
    transition: color 0.3s ease;
    text-align: center; /* Explicitly center */
  }

  /* Main headline - primary H1 for SEO and visual hierarchy */
  .headline {
    margin: 0.75rem 0; /* Vertical rhythm */
    font-size: clamp(2rem, 6vw, 3.25rem);
    font-weight: 500; /* Slightly stronger presence */
    letter-spacing: 0.04em;
    line-height: 1.1;
    color: var(--text-primary);
    transition: color 0.3s ease;
  }

  .lede {
    font-size: 1rem; /* 16px base */
    line-height: 1.6; /* Generous line height for readability */
    max-width: 48rem; /* 768px - optimal paragraph width */
    color: var(--text-secondary);
    transition: color 0.3s ease;
    text-align: center; /* Center the text */
    margin: 0 auto; /* Center the block */
  }

  /* Desktop lede text scaling */
  @media (min-width: 768px) {
    .lede {
      font-size: 1.15rem; /* Slightly larger for comfortable reading on large screens */
    }
  }

  /* Scroll indicator - visual cue for user interaction */
  .scroll-hint {
    margin-top: 1rem;
    font-size: 0.875rem; /* 14px - small subtle text */
    letter-spacing: 0.05em; /* Slight tracking */
    color: rgba(0, 0, 0, 0.6); /* Semi-transparent for subtlety */
  }

  /* ============================================
   BLOG LIST - PHOTO GALLERY FEED
   ============================================ */

  /* Gallery container - vertical stack with generous spacing */
  .blog-list {
    display: flex;
    flex-direction: column; /* Vertical stacking for editorial flow */
    gap: 5rem; /* 80px - luxurious spacing between posts (desktop) */
    align-items: center; /* Center articles horizontally */
  }

  /* Tablet spacing adjustment */
  @media (max-width: 1024px) {
    .blog-list {
      gap: 4rem; /* 64px - slightly tighter on medium screens */
    }
  }

  /* ============================================ */

  /* Single post container - semantic article element */
  .post {
    display: flex;
    width: 85%;
    justify-content: center;
    flex-direction: column; /* Stack image, meta, tags, and excerpt */
    gap: 1.25rem; /* 20px - consistent internal spacing */
    align-items: center; /* Center-align all post content */
    text-align: center; /* Center-align all post text */
    margin-left: auto; /* Center the post block itself */
    margin-right: auto;
  }

  /* Image container - provides aspect ratio and overlay positioning */
  .post-image-wrapper {
    position: relative; /* Establishes positioning context for overlay */
    overflow: hidden; /* Ensures clean edges */
    border-radius: 0.5rem; /* 8px - subtle rounded corners */
    margin-left: auto; /* Center wrapper */
    margin-right: auto;
    background: linear-gradient(
      135deg,
      rgba(200, 220, 255, 0.05),
      rgba(220, 210, 255, 0.05),
      rgba(200, 220, 255, 0.05)
    );
  }

  /* Main photo image - optimized for lazy loading and performance */
  .post-image {
    width: 100%; /* Full container width */
    height: auto; /* Maintain aspect ratio */
    aspect-ratio: 4/ 3; /* Cinematic 3:2 ratio for desktop */
    object-fit: cover; /* Crop to fill without distortion */
    display: block; /* Remove inline spacing */
    box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.4), inset 0 0 60px rgba(0, 0, 0, 0.5),
      inset 0 0 100px rgba(0, 0, 0, 0.4); /* Triple-layer inset shadow for deep recessed look */
  }

  /* Mobile image aspect ratio - taller format for portrait screens */
  @media (max-width: 768px) {
    .post-image {
      aspect-ratio: 4 / 3; /* Standard photo ratio for mobile */
    }
  }

  /* ============================================
   IMAGE OVERLAY - TITLE TREATMENT
   ============================================ */

  /* Centered title overlay on photo - creates magazine-style aesthetic */
  .post-title-overlay {
    position: absolute; /* Overlay positioning */
    inset: 0; /* Cover entire image area */
    display: flex;
    align-items: center; /* Vertical centering */
    justify-content: center; /* Horizontal centering */
    color: white; /* High contrast on dark overlay */
    font-size: 2.25rem; /* 36px mobile base */
    font-weight: bold; /* Strong visual impact */
    letter-spacing: 0.05em; /* Slight tracking for elegance */
    text-align: center;
    padding: 1.5rem; /* Breathing room from edges */
    z-index: 10; /* Above image, below controls */
    font-family: var(--font-heading); /* Oswald for editorial impact */
    background: rgba(0, 0, 0, 0.25); /* Dark semi-transparent overlay */
    opacity: 0.85; /* Slight transparency for sophistication */
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); /* Strong shadow for legibility */
  }

  /* Desktop title overlay - larger dramatic typography */
  @media (min-width: 768px) {
    .post-title-overlay {
      font-size: 3.75rem; /* 60px - bold statement on large screens */
    }
  }

  /* Mobile title overlay - optimized for small screens */
  @media (max-width: 768px) {
    .post-title-overlay {
      font-size: 1.875rem; /* 30px - readable on mobile */
    }
  }

  /* ============================================
   POST METADATA - DATE & LOCATION
   ============================================ */

  /* Metadata row - displays date and location inline */
  .post-meta {
    display: flex;
    gap: 0.5rem; /* 8px spacing between elements */
    align-items: center; /* Vertical alignment */
    font-size: 0.875rem; /* 14px - smaller supporting text */
    color: var(--text-secondary);
    justify-content: center; /* Center-align metadata */
    transition: color 0.3s ease;
  }

  /* Separator dot between date and location */
  .dot {
    opacity: 0.4; /* Subtle visual separator */
  }

  /* ============================================
   POST TAGS - CATEGORY LABELS
   ============================================ */

  /* Tag container - wrapping row for multiple tags */
  .post-tags {
    display: flex;
    flex-wrap: wrap; /* Allow tags to wrap to next line */
    gap: 0.5rem; /* 8px spacing between tags */
    justify-content: center; /* Center-align tags */
  }

  /* Individual tag pill - bordered rounded style */
  .tag {
    display: inline-block;
    padding: 0.35rem 0.85rem; /* Slightly more padding */
    font-size: 0.75rem; /* 12px - small label text */
    font-weight: 600; /* Semi-bold for emphasis */
    letter-spacing: 0.06em; /* Slightly more tracking */
    background-color: transparent;
    color: var(--accent-primary);
    border-radius: 9999px; /* Fully rounded pill shape */
    border: 1.5px solid var(--accent-primary);
    transition: all 0.3s ease;
  }

  .tag:hover {
    background-color: var(--accent-primary);
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(255, 107, 53, 0.25);
  }

  /* ============================================
   POST EXCERPT - DESCRIPTION TEXT
   ============================================ */

  /* Excerpt paragraph - summary or description of photo */
  .excerpt {
    font-size: 1rem; /* 16px base */
    line-height: 1.6; /* Comfortable reading line height */
    color: var(--text-secondary);
    max-width: 56rem; /* 896px - optimal paragraph width */
    text-align: center; /* Center-align excerpt text */
    margin-left: auto;
    margin-right: auto;
    transition: color 0.3s ease;
  }

  /* Desktop excerpt scaling */
  @media (min-width: 768px) {
    .excerpt {
      font-size: 1.125rem; /* 18px - larger on desktop */
    }
  }

  /* ============================================
   LOADING STATE
   ============================================ */

  /* Loading indicator - shown while fetching photos */
  .loading-container {
    text-align: center; /* Center loading message */
    padding: 3rem 0; /* Generous vertical padding */
    color: var(--text-muted);
    transition: color 0.3s ease;
  }

  /* ============================================
   RESPONSIVE ADJUSTMENTS
   ============================================ */

  /* Mobile padding adjustment for main content */
  @media (max-width: 768px) {
    .main-content {
      padding: 0 1.25rem 8rem; /* Slightly tighter horizontal padding */
    }

    .hero-section {
      min-height: 75vh;
      padding: 2rem 1.5rem;
    }
    
    .about-section,
    .portfolio-section,
    .contact-section {
      padding: 2.5rem 1.5rem;
    }
    
    .animated-background {
      animation-duration: 30s;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .animated-background {
      animation: none;
      background-position: 50% 50%;
    }
  }
</style>
