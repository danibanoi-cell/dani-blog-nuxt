import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = await mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dani_portfolio',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

try {
  console.log('🔧 Fixing photo paths...\n')

  // Get all photos with filepath containing '/public'
  const [photos] = await pool.query(
    `SELECT id, filepath FROM photos WHERE filepath LIKE '%/public%'`
  )

  if (photos.length === 0) {
    console.log('✓ No photos with /public prefix found')
    await pool.end()
    process.exit(0)
  }

  console.log(`Found ${photos.length} photos to fix\n`)

  let updated = 0
  for (const photo of photos) {
    const oldPath = photo.filepath
    // Rimuovi '/public' dal percorso
    const newPath = oldPath.replace(/^\/public/, '').replace(/\/public\//, '/')
    
    try {
      const [result] = await pool.query(
        `UPDATE photos SET filepath = ? WHERE id = ?`,
        [newPath, photo.id]
      )
      
      if (result.affectedRows > 0) {
        console.log(`✓ ID ${photo.id}`)
        console.log(`  ${oldPath}`)
        console.log(`  → ${newPath}\n`)
        updated++
      }
    } catch (err) {
      console.error(`✗ Error updating ID ${photo.id}:`, err.message)
    }
  }

  console.log(`\n✅ Updated ${updated}/${photos.length} photo paths`)
} catch (error) {
  console.error('❌ Errore:', error.message)
  process.exit(1)
} finally {
  await pool.end()
}