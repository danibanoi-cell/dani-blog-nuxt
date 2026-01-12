/**
 * Create 5 Alice Albums with 5 Photos Each
 * Selects diverse photos and uploads them to database with proper session organization
 */

import mysql from 'mysql2/promise'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

// Album definitions with creative names
const ALBUMS = [
  {
    slug: 'alice-portrait-elegance',
    title: 'Portrait Elegance',
    location: 'Verona Studio',
    category: 'Portrait',
    excerpt: 'Elegant studio portraits capturing refined beauty'
  },
  {
    slug: 'alice-natural-light',
    title: 'Natural Light',
    location: 'Verona',
    category: 'Portrait',
    excerpt: 'Soft natural lighting for authentic moments'
  },
  {
    slug: 'alice-editorial-style',
    title: 'Editorial Style',
    location: 'Verona',
    category: 'Editorial',
    excerpt: 'Fashion-forward editorial photography'
  },
  {
    slug: 'alice-candid-moments',
    title: 'Candid Moments',
    location: 'Verona',
    category: 'Portrait',
    excerpt: 'Spontaneous and genuine expressions'
  },
  {
    slug: 'alice-creative-portraits',
    title: 'Creative Portraits',
    location: 'Verona Studio',
    category: 'Portrait',
    excerpt: 'Artistic and creative portrait compositions'
  }
]

async function getConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'dani_portfolio'
  })
}

async function getAlicePhotos() {
  const sourceDir = '/Volumes/TOSHIBA EXT/Lavori 2021/foto alice'
  const files = await fs.readdir(sourceDir)
  
  // Get only JPG files, filter out duplicates and small files
  const jpgFiles = files.filter(f => 
    /\.(jpg|jpeg)$/i.test(f) && 
    !f.includes('_1.') &&  // Skip numbered duplicates
    !f.includes('_2.') &&
    !f.startsWith('.')     // Skip hidden files
  )
  
  // Shuffle array for diversity
  const shuffled = jpgFiles.sort(() => Math.random() - 0.5)
  
  return shuffled
}

async function copyPhotoToPublic(sourceFile, destinationName) {
  const sourceDir = '/Volumes/TOSHIBA EXT/Lavori 2021/foto alice'
  const sourcePath = path.join(sourceDir, sourceFile)
  const destPath = path.join(projectRoot, 'public', 'foto-sito', destinationName)
  
  await fs.copyFile(sourcePath, destPath)
  return `/foto-sito/${destinationName}`
}

async function createAlbums() {
  console.log('🎨 Creating 5 Alice Albums with 5 Photos Each\n')
  
  const connection = await getConnection()
  
  try {
    // Get available photos
    const allPhotos = await getAlicePhotos()
    console.log(`📷 Found ${allPhotos.length} available photos\n`)
    
    if (allPhotos.length < 25) {
      throw new Error('Not enough photos available')
    }
    
    // Clear existing Alice photos to avoid conflicts
    console.log('🧹 Cleaning existing Alice photos...')
    await connection.execute(
      "DELETE FROM photos WHERE session_slug LIKE 'alice-%'"
    )
    console.log('✅ Cleaned\n')
    
    let photoIndex = 0
    let totalUploaded = 0
    
    // Create each album
    for (const album of ALBUMS) {
      console.log(`📂 Creating album: ${album.title}`)
      console.log(`   Slug: ${album.slug}`)
      
      // Select 5 diverse photos for this album
      const albumPhotos = allPhotos.slice(photoIndex, photoIndex + 5)
      photoIndex += 5
      
      for (let i = 0; i < albumPhotos.length; i++) {
        const sourceFile = albumPhotos[i]
        const timestamp = Date.now()
        const photoNum = i + 1
        
        // Create unique filename
        const ext = path.extname(sourceFile).toLowerCase()
        const destName = `alice_${album.slug}_${photoNum}_${timestamp}${ext}`
        
        // Copy photo to public folder
        const filepath = await copyPhotoToPublic(sourceFile, destName)
        
        // Generate slug for individual photo
        const photoSlug = `${album.slug}-${photoNum}`
        
        // Insert into database
        await connection.execute(
          `INSERT INTO photos 
           (title, slug, excerpt, location, date_taken, category, session_slug, filename, filepath, published) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `${album.title} ${photoNum}`,
            photoSlug,
            album.excerpt,
            album.location,
            '2024',
            album.category,
            album.slug,
            destName,
            filepath,
            1
          ]
        )
        
        totalUploaded++
        console.log(`   ✓ Photo ${photoNum}: ${sourceFile} → ${destName}`)
      }
      
      console.log(`✅ Album "${album.title}" created with 5 photos\n`)
    }
    
    console.log(`\n🎉 Success!`)
    console.log(`   Albums created: ${ALBUMS.length}`)
    console.log(`   Photos uploaded: ${totalUploaded}`)
    console.log(`\n📊 View albums at:`)
    ALBUMS.forEach(album => {
      console.log(`   http://localhost:3000/session/${album.slug}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await connection.end()
  }
}

// Run the script
createAlbums().catch(console.error)
