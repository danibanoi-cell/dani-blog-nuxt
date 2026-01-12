<template>
  <div class="page-container">
    <main class="main-content" role="main">
      <section v-if="sessionTitle" class="intro">
        <p class="eyebrow">Session</p>
        <h1 class="headline">{{ sessionTitle }}</h1>
      </section>

      <section v-if="loading" class="loading-container" role="status" aria-live="polite">
        <p>Loading session...</p>
      </section>

      <section v-else>
        <div v-if="photos.length === 0" class="loading-container">
          <p>No photos found for this session.</p>
        </div>
        <div v-else class="masonry-grid">
          <div
            v-for="(p, idx) in shuffledPhotos"
            :key="idx"
            class="masonry-item"
            @click="openFullscreen(idx)"
          >
            <img :src="p.filepath" :alt="'Session photo'" loading="lazy" />
          </div>
        </div>
      </section>
    </main>

    <!-- Fullscreen lightbox -->
    <Transition name="lightbox">
      <div v-if="fullscreenIndex !== null" class="lightbox" @click="closeFullscreen">
        <button class="lightbox-prev" aria-label="Previous" @click.stop="prevPhoto">‹</button>
        <button class="lightbox-next" aria-label="Next" @click.stop="nextPhoto">›</button>
        <img
          :src="shuffledPhotos[fullscreenIndex]?.filepath"
          :alt="'Fullscreen photo'"
          class="lightbox-image"
          @click.stop
        />
      </div>
    </Transition>

    <!-- Close button outside lightbox -->
    <Transition name="lightbox">
      <button
        v-if="fullscreenIndex !== null"
        class="lightbox-close-outside"
        aria-label="Close gallery"
        @click="closeFullscreen"
      >
        ×
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  // Normalize filepaths returned from the API to web-accessible paths
  const normalizeFilepath = (fp?: string) => {
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
    const parts = cleaned.split('/').filter(Boolean)
    return parts.length ? `/${parts[parts.length - 1]}` : cleaned
  }

  const route = useRoute();
  const slug = route.params.slug as string;
  const photos = ref<any[]>([]);
  const shuffledPhotos = ref<any[]>([]);
  const loading = ref(true);
  const sessionTitle = ref('');
  const fullscreenIndex = ref<number | null>(null);

  // Shuffle array
  const shuffle = (array: any[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const openFullscreen = (idx: number) => {
    fullscreenIndex.value = idx;
    document.body.style.overflow = 'hidden';
  };

  const closeFullscreen = () => {
    fullscreenIndex.value = null;
    document.body.style.overflow = '';
  };

  const nextPhoto = () => {
    if (fullscreenIndex.value !== null && shuffledPhotos.value.length > 0) {
      fullscreenIndex.value = (fullscreenIndex.value + 1) % shuffledPhotos.value.length;
    }
  };

  const prevPhoto = () => {
    if (fullscreenIndex.value !== null && shuffledPhotos.value.length > 0) {
      fullscreenIndex.value =
        (fullscreenIndex.value - 1 + shuffledPhotos.value.length) % shuffledPhotos.value.length;
    }
  };

  onMounted(async () => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (fullscreenIndex.value === null) return;
      if (e.key === 'Escape') closeFullscreen();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };

    window.addEventListener('keydown', handleKeydown);

    try {
      const res = await $fetch(`/api/sessions/${slug}`);
      if (res.success) {
        photos.value = (res.photos || []).map((p: any) => ({ ...p, filepath: normalizeFilepath(p.filepath) }));
        shuffledPhotos.value = shuffle(photos.value);

        sessionTitle.value = slug.replace(/-/g, ' ');
        if (photos.value.length > 0) {
          const first = photos.value[0];
          sessionTitle.value = first.session_slug || first.category || sessionTitle.value;
        }
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    } finally {
      loading.value = false;
    }

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
    });
  });
</script>

<style scoped>
  .page-container {
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }

  .main-content {
    max-width: 120rem;
    margin: 0 auto;
    padding: 0 1.5rem 6rem;
  }

  .intro {
    text-align: center;
    padding: 1.25rem 0;
    margin: 2rem auto 3rem;
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .headline {
    margin: 0.75rem 0;
    font-size: 2.25rem;
    font-family: var(--font-heading);
    font-weight: 400;
  }

  .loading-container {
    text-align: center;
    padding: 3rem 0;
    color: var(--text-muted);
  }

  /* Dynamic pattern grid layout */
  .masonry-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 3rem;
    padding: 2rem 0;
  }

  .masonry-item {
    cursor: pointer;
    transition: transform 0.3s ease, opacity 0.3s ease;
    position: relative;
  }

  .masonry-item:hover {
    transform: scale(1.03);
    opacity: 0.95;
    z-index: 10;
  }

  .masonry-item img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    border-radius: 0.5rem;
  }

  /* Creative pattern layouts - cycles through different patterns */
  .masonry-item:nth-child(12n + 1) {
    grid-column: span 7;
    grid-row: span 2;
  }

  .masonry-item:nth-child(12n + 2) {
    grid-column: span 5;
    grid-row: span 1;
  }

  .masonry-item:nth-child(12n + 3) {
    grid-column: span 5;
    grid-row: span 1;
  }

  .masonry-item:nth-child(12n + 4) {
    grid-column: span 4;
    grid-row: span 2;
  }

  .masonry-item:nth-child(12n + 5) {
    grid-column: span 4;
    grid-row: span 1;
  }

  .masonry-item:nth-child(12n + 6) {
    grid-column: span 4;
    grid-row: span 1;
  }

  .masonry-item:nth-child(12n + 7) {
    grid-column: span 6;
    grid-row: span 1;
  }

  .masonry-item:nth-child(12n + 8) {
    grid-column: span 6;
    grid-row: span 2;
  }

  .masonry-item:nth-child(12n + 9) {
    grid-column: span 4;
    grid-row: span 1;
  }

  .masonry-item:nth-child(12n + 10) {
    grid-column: span 4;
    grid-row: span 1;
  }

  .masonry-item:nth-child(12n + 11) {
    grid-column: span 4;
    grid-row: span 1;
  }

  .masonry-item:nth-child(12n + 12) {
    grid-column: span 12;
    grid-row: span 1;
  }

  /* Lightbox fullscreen */
  .lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .lightbox-image {
    max-width: 90vw;
    max-height: 90vh;
    width: auto;
    height: auto;
    object-fit: contain;
    cursor: default;
    animation: zoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes zoomIn {
    from {
      transform: scale(0.7);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .lightbox-close,
  .lightbox-prev,
  .lightbox-next {
    position: fixed;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 2rem;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    backdrop-filter: blur(10px);
    z-index: 10000;
  }

  .lightbox-close:hover,
  .lightbox-prev:hover,
  .lightbox-next:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .lightbox-close {
    top: 2rem;
    right: 2rem;
    font-size: 2.5rem;
    line-height: 1;
  }

  .lightbox-prev {
    left: 2rem;
    top: 50%;
    transform: translateY(-50%);
  }

  .lightbox-next {
    right: 2rem;
    top: 50%;
    transform: translateY(-50%);
  }

  .lightbox-prev:hover {
    transform: translateY(-50%) scale(1.1);
  }

  .lightbox-next:hover {
    transform: translateY(-50%) scale(1.1);
  }

  /* Close button outside lightbox */
  .lightbox-close-outside {
    position: fixed;
    top: 1rem;
    right: 1rem;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    font-size: 2.5rem;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    backdrop-filter: blur(10px);
    z-index: 10001;
    line-height: 1;
  }

  .lightbox-close-outside:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
    border-color: rgba(255, 255, 255, 0.5);
  }
  .lightbox-enter-active,
  .lightbox-leave-active {
    transition: opacity 0.4s ease;
  }

  .lightbox-enter-from,
  .lightbox-leave-to {
    opacity: 0;
  }

  /* Responsive grid */
  @media (min-width: 768px) {
    .headline {
      font-size: 3rem;
    }

    .masonry-grid {
      gap: 4rem;
    }
  }

  @media (max-width: 1024px) {
    .masonry-grid {
      grid-template-columns: repeat(6, 1fr);
      gap: 2rem;
    }

    /* Simplified pattern for tablets */
    .masonry-item:nth-child(6n + 1) {
      grid-column: span 4;
      grid-row: span 2;
    }

    .masonry-item:nth-child(6n + 2) {
      grid-column: span 2;
      grid-row: span 1;
    }

    .masonry-item:nth-child(6n + 3) {
      grid-column: span 2;
      grid-row: span 1;
    }

    .masonry-item:nth-child(6n + 4) {
      grid-column: span 3;
      grid-row: span 1;
    }

    .masonry-item:nth-child(6n + 5) {
      grid-column: span 3;
      grid-row: span 1;
    }

    .masonry-item:nth-child(6n + 6) {
      grid-column: span 6;
      grid-row: span 1;
    }
  }

  @media (max-width: 640px) {
    .masonry-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    /* Single column for mobile */
    .masonry-item {
      grid-column: span 1 !important;
      grid-row: span 1 !important;
    }

    .masonry-item img {
      height: auto;
      aspect-ratio: auto;
    }

    .lightbox-close {
      top: 1rem;
      right: 1rem;
      width: 2.5rem;
      height: 2.5rem;
      font-size: 2rem;
    }

    .lightbox-prev,
    .lightbox-next {
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1.5rem;
    }

    .lightbox-prev {
      left: 1rem;
    }

    .lightbox-next {
      right: 1rem;
    }
  }
</style>
