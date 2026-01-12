/**
 * Photo entity - represents a single photo in the database
 */
export interface Photo {
  id: number
  title?: string
  slug?: string
  filepath?: string
  excerpt?: string
  category?: string
  published?: number | boolean
  session_slug?: string | null
  location?: string | null
  date_taken?: string | null
  created_at?: string
  updated_at?: string
  tags?: string | string[]
}

/**
 * Processed photo for frontend display
 */
export interface ProcessedPhoto extends Photo {
  src: string
  tags: string[]
}

/**
 * Photo within an album (for galleries)
 */
export interface AlbumPhoto {
  id: number
  image: string
  title?: string
  description?: string
}

/**
 * Album display format
 */
export interface Album {
  slug: string
  title?: string
  location?: string
  date?: string
  photos: Photo[]
  allPhotos: AlbumPhoto[]
  totalPhotos: number
}

/**
 * Session entity
 */
export interface Session extends Album {
  slug: string
}

/**
 * User entity
 */
export interface User {
  id: number
  username: string
  email: string
  password?: string
  role?: 'admin' | 'editor' | 'viewer'
  created_at?: string
  updated_at?: string
}

/**
 * Tag entity
 */
export interface Tag {
  id: number
  name: string
  slug: string
  created_at?: string
  updated_at?: string
}

/**
 * PhotoTag pivot table
 */
export interface PhotoTag {
  id: number
  photo_id: number
  tag_id: number
  created_at?: string
}

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  id: number
  page: string
  user_agent?: string
  ip_address?: string
  created_at?: string
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  count?: number
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T = any> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

/**
 * Lightbox state
 */
export interface LightboxState {
  open: boolean
  images: AlbumPhoto[]
  currentIndex: number
}

/**
 * User auth state
 */
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  isDark: boolean
  systemPreference: boolean
  override: boolean
}
