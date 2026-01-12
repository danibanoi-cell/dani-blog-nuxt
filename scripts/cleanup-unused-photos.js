/**
 * Cleanup Unused Photos Script
 * Removes all image files from public/foto-sito that are not referenced in the database
 */

import mysql from 'mysql2/promise'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

async function cleanupUnusedPhotos() {
  console.log('🔍 Starting cleanup of unused photos...\n')

  // Connect to database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'dani_portfolio'
  })

  try {
    // Get all filepaths from database
    const [photos] = await connection.execute('SELECT filepath FROM photos')
    const dbFiles = new Set(
      photos.map(p => p.filepath.replace('/foto-sito/', ''))
    )
    
    console.log(`📊 Photos in database: ${dbFiles.size}`)

    // Get all files in foto-sito directory
    const fotoSitoPath = path.join(projectRoot, 'public', 'foto-sito')
    const allFiles = await fs.readdir(fotoSitoPath)
    const imageFiles = allFiles.filter(f => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
    )
    
    console.log(`📁 Total image files in foto-sito: ${imageFiles.length}`)

    // Find unused files
    const unusedFiles = imageFiles.filter(f => !dbFiles.has(f))
    
    console.log(`🗑️  Unused files to delete: ${unusedFiles.length}\n`)

    if (unusedFiles.length === 0) {
      console.log('✅ No unused files found. Directory is clean!')
      return
    }

    // Delete unused files
    let deleted = 0
    for (const file of unusedFiles) {
      const filePath = path.join(fotoSitoPath, file)
      await fs.unlink(filePath)
      deleted++
      
      // Show progress
      if (deleted <= 10 || deleted % 50 === 0) {
        console.log(`   Deleted: ${file}`)
      }
    }
    
    console.log(`\n✅ Cleanup complete!`)
    console.log(`   Files deleted: ${deleted}`)
    console.log(`   Files remaining: ${imageFiles.length - deleted}`)

  } finally {
    await connection.end()
  }
}

// Run cleanup
cleanupUnusedPhotos().catch(console.error)
