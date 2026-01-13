import { requireAuth } from '../../utils/auth'
import { query } from '../../utils/db'
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const {
    title,
    slug,
    excerpt,
    location,
    date_taken,
    category,
    session_slug,
    filename,
    filepath,
    published,
    tags
  } = await readBody(event)

  if (!title || !filename || !filepath) {
    throw createError({
      statusCode: 400,
      message: 'Title, filename, and filepath are required'
    })
  }

  try {
    // Ensure session_slug column exists for grouping, if not created yet
    const columns: any = await query("SHOW COLUMNS FROM photos LIKE 'session_slug'")
    if (!Array.isArray(columns) || columns.length === 0) {
      await query("ALTER TABLE photos ADD COLUMN session_slug VARCHAR(255) NULL, ADD INDEX idx_session (session_slug)")
    }

    // Insert photo
    const result: any = await query(
      `INSERT INTO photos 
       (title, slug, excerpt, location, date_taken, category, session_slug, filename, filepath, published) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug || title.toLowerCase().replace(/\s+/g, '-'),
        excerpt || '',
        location || '',
        date_taken || null,
        category || '',
        session_slug || null,
        filename,
        filepath,
        published ? 1 : 0
      ]
    )

    const photoId = result.insertId

    // Insert tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        // Check if tag exists
        const existingTags: any = await query(
          'SELECT id FROM tags WHERE name = ?',
          [tagName]
        )

        let tagId
        if (Array.isArray(existingTags) && existingTags.length > 0) {
          tagId = existingTags[0].id
        } else {
          // Create new tag
          const tagResult: any = await query(
            'INSERT INTO tags (name, slug) VALUES (?, ?)',
            [tagName, tagName.toLowerCase().replace(/\s+/g, '-')]
          )
          tagId = tagResult.insertId
        }

        // Link tag to photo
        await query(
          'INSERT INTO photo_tags (photo_id, tag_id) VALUES (?, ?)',
          [photoId, tagId]
        )
      }
    }

    return {
      success: true,
      photoId,
      message: 'Photo created successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create photo'
    })
  }
})
