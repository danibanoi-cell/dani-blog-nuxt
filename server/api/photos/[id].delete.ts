import { requireAuth } from '../../utils/auth'
import { query } from '../../utils/db'
import { promises as fs } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Photo ID is required'
    })
  }

  try {
    // Get photo details to delete file
    const photos: any = await query(
      'SELECT filepath FROM photos WHERE id = ?',
      [id]
    )

    if (!Array.isArray(photos) || photos.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Photo not found'
      })
    }

    const photo = photos[0]

    // Delete photo record and tags (cascade will handle photo_tags)
    await query('DELETE FROM photo_tags WHERE photo_id = ?', [id])
    await query('DELETE FROM photos WHERE id = ?', [id])

    // Delete physical file
    if (photo.filepath) {
      const fullPath = join(process.cwd(), 'public', photo.filepath)
      try {
        await fs.unlink(fullPath)
      } catch (err) {
        console.error('Failed to delete file:', err)
        // Continue even if file deletion fails
      }
    }

    return {
      success: true,
      message: 'Photo deleted successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete photo'
    })
  }
})
