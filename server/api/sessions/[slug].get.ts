import { query } from '../../utils/db'
import type { Photo, Session, ApiResponse } from '../../types/database'

async function ensureSessionColumn() {
  const columns: any = await query("SHOW COLUMNS FROM photos LIKE 'session_slug'")
  if (!Array.isArray(columns) || columns.length === 0) {
    await query("ALTER TABLE photos ADD COLUMN session_slug VARCHAR(255) NULL, ADD INDEX idx_session (session_slug)")
  }
}

export default defineEventHandler(async (event): Promise<ApiResponse<Session>> => {
  await ensureSessionColumn()
  const slug = getRouterParams(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug parameter is required'
    })
  }

  try {
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
      WHERE p.session_slug = ? OR p.slug = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `

    const result = await query(sql, [slug, slug])
    const photosArray = Array.isArray(result) ? result : []

    if (photosArray.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `Session '${slug}' not found`
      })
    }

    // Process photos
    const photos: Photo[] = photosArray.map((photo: any) => ({
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

    const session: Session = {
      slug: slug,
      title: photos[0]?.title || slug,
      location: photos[0]?.location || 'Studio',
      date: photos[0]?.date_taken || '2025',
      photos: photos,
      totalPhotos: photos.length
    }

    return {
      success: true,
      data: session
    }
  } catch (error: any) {
    console.error('[Sessions API Error]', error.message)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch session'
    })
  }
})
