import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const published = queryParams.published !== 'false' // Default to true

  try {
    const sql = `
      SELECT 
        p.id, 
        p.title, 
        p.slug, 
        p.excerpt, 
        p.location, 
        p.date_taken, 
        p.category, 
        p.session_slug,
        p.filename, 
        p.filepath, 
        p.published, 
        p.created_at,
        GROUP_CONCAT(t.name) as tags
      FROM photos p
      LEFT JOIN photo_tags pt ON p.id = pt.photo_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      ${published ? 'WHERE p.published = 1' : ''}
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `

    const photos = await query(sql)

    // Parse tags string into array
    const formattedPhotos = Array.isArray(photos) 
      ? photos.map((photo: any) => ({
          ...photo,
          tags: photo.tags ? photo.tags.split(',') : []
        }))
      : []

    return {
      success: true,
      photos: formattedPhotos
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch photos'
    })
  }
})
