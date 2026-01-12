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
  console.log('🔧 Creating albums structure...\n')

  // Step 1: Check and add missing columns
  console.log('📋 Checking database schema...')
  
  const [columns] = await pool.query("SHOW COLUMNS FROM photos")
  const columnNames = columns.map(col => col.Field)
  
  if (!columnNames.includes('session_slug')) {
    console.log('➕ Adding session_slug column...')
    await pool.query(`
      ALTER TABLE photos 
      ADD COLUMN session_slug VARCHAR(255) NULL,
      ADD INDEX idx_session (session_slug)
    `)
  }
  
  if (!columnNames.includes('location')) {
    console.log('➕ Adding location column...')
    await pool.query(`ALTER TABLE photos ADD COLUMN location VARCHAR(255) DEFAULT 'Studio'`)
  }
  
  if (!columnNames.includes('date_taken')) {
    console.log('➕ Adding date_taken column...')
    await pool.query(`ALTER TABLE photos ADD COLUMN date_taken VARCHAR(100) DEFAULT '2025'`)
  }

  // Step 2: Get all photos
  const [photos] = await pool.query('SELECT id, title, filepath FROM photos WHERE published = 1 ORDER BY id')
  
  if (photos.length === 0) {
    console.log('❌ No photos found in database')
    await pool.end()
    process.exit(1)
  }

  console.log(`\n✓ Found ${photos.length} photos`)
  
  // Step 3: Divide photos into 3 albums
  const photosPerAlbum = Math.ceil(photos.length / 3)
  
  const albums = [
    {
      slug: 'verona-streets',
      title: 'Verona Streets',
      location: 'Verona',
      date: '2024 · Urban',
      photos: photos.slice(0, photosPerAlbum)
    },
    {
      slug: 'valpolicella-landscapes',
      title: 'Valpolicella Landscapes',
      location: 'Valpolicella',
      date: '2024 · Nature',
      photos: photos.slice(photosPerAlbum, photosPerAlbum * 2)
    },
    {
      slug: 'lago-di-garda',
      title: 'Lago di Garda',
      location: 'Lago di Garda',
      date: '2024 · Travel',
      photos: photos.slice(photosPerAlbum * 2)
    }
  ]

  // Step 4: Update photos with album data
  let updated = 0
  
  for (const album of albums) {
    console.log(`\n📸 Creating album: ${album.title}`)
    console.log(`   Location: ${album.location}`)
    console.log(`   Photos: ${album.photos.length}`)
    
    for (const photo of album.photos) {
      try {
        await pool.query(`
          UPDATE photos 
          SET session_slug = ?,
              location = ?,
              date_taken = ?
          WHERE id = ?
        `, [album.slug, album.location, album.date, photo.id])
        
        console.log(`   ✓ Updated photo ID ${photo.id}`)
        updated++
      } catch (err) {
        console.error(`   ✗ Error updating photo ID ${photo.id}:`, err.message)
      }
    }
  }

  console.log(`\n✅ Successfully created 3 albums with ${updated} photos`)
  console.log('\n📊 Album Summary:')
  for (const album of albums) {
    console.log(`   • ${album.title}: ${album.photos.length} photos (${album.slug})`)
  }

} catch (error) {
  console.error('❌ Error:', error.message)
  console.error(error.stack)
  process.exit(1)
} finally {
  await pool.end()
}
