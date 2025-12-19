import { query } from '../../utils/db'

async function ensureSessionColumn() {
  const columns: any = await query("SHOW COLUMNS FROM photos LIKE 'session_slug'")
  if (!Array.isArray(columns) || columns.length === 0) {
    await query("ALTER TABLE photos ADD COLUMN session_slug VARCHAR(255) NULL, ADD INDEX idx_session (session_slug)")
  }
}

export default defineEventHandler(async (event) => {
  await ensureSessionColumn()
  const { slug } = event.context.params as { slug: string }

  // First try to fetch by session_slug
  const photosBySession: any = await query(
    `SELECT p.* FROM photos p WHERE p.published = 1 AND p.session_slug = ? ORDER BY p.created_at DESC`,
    [slug]
  )

  if (Array.isArray(photosBySession) && photosBySession.length > 0) {
    return { success: true, photos: photosBySession, session: { slug } }
  }

  // Fallback: if no session matches, return single photo by slug (for compatibility)
  const single: any = await query(
    `SELECT p.* FROM photos p WHERE p.published = 1 AND p.slug = ? LIMIT 1`,
    [slug]
  )

  if (Array.isArray(single) && single.length > 0) {
    return { success: true, photos: single, session: { slug: null } }
  }

  return { success: true, photos: [], session: { slug } }
})
