<template>
  <div class="slide-gallery">
    <div class="gallery-header">
      <h2 class="gallery-title">{{ title }}</h2>
      <p v-if="subtitle" class="gallery-subtitle">{{ subtitle }}</p>
    </div>

    <div class="carousel-container">
      <button
        v-if="canScrollLeft"
        class="nav-btn nav-btn-left"
        @click="scrollLeft"
        aria-label="Previous"
      >
        <svg viewBox="0 0 24 24" class="nav-icon">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div ref="carouselRef" class="carousel-track" @scroll="updateScrollButtons">
        <div
          v-for="(item, index) in items"
          :key="item.id || index"
          class="carousel-card"
          @click="$emit('card-click', item, index)"
        >
          <div class="card-image-wrapper">
            <video
              v-if="isVideo(item.image)"
              :src="item.image"
              class="card-image"
              muted
              loop
              playsinline
              :autoplay="isVideo(item.image)"
              @mouseenter="playVideo($event)"
              @mouseleave="pauseVideo($event)"
              loading="lazy"
            ></video>
            <img
              v-else
              :src="item.image"
              :alt="item.title || `Image ${index + 1}`"
              class="card-image"
              loading="lazy"
            />
          </div>
          <div v-if="item.title || item.description" class="card-content">
            <h3 v-if="item.title" class="card-title">{{ item.title }}</h3>
            <p v-if="item.description" class="card-description">{{ item.description }}</p>
          </div>
        </div>
      </div>

      <button
        v-if="canScrollRight"
        class="nav-btn nav-btn-right"
        @click="scrollRight"
        aria-label="Next"
      >
        <svg viewBox="0 0 24 24" class="nav-icon">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Pagination dots -->
    <div class="carousel-dots">
      <button
        v-for="(dot, index) in totalPages"
        :key="index"
        class="dot"
        :class="{ active: index === currentPage }"
        @click="scrollToPage(index)"
        :aria-label="`Go to page ${index + 1}`"
      ></button>
      <button
        v-if="autoPlay"
        class="play-btn"
        @click="toggleAutoPlay"
        :aria-label="isPlaying ? 'Pause' : 'Play'"
      >
        <svg v-if="!isPlaying" viewBox="0 0 24 24" class="play-icon">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <svg v-else viewBox="0 0 24 24" class="play-icon">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';

  interface GalleryItem {
    id?: string | number;
    image: string;
    title?: string;
    description?: string;
  }

  interface Props {
    items: GalleryItem[];
    title?: string;
    subtitle?: string;
    autoPlay?: boolean;
    autoPlayInterval?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    autoPlay: false,
    autoPlayInterval: 5000,
  });

  defineEmits<{
    'card-click': [item: GalleryItem, index: number];
  }>();

  // Helper function to check if file is a video
  const isVideo = (src: string) => {
    return /\.(mp4|webm|ogg|mov|avi)$/i.test(src);
  };

  // Video control functions
  const playVideo = (event: Event) => {
    const video = event.target as HTMLVideoElement;
    video.play().catch(() => {
      // Silently fail if autoplay is blocked
    });
  };

  const pauseVideo = (event: Event) => {
    const video = event.target as HTMLVideoElement;
    // Don't pause autoplay videos (first video in gallery)
    if (video.autoplay) return;
    video.pause();
  };

  // Ensure any video in the gallery plays on mount
  const ensureVideoPlays = () => {
    if (process.client) {
      // Wait a bit for DOM to be ready
      setTimeout(() => {
        const videos = document.querySelectorAll('.carousel-card video');
        videos.forEach((video) => {
          if (isVideo(video.src)) {
            video.play().catch(() => {
              // Silently fail if autoplay is blocked
            });
          }
        });
      }, 100);
    }
  };

  const carouselRef = ref<HTMLElement | null>(null);
  const canScrollLeft = ref(false);
  const canScrollRight = ref(true);
  const currentPage = ref(0);
  const isPlaying = ref(props.autoPlay);
  const perPage = ref(2);
  let autoPlayTimer: NodeJS.Timeout | null = null;

  const centeredCardIndex = ref(0);

  const isCenteredCard = (index: number) => {
    return index === centeredCardIndex.value;
  };

  const totalPages = computed(() => Math.max(1, Math.ceil(props.items.length / perPage.value)));

  const getGap = () => (window.matchMedia('(max-width: 768px)').matches ? 24 : 40);

  const isNarrow = () => window.matchMedia('(max-width: 864px)').matches;

  const updatePerPage = () => {
    perPage.value = isNarrow() ? 1 : 2;
  };

  const centerCard = (index: number, smooth = false) => {
    if (!carouselRef.value) return;
    const cardWidth = carouselRef.value.querySelector('.carousel-card')?.clientWidth || 800;
    const clientWidth = carouselRef.value.clientWidth;
    const padding = Math.max((clientWidth - cardWidth) / 2, 0);
    const gap = getGap();
    const left = padding + index * (cardWidth + gap);
    carouselRef.value.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
  };

  const updateScrollButtons = () => {
    if (!carouselRef.value) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.value;
    canScrollLeft.value = scrollLeft > 10;
    canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 10;
    updateCenteredCard();
  };

  const updateCenteredCard = () => {
    const track = carouselRef.value;
    if (!track) return;
    const cards = Array.from(track.querySelectorAll('.carousel-card')) as HTMLElement[];
    if (!cards.length) return;
    const containerRect = track.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    centeredCardIndex.value = closestIndex;
    // Update current page based on centered card index
    currentPage.value = Math.floor(closestIndex / perPage.value);
  };

  const scrollLeft = () => {
    if (!carouselRef.value) return;
    const cardWidth = carouselRef.value.querySelector('.carousel-card')?.clientWidth || 800;
    const gap = getGap();
    carouselRef.value.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!carouselRef.value) return;
    const cardWidth = carouselRef.value.querySelector('.carousel-card')?.clientWidth || 800;
    const gap = getGap();
    carouselRef.value.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
  };

  const scrollToPage = (page: number) => {
    currentPage.value = page;
    centerCard(page * perPage.value, true);
  };

  const toggleAutoPlay = () => {
    isPlaying.value = !isPlaying.value;
    if (isPlaying.value) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
  };

  const startAutoPlay = () => {
    if (!props.autoPlay) return;
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      if (canScrollRight.value) {
        scrollRight();
      } else {
        scrollToPage(0);
      }
    }, props.autoPlayInterval);
  };

  const stopAutoPlay = () => {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  };

  onMounted(() => {
    if (process.client) {
      updatePerPage();
      window.addEventListener('resize', updatePerPage);
    }
    centerCard(0);
    updateScrollButtons();
    ensureVideoPlays(); // Ensure videos play
    if (props.autoPlay && isPlaying.value) {
      startAutoPlay();
    }
  });

  onUnmounted(() => {
    if (process.client) {
      window.removeEventListener('resize', updatePerPage);
    }
    stopAutoPlay();
  });
</script>

<style scoped>
  .slide-gallery {
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    padding: 60px 40px;
  }

  .gallery-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 0;
  }

  .gallery-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
    letter-spacing: -0.02em;
  }

  .gallery-subtitle {
    font-size: 1.2rem;
    color: var(--text-secondary);
    font-weight: 400;
  }

  .carousel-container {
    position: relative;
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    overflow: hidden;
  }

  .carousel-track {
    display: flex;
    gap: 40px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding-left: clamp(16px, (100% - 800px) / 2, 320px);
    padding-right: clamp(16px, (100% - 800px) / 2, 320px);
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .carousel-track::-webkit-scrollbar {
    display: none;
  }

  .carousel-card {
    flex: 0 0 auto;
    width: 800px;
    height: 900px;
    background: var(--bg-primary);
    overflow: hidden;
    cursor: pointer;
    scroll-snap-align: center;
    transition: transform 1.2s cubic-bezier(0.22, 0.1, 0.08, 0.99), box-shadow 1.2s ease;
    box-shadow: 0 4px 20px var(--shadow-color, rgba(0, 0, 0, 0.12));
    border-radius: 8px;
    position: relative;
  }

  /* Simple hover effect for all cards (no shading) */
  .carousel-card:hover {
    transform: scale(1.02);
    box-shadow: 0 12px 32px var(--shadow-color, rgba(0, 0, 0, 0.2));
  }

  /* Ensure centered card sits above siblings, but without shading effects */
  .carousel-card.is-centered {
    z-index: 5;
  }

  .card-image-wrapper {
    width: 100%;
    height: 900px;
    overflow: hidden;
    background: var(--bg-secondary);
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1.5s cubic-bezier(0.22, 0.1, 0.08, 0.99);
  }

  /* Gentle zoom on hover for all cards */
  .carousel-card:hover .card-image {
    transform: scale(1.05);
  }

  .card-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 24px;
    text-align: center;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  }

  .card-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: white;
    margin-bottom: 8px;
  }

  .card-description {
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  /* Navigation buttons */
  .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 56px;
    height: 56px;
    background: rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.16);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.25s ease;
    backdrop-filter: blur(4px);
  }

  .nav-btn:hover {
    transform: translateY(-50%) scale(1.05);
    background: rgba(0, 0, 0, 0.18);
    border-color: rgba(0, 0, 0, 0.22);
  }

  .nav-btn-left {
    left: -18px;
  }

  .nav-btn-right {
    right: -18px;
  }

  .nav-icon {
    width: 22px;
    height: 22px;
    stroke: #ffffff;
    stroke-width: 2.5;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* Pagination dots */
  .carousel-dots {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-top: 32px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 0;
    background: var(--text-secondary);
    opacity: 0.3;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
  }

  .dot.active {
    width: 32px;
    height: 8px;
    border-radius: 0;
    opacity: 1;
    background: var(--text-primary);
  }

  .dot:hover:not(.active) {
    opacity: 0.6;
  }

  .play-btn {
    width: 32px;
    height: 32px;
    border-radius: 0;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-left: 8px;
    transition: all 0.3s ease;
  }

  .play-btn:hover {
    background: var(--bg-secondary);
  }

  .play-icon {
    width: 12px;
    height: 12px;
    fill: var(--text-primary);
  }

  /* Responsive */
  @media (max-width: 1400px) {
    .carousel-card {
      width: 650px;
    }

    .card-image-wrapper {
      height: 750px;
    }
  }

  @media (max-width: 1024px) {
    .carousel-card {
      width: 550px;
    }

    .card-image-wrapper {
      height: 650px;
    }
  }

  @media (max-width: 768px) {
    .slide-gallery {
      padding: 40px 20px;
    }

    .gallery-title {
      font-size: 2rem;
    }

    .carousel-card {
      width: min(90vw, 420px);
    }

    .card-image-wrapper {
      height: 500px;
    }

    .carousel-track {
      gap: 24px;
      padding-left: max(16px, (100% - min(90vw, 420px)) / 2);
      padding-right: max(16px, (100% - min(90vw, 420px)) / 2);
    }

    .nav-btn {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .carousel-card {
      width: min(92vw, 360px);
    }

    .card-image-wrapper {
      height: 420px;
    }

    .card-content {
      padding: 16px;
    }

    .card-title {
      font-size: 1.1rem;
    }

    .card-description {
      font-size: 0.85rem;
    }
  }
</style>
