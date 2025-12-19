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

// Random number between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
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

async function uploadAliceSessions() {
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

    // Get all jpg files from source
    const allFiles = await fs.readdir(SOURCE_FOLDER)
    const jpgFiles = allFiles.filter(f => 
      f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg')
    )
    
    console.log(`Found ${jpgFiles.length} photos in Alice folder`)
    
    // Shuffle and pick random photos
    const shuffled = shuffle(jpgFiles)
    
    const sessions = [
      { name: 'alice-portrait-classic', count: randomInt(4, 10) },
      { name: 'alice-outdoor-light', count: randomInt(4, 10) },
      { name: 'alice-studio-session', count: randomInt(4, 10) },
      { name: 'alice-creative-shoot', count: randomInt(4, 10) },
      { name: 'alice-candid-moments', count: randomInt(4, 10) }
    ]

    let fileIndex = 0
    let totalUploaded = 0

    for (const session of sessions) {
      console.log(`\n📁 Creating session: ${session.name} (${session.count} photos)`)
      
      for (let i = 0; i < session.count && fileIndex < shuffled.length; i++, fileIndex++) {
        const sourceFile = shuffled[fileIndex]
        const sourcePath = path.join(SOURCE_FOLDER, sourceFile)
        
        // Create unique filename with timestamp to avoid conflicts
        const ext = path.extname(sourceFile)
        const timestamp = Date.now()
        const newFilename = `alice_${session.name}_${i + 1}_${timestamp}${ext}`
        const destPath = path.join(DEST_FOLDER, newFilename)
        
        try {
          // Copy file to public folder
          await fs.copyFile(sourcePath, destPath)
          
          // Generate title from session name
          const title = `Alice - ${session.name.replace(/alice-|-/g, ' ').replace(/\s+/g, ' ').trim()} ${i + 1}`
          const slug = `${session.name}-${i + 1}-${timestamp}`
          
          // Insert into database
          const [result] = await connection.execute(
            `INSERT INTO photos 
             (title, slug, excerpt, location, category, session_slug, filename, filepath, published) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              title,
              slug,
              'Professional portrait photography session with Alice',
              'Studio Verona',
              'Portrait',
              session.name,
              newFilename,
              `/foto-sito/${newFilename}`,
              1
            ]
          )
          
          console.log(`  ✓ ${sourceFile} → ${newFilename}`)
          totalUploaded++
        } catch (error) {
          console.error(`  ✗ Failed to upload ${sourceFile}:`, error.message)
        }
      }
    }

    console.log(`\n✅ Successfully uploaded ${totalUploaded} photos across ${sessions.length} sessions`)
    console.log('\nSessions created:')
    sessions.forEach(s => console.log(`  - ${s.name} (${s.count} photos)`))
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await connection.end()
  }
}

uploadAliceSessions()
