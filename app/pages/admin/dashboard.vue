<template>
  <div class="dashboard-shell text-white">
    <div class="bg-layer" aria-hidden="true"></div>
    <div class="glow-layer" aria-hidden="true"></div>
    <div class="content-shell">
      <!-- Header -->
      <header class="header-bar">
        <div class="flex items-center justify-between">
          <h1 class="font-display text-3xl ">Dashboard</h1>
          <button
            @click="handleLogout"
            class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm border border-white/20"
          >
            Logout
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div class="tab-switch">
          <button
            :class="['tab-btn', activeTab === 'upload' ? 'tab-active' : '']"
            @click="activeTab = 'upload'"
          >
            Upload New Photo
          </button>
          <button
            :class="['tab-btn', activeTab === 'existing' ? 'tab-active' : '']"
            @click="activeTab = 'existing'"
          >
            Existing Photos
          </button>
          <button
            :class="['tab-btn', activeTab === 'stats' ? 'tab-active' : '']"
            @click="activeTab = 'stats'"
          >
            Statistiche
          </button>
        </div>

        <Transition name="fade-slide" mode="out-in">
          <div v-if="activeTab === 'home'" key="home" class="panel text-center py-10">
            <h2 class="text-2xl font-semibold mb-2">Benvenuto</h2>
            <p class="text-gray-300">Seleziona una sezione sopra per iniziare.</p>
          </div>
          <div v-else-if="activeTab === 'upload'" key="upload" class="panel">
            <h2 class="text-xl font-semibold mb-4">Upload New Photo</h2>
            
            <form @submit.prevent="handleUpload" class="space-y-4">
              <div v-if="uploadError" class="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded">
                {{ uploadError }}
              </div>

              <div v-if="uploadSuccess" class="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded">
                {{ uploadSuccess }}
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Title *</label>
                  <input
                    v-model="newPhoto.title"
                    required
                    type="text"
                    class="input-field"
                    placeholder="Evening Practice"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1">Location</label>
                  <input
                    v-model="newPhoto.location"
                    type="text"
                    class="input-field"
                    placeholder="Lisbon"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1">Category</label>
                  <input
                    v-model="newPhoto.category"
                    type="text"
                    class="input-field"
                    placeholder="Personal"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1">Session (folder)</label>
                  <input
                    v-model="newPhoto.session_slug"
                    type="text"
                    class="input-field"
                    placeholder="e.g. alice-portrait, lisbon-2025"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1">Date Taken</label>
                  <input
                    v-model="newPhoto.date_taken"
                    type="date"
                    class="input-field"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Excerpt</label>
                <textarea
                  v-model="newPhoto.excerpt"
                  rows="3"
                  class="input-field"
                  placeholder="A brief description..."
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <input
                  v-model="tagsInput"
                  type="text"
                  class="input-field"
                  placeholder="Basketball, Night, Urban, Sports"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Photo File *</label>
                <input
                  ref="fileInput"
                  type="file"
                  required
                  accept="image/*"
                  class="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-white/20 file:bg-white/10 file:text-white hover:file:bg-white/20"
                />
              </div>

              <div class="flex items-center">
                <input
                  v-model="newPhoto.published"
                  type="checkbox"
                  id="published"
                  class="w-4 h-4 text-white bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-white/20"
                />
                <label for="published" class="ml-2 text-sm">Publish immediately</label>
              </div>

              <button
                type="submit"
                :disabled="uploading"
                class="w-full md:w-auto px-6 py-3 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed btn-solid"
              >
                <span v-if="uploading">Uploading...</span>
                <span v-else>Upload Photo</span>
              </button>
            </form>
          </div>
          <div v-else-if="activeTab === 'existing'" key="existing" class="panel">
            <h2 class="text-xl font-semibold mb-4">Existing Photos</h2>
            
            <div v-if="loading" class="text-center py-8 text-gray-400">
              Loading photos...
            </div>

            <div v-else-if="photos.length === 0" class="text-center py-8 text-gray-400">
              No photos found. Upload your first photo above!
            </div>

            <div v-else>
              <div
                v-for="album in limitedAlbums"
                :key="album.slug"
                class="mb-8"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <img v-if="album.cover" :src="album.cover" alt="cover" class="w-10 h-10 object-cover rounded" />
                    <h3 class="text-lg font-semibold">{{ album.title }}</h3>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-xs text-gray-400">{{ album.count }} foto</span>
                    <button
                      class="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 border border-white/20 rounded transition"
                      @click="toggleAlbum(album.slug)"
                    >
                      {{ expandedAlbums[album.slug] ? 'Mostra recenti' : 'Mostra tutte' }}
                    </button>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div
                    v-for="photo in (expandedAlbums[album.slug] ? album.items : album.recentItems)"
                    :key="photo.id"
                    class="bg-white/5 border border-white/10 rounded-lg overflow-hidden backdrop-blur-sm"
                  >
                    <img
                      :src="photo.filepath"
                      :alt="photo.title"
                      class="w-full h-48 object-cover"
                    />
                    <div class="p-4">
                      <h3 class="font-semibold mb-1">{{ photo.title }}</h3>
                      <p class="text-sm text-gray-400 mb-1">{{ photo.location }}</p>
                      <p class="text-xs text-gray-400 mb-2">Uploaded: {{ formatDate(photo.created_at || photo.updated_at) }}</p>
                      <div class="flex flex-wrap gap-1 mb-3">
                        <span
                          v-for="tag in photo.tags"
                          :key="tag"
                          class="text-xs px-2 py-1 bg-white/10 border border-white/20 rounded"
                        >
                          {{ tag }}
                        </span>
                      </div>
                      <button
                        @click="deletePhoto(photo.id)"
                        class="w-full px-3 py-2 text-sm transition btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="activeTab === 'stats'" key="stats" class="panel">
            <h2 class="text-xl font-semibold mb-4">Statistiche del Sito</h2>
            
            <div v-if="statsLoading" class="text-center py-8 text-gray-400">
              Caricamento statistiche...
            </div>
            
            <div v-else class="stats-grid">
              <!-- Total Visits Card -->
              <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                  <h3 class="stat-label">Visite Totali</h3>
                  <p class="stat-value">{{ stats.totalVisits || 0 }}</p>
                  <p class="stat-meta">Ultimo mese</p>
                </div>
              </div>
              
              <!-- Unique Visitors Card -->
              <div class="stat-card">
                <div class="stat-icon">🌍</div>
                <div class="stat-content">
                  <h3 class="stat-label">Visitatori Unici</h3>
                  <p class="stat-value">{{ stats.uniqueVisitors || 0 }}</p>
                  <p class="stat-meta">IP distinti</p>
                </div>
              </div>
              
              <!-- Page Views Card -->
              <div class="stat-card">
                <div class="stat-icon">📄</div>
                <div class="stat-content">
                  <h3 class="stat-label">Pagine Viste</h3>
                  <p class="stat-value">{{ stats.pageViews || 0 }}</p>
                  <p class="stat-meta">Totale click</p>
                </div>
              </div>
              
              <!-- Photos Viewed Card -->
              <div class="stat-card">
                <div class="stat-icon">📸</div>
                <div class="stat-content">
                  <h3 class="stat-label">Foto Visualizzate</h3>
                  <p class="stat-value">{{ stats.photosViewed || 0 }}</p>
                  <p class="stat-meta">Galleria</p>
                </div>
              </div>
              
              <!-- Recent Visitors Table -->
              <div class="stat-card-wide">
                <h3 class="stat-section-title">
                  <span class="stat-icon-inline">🕒</span>
                  Visitatori Recenti
                </h3>
                <div class="visitor-table">
                  <div v-if="!stats.recentVisitors || stats.recentVisitors.length === 0" class="text-center py-4 text-gray-400">
                    Nessun visitatore recente
                  </div>
                  <table v-else class="w-full">
                    <thead>
                      <tr>
                        <th class="text-left">IP</th>
                        <th class="text-left">Pagina</th>
                        <th class="text-left">Data/Ora</th>
                        <th class="text-left">Browser</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(visitor, idx) in stats.recentVisitors.slice(0, 10)" :key="idx">
                        <td>{{ visitor.ip }}</td>
                        <td class="truncate max-w-[200px]">{{ visitor.page }}</td>
                        <td>{{ formatDateTime(visitor.timestamp) }}</td>
                        <td class="truncate max-w-[150px]">{{ visitor.userAgent }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <!-- Top Pages Table -->
              <div class="stat-card-wide">
                <h3 class="stat-section-title">
                  <span class="stat-icon-inline">🔥</span>
                  Pagine Più Visitate
                </h3>
                <div class="pages-list">
                  <div v-if="!stats.topPages || stats.topPages.length === 0" class="text-center py-4 text-gray-400">
                    Nessun dato disponibile
                  </div>
                  <div v-else v-for="(page, idx) in stats.topPages" :key="idx" class="page-item">
                    <div class="page-info">
                      <span class="page-rank">{{ idx + 1 }}</span>
                      <span class="page-url">{{ page.url }}</span>
                    </div>
                    <span class="page-count">{{ page.views }} visite</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

definePageMeta({
  layout: false
})

const fileInput = ref<HTMLInputElement | null>(null)
const tagsInput = ref('')
const newPhoto = ref({
  title: '',
  location: '',
  category: '',
  session_slug: '',
  date_taken: '',
  excerpt: '',
  published: true
})

const activeTab = ref<'home' | 'upload' | 'existing' | 'stats'>('home')

const photos = ref<any[]>([])
const sessions = ref<any[]>([])
const loading = ref(true)
const uploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref('')
const statsLoading = ref(true)
const stats = ref<any>({
  totalVisits: 0,
  uniqueVisitors: 0,
  pageViews: 0,
  photosViewed: 0,
  recentVisitors: [],
  topPages: []
})

// Track per-album toggle (show all vs random selection)
const expandedAlbums = ref<Record<string, boolean>>({})
const toggleAlbum = (slug: string) => {
  expandedAlbums.value[slug] = !expandedAlbums.value[slug]
}

const formatDate = (value?: string) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatDateTime = (value?: string) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('it-IT', { 
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Map session_slug to metadata (title, cover, count)
const sessionMeta = computed(() => {
  const map: Record<string, { title: string; filepath: string; photo_count: number }> = {}
  for (const s of sessions.value) {
    if (!s.session_slug) continue
    map[s.session_slug] = {
      title: s.title || s.session_slug,
      filepath: s.filepath,
      photo_count: s.photo_count || 0
    }
  }
  return map
})

// Group photos by album (session_slug) with display metadata
const groupedAlbums = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const p of photos.value) {
    const key = p.session_slug || 'Senza album'
    if (!groups[key]) groups[key] = []
    groups[key].push(p)
  }
  return Object.entries(groups).map(([slug, items]) => {
    const meta = sessionMeta.value[slug]
    const title = meta?.title || slug
    const cover = meta?.filepath || items[0]?.filepath
    const count = meta?.photo_count || items.length
    // Ensure items are sorted by latest upload within the album
    const sortedItems = [...items].sort((a: any, b: any) => {
      const ad = new Date(a.created_at as string).getTime()
      const bd = new Date(b.created_at as string).getTime()
      return bd - ad
    })
    return { slug, title, cover, count, items: sortedItems }
  })
})

// Utility: pick N random unique items from an array
function randomSample<T>(arr: T[], n: number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, Math.min(n, a.length))
}

// Limit to 8 albums and choose 3–10 recent photos for each
const limitedAlbums = computed(() => {
  // Preserve backend order (sessions are sorted by latest created)
  const orderMap: Record<string, number> = {}
  sessions.value.forEach((s: any, idx: number) => { if (s.session_slug) orderMap[s.session_slug] = idx })

  const sorted = [...groupedAlbums.value].sort((a, b) => {
    const ai = orderMap[a.slug] ?? Number.MAX_SAFE_INTEGER
    const bi = orderMap[b.slug] ?? Number.MAX_SAFE_INTEGER
    return ai - bi
  })

  return sorted.slice(0, 8).map(album => {
    const min = 3
    const max = 10
    const count = Math.floor(Math.random() * (max - min + 1)) + min
    // Take the most recent items (items are already sorted desc by created_at)
    const recentItems = album.items.slice(0, count)
    return { ...album, recentItems }
  })
})

// Check authentication
onMounted(async () => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    navigateTo('/admin/login')
    return
  }

  await fetchPhotos()
  await fetchSessions()
  await fetchStats()
})

const fetchStats = async () => {
  statsLoading.value = true
  try {
    const token = localStorage.getItem('authToken')
    if (!token) return
    
    const response = await $fetch('/api/analytics/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.success) {
      stats.value = response.stats
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  } finally {
    statsLoading.value = false
  }
}

const fetchPhotos = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/photos?published=false')
    photos.value = response.photos || []
  } catch (error) {
    console.error('Failed to fetch photos:', error)
  } finally {
    loading.value = false
  }
}

const fetchSessions = async () => {
  try {
    const response = await $fetch('/api/sessions')
    sessions.value = response.sessions || []
  } catch (error) {
    console.error('Failed to fetch sessions:', error)
  }
}

const handleUpload = async () => {
  uploadError.value = ''
  uploadSuccess.value = ''
  uploading.value = true

  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigateTo('/admin/login')
      return
    }

    // Upload file first
    const file = fileInput.value?.files?.[0]
    if (!file) {
      throw new Error('No file selected')
    }

    const formData = new FormData()
    formData.append('photo', file)

    const uploadResponse = await $fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    // Create photo record
    const tags = tagsInput.value.split(',').map((t: string) => t.trim()).filter(Boolean)
    
    await $fetch('/api/photos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        ...newPhoto.value,
        filename: uploadResponse.filename,
        filepath: uploadResponse.filepath,
        tags
      }
    })

    uploadSuccess.value = 'Photo uploaded successfully!'
    
    // Reset form
    newPhoto.value = {
      title: '',
      location: '',
      category: '',
      session_slug: '',
      date_taken: '',
      excerpt: '',
      published: true
    }
    tagsInput.value = ''
    if (fileInput.value) fileInput.value.value = ''

    // Refresh photos list
    await fetchPhotos()

    // Clear success message after 3 seconds
    setTimeout(() => {
      uploadSuccess.value = ''
    }, 3000)
  } catch (error: any) {
    uploadError.value = error.data?.message || 'Upload failed'
  } finally {
    uploading.value = false
  }
}

const deletePhoto = async (id: number) => {
  if (!confirm('Are you sure you want to delete this photo?')) {
    return
  }

  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigateTo('/admin/login')
      return
    }

    await $fetch(`/api/photos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    await fetchPhotos()
  } catch (error) {
    alert('Failed to delete photo')
  }
}

const handleLogout = () => {
  localStorage.removeItem('authToken')
  navigateTo('/admin/login')
}
</script>

<style scoped>
/* ============================================
   TYPOGRAPHY - ADMIN DASHBOARD
   ============================================ */

/* Display font for headings - uses global Oswald font */
.font-display {
  font-family: var(--font-heading); /* Oswald for dashboard headings */
}

/* ============================================
   LAYOUT - DASHBOARD SHELL CONTAINER
   ============================================ */

/* Main dashboard container - dark theme with animated background */
.dashboard-shell {
  position: relative; /* Establishes stacking context for layers */
  min-height: 100vh; /* Full viewport height minimum */
  background: #000; /* Fallback solid black */
  color: #f8fafc; /* Light text for dark background */
  overflow: hidden; /* Contain animated layers */
}

/* ============================================
   ANIMATED BACKGROUND LAYERS
   ============================================ */

/* Primary background layer - deep ocean gradient with drift animation */
.bg-layer {
  position: absolute; /* Positioned behind content */
  inset: -10%; /* Overflow edges for smooth animation */
  z-index: 0; /* Bottom layer */
  /* Layered radial gradients creating deep ocean effect */
  background:
    radial-gradient(70% 55% at 50% 50%, #2a5d77 0%, #184058 18%, #0f2a43 34%, #0a1b30 50%, #071226 66%, #040d1c 80%, #020814 92%, #01040d 97%, #000309 100%),
    radial-gradient(160% 130% at 10% 10%, rgba(0, 0, 0, 0) 38%, #000309 76%, #000208 100%),
    radial-gradient(160% 130% at 90% 90%, rgba(0, 0, 0, 0) 38%, #000309 76%, #000208 100%);
  filter: saturate(1.0); /* Reduced saturation for clarity */
  animation: drift 14s ease-in-out infinite alternate; /* Slow drift motion */
  opacity: 0.85; /* Slightly lower opacity to deepen base contrast */
}

/* Secondary glow layer - animated light orbs for ambient motion */
.glow-layer {
  position: absolute; /* Positioned above bg-layer */
  inset: -15%; /* Extended overflow for orbit animation */
  z-index: 0; /* Same layer as bg but renders after */
  /* Multiple radial gradients creating soft glowing orbs */
  background:
    radial-gradient(28% 24% at 25% 35%, rgba(111, 209, 255, 0.25), rgba(111, 209, 255, 0)),
    radial-gradient(30% 26% at 78% 60%, rgba(255, 182, 193, 0.22), rgba(255, 182, 193, 0)),
    radial-gradient(22% 20% at 55% 20%, rgba(156, 233, 255, 0.18), rgba(156, 233, 255, 0));
  mix-blend-mode: screen; /* Additive blending for luminous effect */
  opacity: 0.45; /* Reduced glow for higher contrast */
  filter: blur(8px) saturate(1.0); /* Softer, less saturated glow */
  animation: orbit 26s ease-in-out infinite; /* Slow orbital motion */
  pointer-events: none; /* Allow clicks to pass through */
}

/* ============================================
   CONTENT LAYER
   ============================================ */

/* Content wrapper - sits above animated backgrounds */
.content-shell {
  position: relative; /* Stacking context above backgrounds */
  z-index: 1; /* Above all background layers */
  backdrop-filter: blur(2px); /* Subtle background blur for glass effect */
}

/* ============================================
   HEADER BAR - TOP NAVIGATION
   ============================================ */

/* Dashboard header with translucent background and blur effect */
.header-bar {
  background: rgba(15, 23, 42, 0.92); /* Darker translucent navy for stronger separation */
  border-bottom: 1px solid rgba(255, 255, 255, 0.22); /* Stronger separator line */
  padding: 1rem 1.5rem; /* Comfortable padding */
  backdrop-filter: blur(6px); /* Strong glass blur effect */
}

/* ============================================
   TAB NAVIGATION - UPLOAD / EXISTING TOGGLE
   ============================================ */

/* Tab switch container - pill-shaped button group */
.tab-switch {
  display: inline-flex; /* Inline flexbox for horizontal layout */
  padding: 0.35rem; /* Inner padding around buttons */
  background: rgba(255, 255, 255, 0.08); /* Stronger translucent background */
  border: 1px solid rgba(255, 255, 255, 0.22); /* Stronger border */
  border-radius: 0.6rem; /* Squared rounded corners */
  gap: 0.35rem; /* Spacing between tab buttons */
  box-shadow: 0 10px 32px -18px rgba(0, 0, 0, 0.95); /* Deeper shadow */
}

/* Individual tab button - inactive state */
.tab-btn {
  padding: 0.65rem 1.1rem; /* Comfortable click target */
  border-radius: 0.5rem; /* Squared corners matching parent */
  border: 1px solid rgba(255, 255, 255, 0.18); /* Stronger border */
  background: transparent; /* Clear background when inactive */
  color: #f1f5f9; /* Lighter text for contrast */
  font-weight: 600; /* Semi-bold for emphasis */
  letter-spacing: 0.01em; /* Slight tracking */
  transition: all 0.25s ease; /* Smooth state transitions */
  box-shadow: 0 8px 24px -16px rgba(0, 0, 0, 0.9); /* Stronger shadow */
}

/* Tab button hover state - subtle highlight */
.tab-btn:hover {
  background: rgba(255, 255, 255, 0.14); /* Clearer hover */
  border-color: rgba(255, 255, 255, 0.28); /* Brighter border on hover */
}

/* Active tab button - selected state with gradient */
.tab-active {
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.16)); /* Slightly stronger gradient */
  color: #0a0f1e; /* Dark text for contrast on light background */
  border-color: rgba(255, 255, 255, 0.45); /* Strong border for definition */
  box-shadow: 0 12px 36px -18px rgba(255, 255, 255, 0.7), 0 10px 26px -14px rgba(0, 0, 0, 0.8); /* Enhanced shadow depth */
}

/* ============================================
   TRANSITIONS - TAB CONTENT ANIMATIONS
   ============================================ */

/* Fade-slide transition for tab content switching */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease, opacity 0.3s ease; /* Smooth fade and slide */
}

/* Entering and leaving states - fade out with slight downward movement */
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0; /* Fully transparent */
  transform: translateY(8px); /* Slide down slightly */
}

/* ============================================
   CONTENT PANELS - FORM & GALLERY CONTAINERS
   ============================================ */

/* Panel card - translucent container with glass morphism effect */
.panel {
  background: rgba(255, 255, 255, 0.12); /* Stronger surface for separation */
  border: 1px solid rgba(255, 255, 255, 0.24); /* Stronger border definition */
  border-radius: 0.75rem; /* Rounded corners */
  padding: 1.5rem; /* Comfortable internal spacing */
  margin-bottom: 2rem; /* Separation between panels */
  box-shadow: 0 24px 60px -32px rgba(0, 0, 0, 0.9); /* Deeper shadow for elevation */
  backdrop-filter: blur(6px); /* Glass blur effect */
}

/* ============================================
   BUTTONS - ACTION ELEMENTS
   ============================================ */

/* Shared button styles - squared with shadow */
.btn-solid,
.btn-danger {
  border-radius: 0.5rem; /* Squared rounded corners */
  box-shadow: 0 10px 26px -18px rgba(0, 0, 0, 0.9); /* Subtle depth shadow */
}

/* Primary solid button - light background for primary actions */
.btn-solid {
  background: #f8fafc; /* Near-white background */
  color: #0b1020; /* Dark text for high contrast */
}

/* Primary button hover state */
.btn-solid:hover {
  background: #e2e8f0; /* Slightly darker on hover */
}

/* Danger button - red for destructive actions */
.btn-danger {
  background: #ef4444; /* Bright red for warning */
}

/* Danger button hover state */
.btn-danger:hover {
  background: #dc2626; /* Darker red on hover */
}

/* ============================================
   FORM INPUTS - TEXT FIELDS & TEXTAREAS
   ============================================ */

/* Input field - translucent with focus states */
.input-field {
  width: 100%; /* Full width of container */
  padding: 0.75rem 1rem; /* Comfortable input padding */
  background: rgba(255, 255, 255, 0.14); /* Stronger input background */
  border: 1px solid rgba(255, 255, 255, 0.22); /* Stronger border */
  border-radius: 0.6rem; /* Rounded input corners */
  color: #f8fafc; /* Light text color */
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease; /* Smooth focus transitions */
}

/* Input focus state - enhanced visibility */
.input-field:focus {
  outline: none; /* Remove default browser outline */
  border-color: rgba(255, 255, 255, 0.5); /* Brighter border on focus */
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.22); /* Stronger focus ring */
  background: rgba(255, 255, 255, 0.18); /* Brighter background */
}

/* ============================================
   ANIMATIONS - BACKGROUND MOTION EFFECTS
   ============================================ */

/* Drift animation - slow organic movement for bg-layer */
@keyframes drift {
  0% {
    transform: translate3d(0px, 0px, 0) scale(1.05); /* Starting position with slight scale */
    filter: blur(0px); /* Sharp at start */
  }
  50% {
    transform: translate3d(-20px, 10px, 0) scale(1.08); /* Move left-down, scale up */
    filter: blur(0.5px); /* Slight blur at midpoint */
  }
  100% {
    transform: translate3d(15px, -15px, 0) scale(1.03); /* Move right-up, scale slightly */
    filter: blur(1px); /* Soft blur at end */
  }
}

/* Orbit animation - circular motion for glow-layer orbs */
@keyframes orbit {
  0% {
    transform: translate3d(0, 0, 0) scale(1); /* Starting position */
    opacity: 0.65; /* Medium opacity */
  }
  35% {
    transform: translate3d(12px, -16px, 0) scale(1.06) rotate(1deg); /* Move right-up with slight rotation */
    opacity: 0.8; /* Brighten slightly */
  }
  65% {
    transform: translate3d(-18px, 20px, 0) scale(1.04) rotate(-1deg); /* Move left-down with counter-rotation */
    opacity: 0.72; /* Dim slightly */
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1.02); /* Return to center with slight scale */
    opacity: 0.65; /* Return to base opacity */
  }
}

/* ============================================
   STATISTICS PANEL - ANALYTICS DISPLAY
   ============================================ */

/* Stats grid layout - responsive card grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

/* Individual stat card */
.stat-card {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* Wide stat card for tables */
.stat-card-wide {
  grid-column: 1 / -1;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

/* Stat icon - emoji display */
.stat-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.stat-icon-inline {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

/* Stat content wrapper */
.stat-content {
  flex: 1;
}

/* Stat label - title */
.stat-label {
  font-size: 0.9rem;
  color: #cbd5e1; /* Lighter label for readability */
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Stat value - large number */
.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: #f8fafc;
  font-family: var(--font-heading);
  line-height: 1;
  margin-bottom: 0.25rem;
}

/* Stat meta - additional info */
.stat-meta {
  font-size: 0.9rem;
  color: #94a3b8;
}

/* Section title for tables */
.stat-section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #f8fafc;
  display: flex;
  align-items: center;
}

/* Visitor table styling */
.visitor-table {
  overflow-x: auto;
}

.visitor-table table {
  border-collapse: collapse;
}

.visitor-table th {
  padding: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #cbd5e1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.22);
  white-space: nowrap;
}

.visitor-table td {
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #e2e8f0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.visitor-table tr:hover td {
  background: rgba(255, 255, 255, 0.1);
}

/* Pages list styling */
.pages-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.page-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.page-item:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.3);
}

.page-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.page-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  font-weight: 700;
  font-size: 0.875rem;
  color: #f8fafc;
}

.page-url {
  color: #e2e8f0; /* Brighter URL text */
  font-size: 0.95rem;
  font-family: monospace;
}

.page-count {
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

/* ============================================
   DASHBOARD-SPECIFIC OVERRIDES FOR UTILITY CLASSES
   ============================================ */
/* Lift very dim gray utility to a more legible tone inside the dashboard */
:deep(.text-gray-400) {
  color: #cbd5e1 !important;
}

/* Photo cards inside the "Existing Photos" grid: increase surface contrast */
.panel .grid .rounded-lg {
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(255, 255, 255, 0.22) !important;
}

/* Responsive stats grid */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .visitor-table {
    font-size: 0.75rem;
  }
  
  .visitor-table th,
  .visitor-table td {
    padding: 0.5rem;
  }
}
</style>
