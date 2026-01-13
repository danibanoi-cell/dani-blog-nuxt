<template>
  <div class="dashboard-shell">
    <div class="bg-layer" aria-hidden="true"></div>
    <div class="content-shell">
      <!-- Header -->
      <header class="header-bar">
        <div class="header-content">
          <h1 class="header-title">Dashboard</h1>
          <button class="logout-btn" @click="handleLogout">Logout</button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <div class="tab-switch">
          <button
            :class="['tab-btn', activeTab === 'landing' ? 'tab-active' : '']"
            @click="activeTab = 'landing'"
          >
            🏠 Landing Page
          </button>
          <button
            :class="['tab-btn', activeTab === 'section' ? 'tab-active' : '']"
            @click="activeTab = 'section'"
          >
            📷 Section Photo
          </button>
          <button
            :class="['tab-btn', activeTab === 'upload' ? 'tab-active' : '']"
            @click="activeTab = 'upload'"
          >
            ⬆️ Upload Album
          </button>
          <button
            :class="['tab-btn', activeTab === 'existing' ? 'tab-active' : '']"
            @click="activeTab = 'existing'"
          >
            🖼️ Photos
          </button>
          <button
            :class="['tab-btn', activeTab === 'stats' ? 'tab-active' : '']"
            @click="activeTab = 'stats'"
          >
            📊 Stats
          </button>
        </div>

        <Transition name="fade-slide" mode="out-in">
          <!-- LANDING PAGE SETTINGS -->
          <div v-if="activeTab === 'landing'" key="landing" class="panel">
            <h2 class="panel-title">Landing Page Settings</h2>
            <p class="panel-desc">Configure the landing page hero photo and text content.</p>

            <div class="section-divider"></div>

            <!-- Landing Text Settings -->
            <div class="form-section">
              <h3 class="form-section-title">Text Content</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Title</label>
                  <input
                    v-model="landingSettings.title"
                    type="text"
                    class="input-field"
                    placeholder="DANI BANOI"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Subtitle</label>
                  <input
                    v-model="landingSettings.subtitle"
                    type="text"
                    class="input-field"
                    placeholder="Photographer | Travel & Documentary"
                  />
                </div>
                <div class="form-group full-width">
                  <label class="form-label">Description</label>
                  <textarea
                    v-model="landingSettings.description"
                    rows="3"
                    class="input-field"
                    placeholder="Discover authentic moments captured through refined portraits..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="section-divider"></div>

            <!-- Landing Photo Selection -->
            <div class="form-section">
              <h3 class="form-section-title">Hero Photos</h3>
              <p class="form-desc">Select photos for the landing page slideshow. Click to toggle selection.</p>
              
              <div v-if="loading" class="loading-state">Loading photos...</div>
              <div v-else class="photo-selector-grid">
                <div
                  v-for="photo in allPhotosFlat"
                  :key="photo.id"
                  class="photo-selector-item"
                  :class="{ selected: landingSettings.heroPhotos.includes(photo.id) }"
                  @click="toggleLandingPhoto(photo.id)"
                >
                  <img :src="photo.filepath" :alt="photo.title" />
                  <div class="photo-selector-overlay">
                    <span v-if="landingSettings.heroPhotos.includes(photo.id)" class="check-icon">✓</span>
                  </div>
                </div>
              </div>
              <p class="selection-count">{{ landingSettings.heroPhotos.length }} photos selected</p>
            </div>

            <button class="save-btn" @click="saveLandingSettings" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Landing Settings' }}
            </button>
          </div>

          <!-- SECTION PHOTO SELECTION -->
          <div v-else-if="activeTab === 'section'" key="section" class="panel">
            <h2 class="panel-title">Section Photo</h2>
            <p class="panel-desc">Select the main photo displayed in the fullscreen photo section below the landing.</p>

            <div class="section-divider"></div>

            <!-- Current Selection -->
            <div v-if="sectionPhoto" class="current-section-photo">
              <h3 class="form-section-title">Current Photo</h3>
              <div class="current-photo-preview">
                <img :src="sectionPhoto.filepath" :alt="sectionPhoto.title" />
                <div class="current-photo-info">
                  <p class="current-photo-title">{{ sectionPhoto.title }}</p>
                  <button class="remove-btn" @click="sectionPhotoId = null">Remove</button>
                </div>
              </div>
            </div>

            <div class="section-divider"></div>

            <!-- Photo Selection Grid -->
            <div class="form-section">
              <h3 class="form-section-title">Select Photo</h3>
              
              <div v-if="loading" class="loading-state">Loading photos...</div>
              <div v-else class="photo-selector-grid large">
                <div
                  v-for="photo in allPhotosFlat"
                  :key="photo.id"
                  class="photo-selector-item"
                  :class="{ selected: sectionPhotoId === photo.id }"
                  @click="sectionPhotoId = photo.id"
                >
                  <img :src="photo.filepath" :alt="photo.title" />
                  <div class="photo-selector-overlay">
                    <span v-if="sectionPhotoId === photo.id" class="check-icon">✓</span>
                  </div>
                  <div class="photo-title-bar">{{ photo.title }}</div>
                </div>
              </div>
            </div>

            <button class="save-btn" @click="saveSectionPhoto" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Section Photo' }}
            </button>
          </div>

          <!-- UPLOAD ALBUM -->
          <div v-else-if="activeTab === 'upload'" key="upload" class="panel">
            <h2 class="panel-title">Upload New Album</h2>
            <p class="panel-desc">Create a new photo album with multiple images.</p>

            <form class="upload-form" @submit.prevent="handleAlbumUpload">
              <div v-if="uploadError" class="alert alert-error">{{ uploadError }}</div>
              <div v-if="uploadSuccess" class="alert alert-success">{{ uploadSuccess }}</div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Album Name *</label>
                  <input
                    v-model="newAlbum.name"
                    required
                    type="text"
                    class="input-field"
                    placeholder="Album Name"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Description</label>
                  <textarea
                    v-model="newAlbum.description"
                    rows="3"
                    class="input-field"
                    placeholder="Album Description"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label class="form-label">Tags (comma separated)</label>
                  <input
                    v-model="albumTagsInput"
                    type="text"
                    class="input-field"
                    placeholder="Tag1, Tag2"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Cover Image *</label>
                  <input
                    ref="albumFileInput"
                    type="file"
                    required
                    accept="video/*,image/*"
                    class="input-field file-input"
                  />
                </div>

                <div class="form-group full-width">
                  <label class="form-label">Additional Photos</label>
                  <input
                    ref="additionalFilesInput"
                    type="file"
                    multiple
                    accept="image/*"
                    class="input-field file-input"
                  />
                </div>
              </div>

              <button type="submit" :disabled="uploading" class="save-btn">
                {{ uploading ? 'Uploading...' : 'Upload Album' }}
              </button>
            </form>
          </div>

          <!-- EXISTING PHOTOS -->
          <div v-else-if="activeTab === 'existing'" key="existing" class="panel">
            <h2 class="panel-title">Existing Photos</h2>

            <div v-if="loading" class="loading-state">Loading photos...</div>

            <div v-else-if="photos.length === 0" class="empty-state">
              <p>No photos found. Upload your first album!</p>
            </div>

            <div v-else class="albums-list">
              <div v-for="album in limitedAlbums" :key="album.slug" class="album-card">
                <div class="album-header" @click="toggleAlbum(album.slug)">
                  <div class="album-info">
                    <img v-if="album.cover" :src="album.cover" alt="cover" class="album-cover" />
                    <div>
                      <h3 class="album-title">{{ album.title }}</h3>
                      <span class="album-count">{{ album.count }} photos</span>
                    </div>
                  </div>
                  <span class="expand-icon">{{ expandedAlbums[album.slug] ? '−' : '+' }}</span>
                </div>
                
                <Transition name="fade-slide">
                  <div v-if="expandedAlbums[album.slug]" class="album-photos-grid">
                    <div v-for="photo in album.items" :key="photo.id" class="photo-card">
                      <img :src="photo.filepath" :alt="photo.title" class="photo-image" />
                      <div class="photo-info">
                        <h4 class="photo-title">{{ photo.title }}</h4>
                        <p class="photo-meta">{{ formatDate(photo.created_at) }}</p>
                        <div class="photo-tags">
                          <span v-for="tag in photo.tags" :key="tag" class="tag">{{ tag }}</span>
                        </div>
                        <button class="delete-btn" @click="deletePhoto(photo.id)">Delete</button>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>

          <!-- STATS -->
          <div v-else-if="activeTab === 'stats'" key="stats" class="panel">
            <h2 class="panel-title">Site Statistics</h2>

            <div v-if="statsLoading" class="loading-state">Loading statistics...</div>

            <div v-else class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                  <h3 class="stat-label">Total Visits</h3>
                  <p class="stat-value">{{ stats.totalVisits || 0 }}</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">🌍</div>
                <div class="stat-content">
                  <h3 class="stat-label">Unique Visitors</h3>
                  <p class="stat-value">{{ stats.uniqueVisitors || 0 }}</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">📄</div>
                <div class="stat-content">
                  <h3 class="stat-label">Page Views</h3>
                  <p class="stat-value">{{ stats.pageViews || 0 }}</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">📸</div>
                <div class="stat-content">
                  <h3 class="stat-label">Photos Viewed</h3>
                  <p class="stat-value">{{ stats.photosViewed || 0 }}</p>
                </div>
              </div>

              <!-- Top Pages -->
              <div class="stat-card-wide">
                <h3 class="stat-section-title">🔥 Top Pages</h3>
                <div class="pages-list">
                  <div v-if="!stats.topPages?.length" class="empty-state small">No data available</div>
                  <div v-for="(page, idx) in stats.topPages" :key="idx" class="page-item">
                    <div class="page-info">
                      <span class="page-rank">{{ displayIndex(idx) }}</span>
                      <span class="page-url">{{ page.url }}</span>
                    </div>
                    <span class="page-count">{{ page.views }} views</span>
                  </div>
                </div>
              </div>

              <!-- Recent Visitors -->
              <div class="stat-card-wide">
                <h3 class="stat-section-title">🕒 Recent Visitors</h3>
                <div class="visitor-table-wrapper">
                  <div v-if="!stats.recentVisitors?.length" class="empty-state small">No recent visitors</div>
                  <table v-else class="visitor-table">
                    <thead>
                      <tr>
                        <th>IP</th>
                        <th>Page</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(visitor, idx) in stats.recentVisitors.slice(0, 10)" :key="idx">
                        <td>{{ visitor.ip }}</td>
                        <td class="truncate">{{ visitor.page }}</td>
                        <td>{{ formatDateTime(visitor.timestamp) }}</td>
                      </tr>
                    </tbody>
                  </table>
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
import { navigateTo } from '#app'

definePageMeta({
  layout: false,
})

// Tab state
const activeTab = ref<'landing' | 'section' | 'upload' | 'existing' | 'stats'>('landing')

// Data state
const photos = ref<any[]>([])
const sessions = ref<any[]>([])
const loading = ref(true)
const uploading = ref(false)
const saving = ref(false)
const uploadError = ref('')
const uploadSuccess = ref('')
const statsLoading = ref(true)
const stats = ref<any>({
  totalVisits: 0,
  uniqueVisitors: 0,
  pageViews: 0,
  photosViewed: 0,
  recentVisitors: [],
  topPages: [],
})

// Landing page settings
const landingSettings = ref({
  title: 'DANI BANOI',
  subtitle: 'Photographer | Travel & Documentary',
  description: 'Discover authentic moments captured through refined portraits and editorial imagery.',
  heroPhotos: [] as number[],
})

// Section photo
const sectionPhotoId = ref<number | null>(null)
const sectionPhoto = computed(() => {
  if (!sectionPhotoId.value) return null
  return allPhotosFlat.value.find(p => p.id === sectionPhotoId.value)
})

// Album upload
const newAlbum = ref({ name: '', description: '' })
const albumTagsInput = ref('')
const albumFileInput = ref<HTMLInputElement | null>(null)
const additionalFilesInput = ref<HTMLInputElement | null>(null)

// Album expansion
const expandedAlbums = ref<Record<string, boolean>>({})
const toggleAlbum = (slug: string) => {
  expandedAlbums.value[slug] = !expandedAlbums.value[slug]
}

const displayIndex = (idx: number | string): number => Number(idx) + 1

// Toggle landing photo selection
const toggleLandingPhoto = (id: number) => {
  const idx = landingSettings.value.heroPhotos.indexOf(id)
  if (idx === -1) {
    landingSettings.value.heroPhotos.push(id)
  } else {
    landingSettings.value.heroPhotos.splice(idx, 1)
  }
}

// Flat list of all photos for selection grids
const allPhotosFlat = computed(() => {
  return photos.value.slice(0, 50) // Limit for performance
})

// Normalize filepaths
const normalizeFilepath = (path: string) => {
  if (!path) return ''
  if (path.startsWith('/foto-sito/') || path.startsWith('/uploads/')) return path
  const filename = path.split('/').pop()
  return `/foto-sito/${filename}`
}

// Session metadata
const sessionMeta = computed(() => {
  const map: Record<string, { title: string; filepath: string; photo_count: number }> = {}
  for (const s of sessions.value) {
    if (!s.session_slug) continue
    map[s.session_slug] = {
      title: s.title || s.session_slug,
      filepath: s.filepath,
      photo_count: s.photo_count || 0,
    }
  }
  return map
})

// Grouped albums
const groupedAlbums = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const p of photos.value) {
    const key = p.session_slug || 'Uncategorized'
    if (!groups[key]) groups[key] = []
    groups[key].push(p)
  }
  return Object.entries(groups).map(([slug, items]) => {
    const meta = sessionMeta.value[slug]
    const title = meta?.title || slug
    const cover = meta?.filepath || items[0]?.filepath
    const count = meta?.photo_count || items.length
    const sortedItems = [...items].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    return { slug, title, cover, count, items: sortedItems }
  })
})

// Limited albums for display
const limitedAlbums = computed(() => {
  const orderMap: Record<string, number> = {}
  sessions.value.forEach((s: any, idx: number) => {
    if (s.session_slug) orderMap[s.session_slug] = idx
  })
  const sorted = [...groupedAlbums.value].sort((a, b) => {
    const ai = orderMap[a.slug] ?? Number.MAX_SAFE_INTEGER
    const bi = orderMap[b.slug] ?? Number.MAX_SAFE_INTEGER
    return ai - bi
  })
  return sorted.slice(0, 12)
})

// Date formatting
const formatDate = (value?: string) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatDateTime = (value?: string) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// API calls
const fetchPhotos = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/photos?published=false')
    photos.value = (response.photos || []).map((p: any) => ({ ...p, filepath: normalizeFilepath(p.filepath) }))
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

const fetchStats = async () => {
  statsLoading.value = true
  try {
    const token = localStorage.getItem('authToken')
    if (!token) return
    const response = await $fetch('/api/analytics/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (response.success) stats.value = response.stats
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  } finally {
    statsLoading.value = false
  }
}

const saveLandingSettings = async () => {
  saving.value = true
  // TODO: Implement API to save landing settings
  // For now, just simulate save
  await new Promise(r => setTimeout(r, 500))
  saving.value = false
  alert('Landing settings saved! (Note: Backend API not yet implemented)')
}

const saveSectionPhoto = async () => {
  saving.value = true
  // TODO: Implement API to save section photo
  await new Promise(r => setTimeout(r, 500))
  saving.value = false
  alert('Section photo saved! (Note: Backend API not yet implemented)')
}

const handleAlbumUpload = async () => {
  uploading.value = true
  uploadError.value = ''
  uploadSuccess.value = ''

  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigateTo('/admin/login')
      return
    }

    const first = albumFileInput.value?.files?.[0]
    if (!first) throw new Error('Cover image is required')

    const formData = new FormData()
    formData.append('name', newAlbum.value.name)
    formData.append('description', newAlbum.value.description)
    formData.append('tags', albumTagsInput.value || '')
    formData.append('firstFile', first)

    const additional = additionalFilesInput.value?.files
    if (additional?.length) {
      Array.from(additional).forEach((file, i) => {
        formData.append(`additionalFiles[${i}]`, file)
      })
    }

    const response = await fetch('/api/photos/albums', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    if (!response.ok) throw new Error(await response.text())

    uploadSuccess.value = 'Album uploaded successfully!'
    await fetchPhotos()
    await fetchSessions()

    newAlbum.value = { name: '', description: '' }
    albumTagsInput.value = ''
    if (albumFileInput.value) albumFileInput.value.value = ''
    if (additionalFilesInput.value) additionalFilesInput.value.value = ''

    setTimeout(() => (uploadSuccess.value = ''), 3000)
  } catch (error: any) {
    uploadError.value = error?.message || 'Album upload failed'
  } finally {
    uploading.value = false
  }
}

const deletePhoto = async (id: number) => {
  if (!confirm('Delete this photo?')) return

  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigateTo('/admin/login')
      return
    }
    await $fetch(`/api/photos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
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

// Mount
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
</script>

<style scoped>
/* ============================================
   DASHBOARD - GRAY THEME
   ============================================ */

.dashboard-shell {
  position: relative;
  min-height: 100vh;
  background: #0a0a0a;
  color: #e5e5e5;
  font-family: system-ui, -apple-system, sans-serif;
}

.bg-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: 
    radial-gradient(ellipse at 30% 20%, rgba(60, 60, 60, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(50, 50, 50, 0.12) 0%, transparent 50%),
    linear-gradient(180deg, #0a0a0a 0%, #141414 50%, #0a0a0a 100%);
  pointer-events: none;
}

.content-shell {
  position: relative;
  z-index: 1;
}

/* Header */
.header-bar {
  background: rgba(20, 20, 20, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  color: #e5e5e5;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Main Content */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Tabs */
.tab-switch {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.tab-btn {
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #a0a0a0;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #e5e5e5;
}

.tab-active {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

/* Panel */
.panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.panel-desc {
  color: #808080;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.section-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 2rem 0;
}

/* Form Elements */
.form-section {
  margin-bottom: 2rem;
}

.form-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e5e5e5;
  margin-bottom: 1rem;
}

.form-desc {
  color: #707070;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #a0a0a0;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e5e5e5;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
}

.input-field::placeholder {
  color: #505050;
}

.file-input {
  padding: 0.5rem;
}

/* Photo Selector Grid */
.photo-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.photo-selector-grid.large {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  max-height: 500px;
}

.photo-selector-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.photo-selector-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-selector-item:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

.photo-selector-item.selected {
  border-color: #22c55e;
}

.photo-selector-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.photo-selector-item:hover .photo-selector-overlay,
.photo-selector-item.selected .photo-selector-overlay {
  opacity: 1;
}

.check-icon {
  width: 32px;
  height: 32px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
}

.photo-title-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selection-count {
  margin-top: 1rem;
  color: #808080;
  font-size: 0.875rem;
}

/* Current Section Photo */
.current-section-photo {
  margin-bottom: 1rem;
}

.current-photo-preview {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
}

.current-photo-preview img {
  width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.current-photo-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.current-photo-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #e5e5e5;
}

/* Buttons */
.save-btn {
  margin-top: 2rem;
  padding: 0.875rem 2rem;
  background: #ffffff;
  border: none;
  border-radius: 8px;
  color: #0a0a0a;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #e5e5e5;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.remove-btn {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.delete-btn {
  width: 100%;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 6px;
  color: #ef4444;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.25);
}

/* Alerts */
.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.alert-error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.alert-success {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #86efac;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #606060;
}

.empty-state.small {
  padding: 1.5rem;
}

/* Albums List */
.albums-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.album-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.album-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s;
}

.album-header:hover {
  background: rgba(255, 255, 255, 0.04);
}

.album-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.album-cover {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
}

.album-title {
  font-size: 1rem;
  font-weight: 500;
  color: #e5e5e5;
}

.album-count {
  font-size: 0.8rem;
  color: #707070;
}

.expand-icon {
  font-size: 1.5rem;
  color: #707070;
  font-weight: 300;
}

.album-photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
}

.photo-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  overflow: hidden;
}

.photo-image {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
}

.photo-info {
  padding: 0.75rem;
}

.photo-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #e5e5e5;
  margin-bottom: 0.25rem;
}

.photo-meta {
  font-size: 0.75rem;
  color: #606060;
  margin-bottom: 0.5rem;
}

.photo-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.tag {
  padding: 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  font-size: 0.7rem;
  color: #a0a0a0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  transition: all 0.2s;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
}

.stat-card-wide {
  grid-column: 1 / -1;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #707070;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
}

.stat-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e5e5e5;
  margin-bottom: 1rem;
}

/* Pages List */
.pages-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  transition: background 0.2s;
}

.page-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.page-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-rank {
  width: 1.5rem;
  height: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #a0a0a0;
}

.page-url {
  font-family: monospace;
  font-size: 0.875rem;
  color: #a0a0a0;
}

.page-count {
  font-size: 0.8rem;
  color: #606060;
}

/* Visitor Table */
.visitor-table-wrapper {
  overflow-x: auto;
}

.visitor-table {
  width: 100%;
  border-collapse: collapse;
}

.visitor-table th {
  text-align: left;
  padding: 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #707070;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.visitor-table td {
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #a0a0a0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.visitor-table tr:hover td {
  background: rgba(255, 255, 255, 0.04);
}

.truncate {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .header-content {
    padding: 1rem;
  }

  .panel {
    padding: 1.25rem;
  }

  .tab-switch {
    gap: 0.25rem;
  }

  .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .photo-selector-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .album-photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>
