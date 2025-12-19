<template>
  <!-- SEO: Main page container with semantic HTML structure -->
  <div class="page-container" itemscope itemtype="https://schema.org/CollectionPage">
    <!-- SEO: Main content area for better accessibility and crawling -->
    <main class="main-content" role="main">
      <!-- SEO: Introduction section with primary keywords and page context -->
      <section class="intro" aria-labelledby="main-headline">
        <p class="eyebrow">{{ $t('index.eyebrow') }}</p>
        <h1 id="main-headline" class="headline" itemprop="name">{{ $t('index.headline') }}</h1>
        <p class="lede" itemprop="description">{{ $t('index.payoff') }}</p>
        <!-- SEO: Visual scroll indicator for user engagement -->
        <!-- <div class="scroll-hint" aria-hidden="true">scroll ⬇</div> -->
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
            @card-click="(item, index) => openLightbox(album.allPhotos, index)"
          />
        </div>
        
        <!-- Load More Albums Button - Only after 5 albums -->
        <div v-if="hasMoreAlbums" class="load-more-albums-container">
          <button @click="loadMoreAlbums" class="action-btn load-more-albums">
            <span>{{ $t('index.loadMoreAlbums') }}</span>
            <svg viewBox="0 0 24 24" class="btn-icon">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <p class="albums-count-text">{{ $t('index.showingAlbums', { current: albums.length, total: allAlbums.length }) }}</p>
        </div>
        <!-- Detailed Copyright Notice -->
        <CopyrightNotice />
      </div>
    </main>
    
    <!-- Fullscreen Lightbox -->
    <Transition name="lightbox-fade">
      <div v-if="lightboxOpen" class="lightbox-overlay" @click="closeLightbox">
        <button class="lightbox-close" @click="closeLightbox" aria-label="Close">
          <svg viewBox="0 0 24 24" class="close-icon">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        
        <button 
          v-if="currentImageIndex > 0"
          class="lightbox-nav lightbox-prev" 
          @click.stop="prevImage"
          aria-label="Previous"
        >
          <svg viewBox="0 0 24 24" class="nav-arrow">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        
        <div class="lightbox-content" @click.stop>
          <img 
            :src="lightboxImages[currentImageIndex]?.image" 
            :alt="lightboxImages[currentImageIndex]?.title || 'Photo'"
            class="lightbox-image"
          />
          <div v-if="lightboxImages[currentImageIndex]?.title" class="lightbox-info">
            <h3 class="lightbox-title">{{ lightboxImages[currentImageIndex].title }}</h3>
            <p v-if="lightboxImages[currentImageIndex]?.description" class="lightbox-description">
              {{ lightboxImages[currentImageIndex].description }}
            </p>
          </div>
        </div>
        
        <button 
          v-if="currentImageIndex < lightboxImages.length - 1"
          class="lightbox-nav lightbox-next" 
          @click.stop="nextImage"
          aria-label="Next"
        >
          <svg viewBox="0 0 24 24" class="nav-arrow">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        
        <div class="lightbox-counter">
          {{ currentImageIndex + 1 }} / {{ lightboxImages.length }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// SEO: Page-specific meta tags for photography portfolio
useHead({
  title: ' danibanoi Photography  ',
  meta: [
    { name: 'description', content: 'Fotografo professionista a Verona, Italia. Travel e documentary photography da Valpolicella, Lago di Garda. Ritratti, street photography e progetti personali.' },
    { name: 'keywords', content: 'fotografo Verona, photography Valpolicella, Lago di Garda photographer, travel photography Italia, Dani Banoi' },
    { property: 'og:title', content: 'Dani Banoi Photography | Verona, Valpolicella, Lago di Garda' },
    { property: 'og:description', content: 'Fotografo professionista a Verona. Travel e documentary photography da Valpolicella e Lago di Garda.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'it_IT' },
    { name: 'geo.region', content: 'IT-VR' },
    { name: 'geo.placename', content: 'Verona' },
    { name: 'twitter:title', content: 'Dani Banoi Photography | Verona, Italia' },
    { name: 'twitter:description', content: 'Travel e documentary photography da Verona, Valpolicella, Lago di Garda.' }
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' }
  ]
})

// Posts feed loaded from API
const posts = ref<any[]>([])
const loading = ref(true)
const visibleAlbumsCount = ref(5)
const currentYear = new Date().getFullYear()

// Group photos by album (session_slug)
const allAlbums = computed(() => {
  const albumsMap = new Map()
  
  // Group all photos by session_slug
  posts.value.forEach((post) => {
    const slug = post.session_slug
    if (!albumsMap.has(slug)) {
      albumsMap.set(slug, {
        slug: slug,
        title: post.title,
        location: post.location,
        date: post.date,
        photos: []
      })
    }
    albumsMap.get(slug).photos.push({
      id: post.src,
      image: post.src,
      title: post.title,
      description: post.excerpt
    })
  })
  
  // Convert to array with all photos
  return Array.from(albumsMap.values()).map(album => ({
    ...album,
    allPhotos: album.photos,
    totalPhotos: album.photos.length
  }))
})

// Visible albums (limited to visibleAlbumsCount)
const albums = computed(() => {
  return allAlbums.value.slice(0, visibleAlbumsCount.value)
})

// Check if there are more albums to load
const hasMoreAlbums = computed(() => {
  return allAlbums.value.length > visibleAlbumsCount.value
})

// Load more albums
const loadMoreAlbums = () => {
  visibleAlbumsCount.value += 5
}

// Lightbox state
const lightboxOpen = ref(false)
const lightboxImages = ref<any[]>([])
const currentImageIndex = ref(0)

// Open lightbox with album photos
const openLightbox = (photos: any[], index: number) => {
  lightboxImages.value = photos
  currentImageIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

// Close lightbox
const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}

// Navigate lightbox
const nextImage = () => {
  if (currentImageIndex.value < lightboxImages.value.length - 1) {
    currentImageIndex.value++
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (!lightboxOpen.value) return
  
  if (e.key === 'Escape') closeLightbox()
  else if (e.key === 'ArrowRight') nextImage()
  else if (e.key === 'ArrowLeft') prevImage()
}

// SEO: Fetch and display published photos on mount
onMounted(async () => {
  // Add keyboard event listener
  window.addEventListener('keydown', handleKeydown)
  
  // Track page visit for analytics
  try {
    await $fetch('/api/analytics/track', {
      method: 'POST',
      body: {
        page: window.location.pathname
      }
    })
  } catch (error) {
    // Silent fail - analytics tracking shouldn't block page load
    console.debug('Analytics tracking failed:', error)
  }
  
  try {
    const response = await $fetch('/api/photos?published=true')
    if (response.success && Array.isArray(response.photos)) {
      // Map API response to post format with SEO-friendly data structure
      posts.value = response.photos.map((photo: any) => ({
        src: photo.filepath,
        title: photo.title,
        session_slug: photo.session_slug,
        location: photo.location || 'Studio',
        date: photo.date_taken || '2025 · Personal',
        excerpt: photo.excerpt || 'Photography from the collection',
        tags: photo.tags && Array.isArray(photo.tags) ? photo.tags : ['Photography']
      }))
    }
  } catch (error) {
    console.error('Failed to load photos:', error)
  } finally {
    loading.value = false
  }
})

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
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
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: 1.5rem; /* Responsive padding for mobile-first approach */
  font-family: var(--font-body); /* Roboto body font for clean readability */
  transition: background-color 0.3s ease, color 0.3s ease;
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
  
  max-width: 120rem; /* 1920px - optimal reading width for large screens */
  margin: 0 auto; /* Center alignment */
  padding: 0 1.5rem 8rem; /* Generous bottom padding for scroll comfort */
}

/* ============================================
   ALBUMS CONTAINER
   ============================================ */

.albums-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 80px;
}

.album-section {
  width: 100%;
}

/* Load More Albums Section */
.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--shadow-color, rgba(0, 0, 0, 0.08));
}

.action-btn:hover {
  background: var(--bg-secondary);
  box-shadow: 0 4px 12px var(--shadow-color, rgba(0, 0, 0, 0.12));
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
  background: var(--text-primary);
  color: var(--bg-primary);
  border-color: var(--text-primary);
  padding: 16px 40px;
  font-size: 1.05rem;
}

.load-more-albums:hover {
  opacity: 0.9;
  background: var(--text-primary);
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
  padding: 1.25rem 0;
  margin-bottom: 5rem; /* Clear separation from content below */
  text-align: center; /* Center-align all intro text */
  margin-left: auto;
  margin-right: auto;
}

/* Eyebrow text - category or context label above headline */
.eyebrow {
  text-transform: uppercase; /* All caps for label aesthetic */
  letter-spacing: 0.08em; /* Wide tracking for elegance */
  font-size: 0.875rem; /* 14px - subtle size */
  color: var(--text-muted);
  transition: color 0.3s ease;
}

/* Main headline - primary H1 for SEO and visual hierarchy */
.headline {
  margin: 0.75rem 0; /* Vertical rhythm */
  font-size: 2.25rem; /* 36px base - mobile-first */
  font-weight: 400; /* Regular weight for Oswald elegance */
  color: var(--text-primary);
  transition: color 0.3s ease;
}

/* Tablet and desktop headline scaling */
@media (min-width: 768px) {
  .headline {
    font-size: 3rem; /* 48px - larger impact on bigger screens */
  }
}

/* Lead paragraph - introductory copy below headline */
.lede {
  display: flex;
  justify-content: center;
  font-size: 1rem; /* 16px base */
  line-height: 1.6; /* Generous line height for readability */
  max-width: 48rem; /* 768px - optimal paragraph width */
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

/* Desktop lede text scaling */
@media (min-width: 768px) {
  .lede {

    font-size: 1.125rem; /* 18px - more comfortable reading on large screens */
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

/* Mobile spacing adjustment */
@media (max-width: 768px) {
  .blog-list {
    gap: 3rem; /* 48px - compact spacing for mobile */
  }
}

/* ============================================
   POST CARD - INDIVIDUAL PHOTO ARTICLE
   ============================================ */

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
  background: linear-gradient(135deg, 
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
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.4), inset 0 0 60px rgba(0, 0, 0, 0.5), inset 0 0 100px rgba(0, 0, 0, 0.4); /* Triple-layer inset shadow for deep recessed look */
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
  padding: 0.25rem 0.75rem; /* 4px vertical, 12px horizontal */
  font-size: 0.75rem; /* 12px - small label text */
  font-weight: 600; /* Semi-bold for emphasis */
  letter-spacing: 0.05em; /* Slight tracking */
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 9999px; /* Fully rounded pill shape */
  border: 1px solid var(--border-color);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
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
}
</style>
