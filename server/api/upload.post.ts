import { requireAuth } from '../utils/auth'
import formidable from 'formidable'
import type { Fields, Files } from 'formidable'
import { promises as fs } from 'fs'
import { join, basename } from 'path'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const uploadDir = join(process.cwd(), 'public', 'foto-sito')

  // Ensure upload directory exists
  try {
    await fs.access(uploadDir)
  } catch {
    await fs.mkdir(uploadDir, { recursive: true })
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    filename: (name: string, ext: string, part: any) => {
      // Generate unique filename
      const timestamp = Date.now()
      const originalName = part.originalFilename || 'photo'
      const cleanName = originalName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '')
      return `${timestamp}_${cleanName}`
    }
  })

  try {
    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(event.node.req, (err: any, fields: Fields, files: Files) => {
        if (err) reject(err)
        else resolve([fields, files])
      })
    })

    const uploadedFile = Array.isArray(files.photo) ? files.photo[0] : files.photo

    if (!uploadedFile) {
      throw createError({
        statusCode: 400,
        message: 'No file uploaded'
      })
    }

    const filename = basename(uploadedFile.filepath)
    const filepath = `/foto-sito/${filename}`

    return {
      success: true,
      filename,
      filepath,
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'File upload failed'
    })
  }
})
