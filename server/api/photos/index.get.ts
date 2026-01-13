import { query } from '../../utils/db'
import type { Photo, ApiResponse } from '../../types/database'

export default defineEventHandler(async (event): Promise<ApiResponse<Photo[]>> => {
  const queryParams = getQuery(event)
  const publishedOnly = queryParams.published === 'true' || queryParams.published !== 'false'

  try {
    // Check and add missing columns
    const sessionColResult = await query("SHOW COLUMNS FROM photos LIKE 'session_slug'")
    const sessionColArray = Array.isArray(sessionColResult) ? sessionColResult : []
    
    if (sessionColArray.length === 0) {
      await query(`ALTER TABLE photos ADD COLUMN session_slug VARCHAR(255) NULL, ADD INDEX idx_session (session_slug)`)
    }

    const locColResult = await query("SHOW COLUMNS FROM photos LIKE 'location'")
    const locColArray = Array.isArray(locColResult) ? locColResult : []
    
    if (locColArray.length === 0) {
      await query("ALTER TABLE photos ADD COLUMN location VARCHAR(255) DEFAULT 'Studio'")
    }

    const dateColResult = await query("SHOW COLUMNS FROM photos LIKE 'date_taken'")
    const dateColArray = Array.isArray(dateColResult) ? dateColResult : []
    
    if (dateColArray.length === 0) {
      await query(`ALTER TABLE photos ADD COLUMN date_taken VARCHAR(100) DEFAULT '2025'`)
    }

    // Build base query
    let sql = `
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.filepath,
        p.excerpt,
        p.category,
        p.published,
        COALESCE(p.session_slug, p.slug) as session_slug,
        COALESCE(p.location, 'Studio') as location,
        COALESCE(p.date_taken, '2025') as date_taken,
        p.created_at,
        p.updated_at,
        COALESCE(GROUP_CONCAT(DISTINCT t.name ORDER BY t.name SEPARATOR ','), '') as tags
      FROM photos p
      LEFT JOIN photo_tags pt ON p.id = pt.photo_id
      LEFT JOIN tags t ON pt.tag_id = t.id
    `

    const conditions = []
    const params: any[] = []

    if (publishedOnly) {
      conditions.push('p.published = 1')
    }

    if (queryParams.category) {
      conditions.push('p.category = ?')
      params.push(queryParams.category)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += ' GROUP BY p.id ORDER BY p.created_at DESC'

    if (queryParams.limit) {
      sql += ' LIMIT ?'
      params.push(parseInt(String(queryParams.limit)))
    }

    const result = await query(sql, params)
    
    // Safely extract photos array
    const photosArray = Array.isArray(result) ? result : []

    // Process tags and ensure all fields exist
    const processedPhotos: Photo[] = photosArray.map((photo: any) => ({
      id: photo.id,
      title: photo.title,
      slug: photo.slug,
      filepath: photo.filepath,
      excerpt: photo.excerpt || '',
      category: photo.category || '',
      published: Boolean(photo.published),
      session_slug: photo.session_slug || photo.slug,
      location: photo.location || 'Studio',
      date_taken: photo.date_taken || '2025',
      created_at: photo.created_at,
      updated_at: photo.updated_at,
      tags: photo.tags ? photo.tags.split(',').filter((t: string) => t.trim()) : []
    }))

    return {
      success: true,
      data: processedPhotos,
      count: processedPhotos.length
    }
  } catch (error: any) {
    console.error('[Photos API Error]', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch photos',
      data: { error: error.message }
    })
  }
})
