import { requireAuth } from '../../utils/auth'
import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Photo ID is required'
    })
  }

  const {
    title,
    slug,
    excerpt,
    location,
    date_taken,
    category,
    published,
    tags
  } = await readBody(event)

  try {
    // Update photo
    await query(
      `UPDATE photos 
       SET title = ?, slug = ?, excerpt = ?, location = ?, date_taken = ?, category = ?, published = ?
       WHERE id = ?`,
      [
        title,
        slug || title.toLowerCase().replace(/\s+/g, '-'),
        excerpt || '',
        location || '',
        date_taken || null,
        category || '',
        published ? 1 : 0,
        id
      ]
    )

    // Update tags if provided
    if (tags && Array.isArray(tags)) {
      // Remove existing tag associations
      await query('DELETE FROM photo_tags WHERE photo_id = ?', [id])

      // Add new tags
      for (const tagName of tags) {
        const existingTags: any = await query(
          'SELECT id FROM tags WHERE name = ?',
          [tagName]
        )

        let tagId
        if (Array.isArray(existingTags) && existingTags.length > 0) {
          tagId = existingTags[0].id
        } else {
          const tagResult: any = await query(
            'INSERT INTO tags (name, slug) VALUES (?, ?)',
            [tagName, tagName.toLowerCase().replace(/\s+/g, '-')]
          )
          tagId = tagResult.insertId
        }

        await query(
          'INSERT INTO photo_tags (photo_id, tag_id) VALUES (?, ?)',
          [id, tagId]
        )
      }
    }

    return {
      success: true,
      message: 'Photo updated successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update photo'
    })
  }
})
