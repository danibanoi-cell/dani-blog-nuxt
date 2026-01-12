/**
 * Photo entity - represents a single photo in the database
 */
export interface Photo {
  id: number
  title: string
  slug: string
  filepath: string
  excerpt?: string
  category?: string
  published: number | boolean
  session_slug?: string
  location?: string
  date_taken?: string
  created_at: string
  updated_at: string
  tags?: string[]
}

/**
 * User entity - represents an admin user
 */
export interface User {
  id: number
  username: string
  email: string
  password: string
  role: 'admin' | 'editor' | 'viewer'
  created_at: string
  updated_at: string
}

/**
 * Tag entity - represents a tag/category label
 */
export interface Tag {
  id: number
  name: string
  slug: string
  created_at: string
  updated_at: string
}

/**
 * PhotoTag pivot table - links photos to tags
 */
export interface PhotoTag {
  id: number
  photo_id: number
  tag_id: number
  created_at: string
}

/**
 * Session entity - represents a photo session/album
 */
export interface Session {
  slug: string
  title: string
  location?: string
  date?: string
  photos: Photo[]
  totalPhotos: number
}

/**
 * Analytics event - tracks page visits and user interactions
 */
export interface AnalyticsEvent {
  id: number
  page: string
  user_agent?: string
  ip_address?: string
  created_at: string
}

/**
 * API Response wrapper for consistent response format
 */
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
  count?: number
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
