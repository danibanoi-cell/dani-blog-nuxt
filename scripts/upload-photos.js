import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import jwt from 'jsonwebtoken'
import mysql from 'mysql2/promise'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

// Get JWT token for authenticated requests
function generateToken(userId, email) {
  const jwtSecret = process.env.JWT_SECRET || 'dani_blog_secret_jwt_key_2024_change_in_production'
  return jwt.sign(
    { userId, email },
    jwtSecret,
    { expiresIn: '7d' }
  )
}

// Connect to MySQL
async function getConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'dani_portfolio'
  })
}

async function uploadPhotos() {
  const connection = await getConnection()
  const fotoSitoDir = path.join(projectRoot, 'public', 'foto-sito')
  
  try {
    // Get all jpg files
    const files = await fs.readdir(fotoSitoDir)
    const jpgFiles = files
      .filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg'))
      .sort()
      .slice(0, 30)

    console.log(`Found ${jpgFiles.length} photos to upload`)

    // Get or create tag "Blue"
    const [existingTags] = await connection.execute(
      'SELECT id FROM tags WHERE name = ?',
      ['Blue']
    )
    
    let tagId
    if (existingTags.length > 0) {
      tagId = existingTags[0].id
      console.log('Using existing Blue tag')
    } else {
      const [result] = await connection.execute(
        'INSERT INTO tags (name, slug) VALUES (?, ?)',
        ['Blue', 'blue']
      )
      tagId = result.insertId
      console.log('Created new Blue tag')
    }

    let uploadedCount = 0

    // Upload each photo
    for (const filename of jpgFiles) {
      const title = filename.replace(/\.(jpg|jpeg)$/i, '').replace(/^\d+/, '').trim() || `Photo ${uploadedCount + 1}`
      const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      // Check if photo already exists
      const [existing] = await connection.execute(
        'SELECT id FROM photos WHERE filename = ?',
        [filename]
      )

      if (existing.length > 0) {
        console.log(`⊘ Skipped: ${filename} (already exists)`)
        continue
      }

      // Insert photo
      const [result] = await connection.execute(
        `INSERT INTO photos 
         (title, slug, excerpt, location, category, filename, filepath, published) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title || filename,
          slug || filename,
          'Photography from the Alice collection',
          'Studio',
          'Portrait',
          filename,
          `/foto-sito/${filename}`,
          1
        ]
      )

      const photoId = result.insertId

      // Link to Blue tag
      await connection.execute(
        'INSERT INTO photo_tags (photo_id, tag_id) VALUES (?, ?)',
        [photoId, tagId]
      )

      console.log(`✓ Uploaded: ${filename}`)
      uploadedCount++
    }

    console.log(`\n✅ Successfully uploaded ${uploadedCount} photos`)
  } catch (error) {
    console.error('Error uploading photos:', error)
  } finally {
    await connection.end()
  }
}

uploadPhotos()
