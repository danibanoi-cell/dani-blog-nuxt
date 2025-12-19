import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

const SOURCE_FOLDER = '/Volumes/TOSHIBA EXT/Lavori 2021/foto alice'
const DEST_FOLDER = path.join(projectRoot, 'public', 'foto-sito')

// Connect to MySQL
async function getConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'dani_portfolio'
  })
}

// Shuffle array
function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Album definitions with creative names
const albums = [
  { slug: 'alice-golden-hour', name: 'Golden Hour', photoCount: 25 },
  { slug: 'alice-studio-elegance', name: 'Studio Elegance', photoCount: 30 },
  { slug: 'alice-natural-light', name: 'Natural Light', photoCount: 28 },
  { slug: 'alice-portrait-series', name: 'Portrait Series', photoCount: 35 },
  { slug: 'alice-creative-expressions', name: 'Creative Expressions', photoCount: 22 },
  { slug: 'alice-candid-moments', name: 'Candid Moments', photoCount: 20 },
  { slug: 'alice-black-white', name: 'Black & White', photoCount: 18 },
  { slug: 'alice-outdoor-session', name: 'Outdoor Session', photoCount: 32 },
  { slug: 'alice-fashion-shoot', name: 'Fashion Shoot', photoCount: 27 },
  { slug: 'alice-intimate-portraits', name: 'Intimate Portraits', photoCount: 24 },
  { slug: 'alice-sunset-vibes', name: 'Sunset Vibes', photoCount: 26 },
  { slug: 'alice-urban-style', name: 'Urban Style', photoCount: 29 },
  { slug: 'alice-spring-session', name: 'Spring Session', photoCount: 23 },
  { slug: 'alice-artistic-vision', name: 'Artistic Vision', photoCount: 21 },
  { slug: 'alice-classic-beauty', name: 'Classic Beauty', photoCount: 30 },
]

async function uploadAllAliceAlbums() {
  const connection = await getConnection()
  
  try {
    // Ensure session_slug column exists
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM photos LIKE 'session_slug'"
    )
    if (columns.length === 0) {
      console.log('Creating session_slug column...')
      await connection.execute(
        "ALTER TABLE photos ADD COLUMN session_slug VARCHAR(255) NULL, ADD INDEX idx_session (session_slug)"
      )
    }

    // Get all image files from source
    const allFiles = await fs.readdir(SOURCE_FOLDER)
    const imageFiles = allFiles.filter(f => {
      const lower = f.toLowerCase()
      return (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) && !lower.endsWith('.dng')
    })
    
    console.log(`\n📸 Found ${imageFiles.length} photos in Alice folder`)
    console.log(`📁 Creating ${albums.length} albums with ${albums.reduce((sum, a) => sum + a.photoCount, 0)} total photos\n`)
    
    // Shuffle all photos randomly
    const shuffled = shuffle(imageFiles)
    
    let fileIndex = 0
    let totalUploaded = 0
    let totalFailed = 0

    for (const album of albums) {
      console.log(`\n📁 Album: ${album.name} (${album.photoCount} photos)`)
      
      let uploadedInAlbum = 0
      
      for (let i = 0; i < album.photoCount && fileIndex < shuffled.length; i++, fileIndex++) {
        const sourceFile = shuffled[fileIndex]
        const sourcePath = path.join(SOURCE_FOLDER, sourceFile)
        
        // Create unique filename
        const ext = path.extname(sourceFile)
        const timestamp = Date.now() + i // Add i to avoid same timestamp
        const newFilename = `alice_${album.slug}_${i + 1}_${timestamp}${ext}`
        const destPath = path.join(DEST_FOLDER, newFilename)
        
        try {
          // Copy file to public folder
          await fs.copyFile(sourcePath, destPath)
          
          // Generate title
          const title = `Alice - ${album.name} ${i + 1}`
          const slug = `${album.slug}-${i + 1}-${timestamp}`
          
          // Insert into database
          await connection.execute(
            `INSERT INTO photos 
             (title, slug, excerpt, location, category, session_slug, filename, filepath, published) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              title,
              slug,
              `Professional portrait from ${album.name} session with Alice`,
              'Studio Verona',
              'Portrait',
              album.slug,
              newFilename,
              `/foto-sito/${newFilename}`,
              1
            ]
          )
          
          uploadedInAlbum++
          totalUploaded++
          
          // Show progress every 5 photos
          if (uploadedInAlbum % 5 === 0) {
            process.stdout.write(`  ✓ ${uploadedInAlbum}/${album.photoCount} `)
          }
          
        } catch (error) {
          console.error(`\n  ✗ Failed: ${sourceFile} - ${error.message}`)
          totalFailed++
        }
      }
      
      console.log(`\n  ✅ Completed: ${uploadedInAlbum} photos uploaded`)
      
      if (fileIndex >= shuffled.length) {
        console.log(`\n⚠️  Ran out of source photos. Uploaded ${totalUploaded} photos across ${albums.indexOf(album) + 1} albums.`)
        break
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log(`✅ Upload Complete!`)
    console.log(`   Total photos uploaded: ${totalUploaded}`)
    console.log(`   Total failures: ${totalFailed}`)
    console.log(`   Albums created: ${albums.filter((_, i) => i * albums[i]?.photoCount < totalUploaded).length}`)
    console.log(`${'='.repeat(60)}\n`)
    
    // Show album summary
    console.log('📚 Album Summary:')
    const [rows] = await connection.execute(
      `SELECT session_slug, COUNT(*) as count 
       FROM photos 
       WHERE session_slug IS NOT NULL 
       GROUP BY session_slug 
       ORDER BY session_slug`
    )
    rows.forEach(row => {
      const album = albums.find(a => a.slug === row.session_slug)
      console.log(`  ${album?.name || row.session_slug}: ${row.count} photos`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await connection.end()
  }
}

uploadAllAliceAlbums()
