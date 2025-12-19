import { query } from '../../utils/db'

async function ensureSessionColumn() {
  // Check if session_slug column exists; add if missing
  const columns: any = await query("SHOW COLUMNS FROM photos LIKE 'session_slug'")
  if (!Array.isArray(columns) || columns.length === 0) {
    await query("ALTER TABLE photos ADD COLUMN session_slug VARCHAR(255) NULL, ADD INDEX idx_session (session_slug)")
  }
}

export default defineEventHandler(async () => {
  await ensureSessionColumn()

  // Return one cover photo per session + count
  // Use latest created_at as cover
  const sessions: any = await query(`
    SELECT p.* , x.photo_count
    FROM photos p
    INNER JOIN (
      SELECT session_slug, MAX(created_at) as latest_created, COUNT(*) as photo_count
      FROM photos
      WHERE session_slug IS NOT NULL AND session_slug <> '' AND published = 1
      GROUP BY session_slug
    ) x ON x.session_slug = p.session_slug AND x.latest_created = p.created_at
    WHERE p.published = 1 AND p.session_slug IS NOT NULL AND p.session_slug <> ''
    ORDER BY p.created_at DESC
  `)

  // Normalize tags to arrays if joined in future; currently not joined here
  const data = Array.isArray(sessions) ? sessions.map((s: any) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    session_slug: s.session_slug,
    excerpt: s.excerpt,
    location: s.location,
    date_taken: s.date_taken,
    category: s.category,
    filename: s.filename,
    filepath: s.filepath,
    published: s.published,
    created_at: s.created_at,
    photo_count: s.photo_count
  })) : []

  return { success: true, sessions: data }
})
