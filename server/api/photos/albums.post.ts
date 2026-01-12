import { requireAuth } from '../../utils/auth'
import { query } from '../../utils/db'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const uploadDir = path.resolve('./public/uploads')
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

  const form = formidable({ multiples: true, uploadDir, keepExtensions: true })

  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })

  // `formidable` may return field values as string or array of strings.
  // Coerce to string safely to avoid runtime errors (e.g. calling toLowerCase on non-string).
  const coerceField = (v: any) => {
    if (v == null) return ''
    if (Array.isArray(v)) return String(v[0])
    return String(v)
  }

  const name = coerceField((fields as any).name)
  const description = coerceField((fields as any).description)
  const tags = coerceField((fields as any).tags)

  // Normalize files object from formidable. Field names coming from the client
  // may include bracketed indices (e.g. additionalFiles[0]) so normalize to
  // a consistent structure: `firstFile` (single) and `additionalFiles` (array).
  const fileObjs: Record<string, any> = (files as any) || {}

  // Helper to flatten a value (could be array or single file)
  const flattenFiles = (v: any) => {
    if (!v) return []
    return Array.isArray(v) ? v : [v]
  }

  // Attempt to find the primary firstFile
  let firstFile = fileObjs.firstFile || null
  if (!firstFile) {
    for (const k of Object.keys(fileObjs)) {
      if (k === 'firstFile' || k.startsWith('firstFile')) {
        firstFile = fileObjs[k]
        break
      }
    }
  }
  // If it's an array, take first
  if (Array.isArray(firstFile)) firstFile = firstFile[0]

  // Collect additionalFiles from any keys that start with 'additionalFiles'
  let additionalFiles: any[] = []
  if (fileObjs.additionalFiles) {
    additionalFiles = flattenFiles(fileObjs.additionalFiles)
  }
  for (const k of Object.keys(fileObjs)) {
    if (k.startsWith('additionalFiles')) {
      additionalFiles.push(...flattenFiles(fileObjs[k]))
    }
  }

  // Basic validation with clearer error messages
  if (!name || name.trim() === '') {
    throw createError({ statusCode: 400, message: 'Album name is required' })
  }

  if (!firstFile) {
    throw createError({ statusCode: 400, message: 'First file (video or image) is required' })
  }

  // Helper: check extension-based image/video types (best-effort)
  const getExt = (fn: string | undefined) => (fn ? fn.split('.').pop()?.toLowerCase() || '' : '')
  const isImageExt = (ext: string) => ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'avif'].includes(ext)
  const isVideoExt = (ext: string) => ['mp4', 'mov', 'm4v', 'webm', 'mkv', 'avi'].includes(ext)

  const safeOriginalName = (f: any) => (f && (f.originalFilename || f.newFilename) ? String(f.originalFilename || f.newFilename) : '')

  // Validate additional files are images
  if (additionalFiles) {
    const arr = Array.isArray(additionalFiles) ? additionalFiles : [additionalFiles]
    for (const f of arr) {
      const ext = getExt(safeOriginalName(f))
      if (ext && !isImageExt(ext)) {
        throw createError({ statusCode: 400, message: `Additional file '${safeOriginalName(f)}' is not a supported image` })
      }
      if (!f.filepath) {
        throw createError({ statusCode: 400, message: `Uploaded file '${safeOriginalName(f)}' missing temporary filepath` })
      }
    }
  }

  try {
    // Ensure session_slug column exists (dynamic migration)
    const columns = await query("SHOW COLUMNS FROM photos LIKE 'session_slug'")
    if (!Array.isArray(columns) || columns.length === 0) {
      await query("ALTER TABLE photos ADD COLUMN session_slug VARCHAR(255) NULL, ADD INDEX idx_session (session_slug)")
    }

    // Generate session_slug from album name (ensure no error when name is empty)
    const rawName = name || ''
    const sessionSlug = rawName
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    // Helper to move uploaded file to public path and return public URL
    const moveFile = (file: any) => {
      if (!file || !file.filepath || !file.newFilename) {
        throw new Error('Invalid uploaded file object')
      }
      const target = path.join(uploadDir, file.newFilename)
      try {
        fs.renameSync(file.filepath, target)
      } catch (e) {
        // If moving fails, throw a descriptive error
        throw new Error(`Failed to move uploaded file '${file.newFilename}': ${e?.message || e}`)
      }
      // Return web-accessible path
      return `/uploads/${file.newFilename}`
    }

    // Helper to generate a unique slug from title/filename
    const generateSlug = (base: string) => {
      let slug = String(base || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      if (!slug) slug = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      return slug
    }

    // First file (treat as possible video or image)
    const firstPath = moveFile(firstFile)
    const firstTitle = firstFile.originalFilename || name
    const firstSlug = generateSlug(firstTitle)
    await query('INSERT INTO photos (title, slug, filename, filepath, session_slug, published) VALUES (?, ?, ?, ?, ?, ?)', [firstTitle, firstSlug, firstFile.newFilename, firstPath, sessionSlug, 0])

    // Additional files (images)
    if (additionalFiles) {
      const arr = Array.isArray(additionalFiles) ? additionalFiles : [additionalFiles]
      for (const f of arr) {
        const p = moveFile(f)
        const title = f.originalFilename || ''
        const slug = generateSlug(title || f.newFilename)
        await query('INSERT INTO photos (title, slug, filename, filepath, session_slug, published) VALUES (?, ?, ?, ?, ?, ?)', [title, slug, f.newFilename, p, sessionSlug, 0])
      }
    }

    // Tags for photos (associate with all photos in the session)
    if (tags) {
      const tagsArray = tags.split(',').map((t) => t.trim()).filter(Boolean)
      // Get the photo IDs we just inserted
      const photos = await query('SELECT id FROM photos WHERE session_slug = ? ORDER BY id DESC LIMIT ?', [sessionSlug, (additionalFiles ? (Array.isArray(additionalFiles) ? additionalFiles.length : 1) : 0) + 1])
      
      for (const photo of photos) {
        for (const tagName of tagsArray) {
          const existing: any = await query('SELECT id FROM tags WHERE name = ?', [tagName])
          let tagId
          if (Array.isArray(existing) && existing.length > 0) {
            tagId = existing[0].id
          } else {
            // Compute a safe slug; ensure it's non-empty to satisfy NOT NULL constraint
            let slug = String(tagName || '')
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')
            if (!slug) {
              // Fallback: use a simpler ascii-safe replacement or timestamp
              slug = String(tagName || '').replace(/\s+/g, '-').replace(/[^A-Za-z0-9-]/g, '') || `tag-${Date.now()}`
            }
            try {
              const r: any = await query('INSERT INTO tags (name, slug) VALUES (?, ?)', [tagName, slug])
              tagId = r.insertId
            } catch (e: any) {
              // If insert failed (race condition or schema), attempt to select again
              const recheck: any = await query('SELECT id FROM tags WHERE name = ? OR slug = ?', [tagName, slug])
              if (Array.isArray(recheck) && recheck.length > 0) tagId = recheck[0].id
              else throw e
            }
          }
          await query('INSERT INTO photo_tags (photo_id, tag_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE photo_id=photo_id', [photo.id, tagId])
        }
      }
    }

    return { success: true, sessionSlug }
  } catch (err: any) {
    throw createError({ statusCode: 500, message: err.message || 'Failed to create album' })
  }
})
