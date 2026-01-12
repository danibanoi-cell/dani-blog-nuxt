#!/usr/bin/env node
// Normalize photo.filepath values in the database to web-accessible paths
// Converts any filepath containing 'public/uploads' -> '/uploads/<filename>'
// and 'public/foto-sito' -> '/foto-sito/<filename>'

import mysql from 'mysql2/promise'
const { env } = process

const config = {
  host: env.DB_HOST || 'localhost',
  user: env.DB_USER || 'root',
  password: env.DB_PASSWORD || '',
  database: env.DB_NAME || 'dani_portfolio',
}

async function run() {
  const pool = mysql.createPool({ ...config, connectionLimit: 5 })
  const conn = await pool.getConnection()
  try {
    console.log('Checking photos with filesystem paths...')

    // Update paths that contain public/uploads
    const [res1] = await conn.query(
      "SELECT id, filepath FROM photos WHERE filepath LIKE '%public/uploads/%' OR filepath LIKE '%/public/uploads/%'"
    )

    for (const row of res1) {
      const parts = row.filepath.split('public/uploads/')
      const filename = parts[parts.length - 1]
      const newPath = `/uploads/${filename}`
      console.log(`Updating id=${row.id} -> ${newPath}`)
      await conn.query('UPDATE photos SET filepath = ? WHERE id = ?', [newPath, row.id])
    }

    // Update paths that contain public/foto-sito
    const [res2] = await conn.query(
      "SELECT id, filepath FROM photos WHERE filepath LIKE '%public/foto-sito/%' OR filepath LIKE '%/public/foto-sito/%'"
    )

    for (const row of res2) {
      const parts = row.filepath.split('public/foto-sito/')
      const filename = parts[parts.length - 1]
      const newPath = `/foto-sito/${filename}`
      console.log(`Updating id=${row.id} -> ${newPath}`)
      await conn.query('UPDATE photos SET filepath = ? WHERE id = ?', [newPath, row.id])
    }

    // Also fix any leading './public/' cases
    const [res3] = await conn.query(
      "SELECT id, filepath FROM photos WHERE filepath LIKE './public/%' OR filepath LIKE '%\\\public\\\%'")

    for (const row of res3) {
      let fp = row.filepath
      // Normalize backslashes
      fp = fp.replace(/\\/g, '/')
      if (fp.includes('public/uploads/')) {
        const filename = fp.split('public/uploads/').pop()
        const newPath = `/uploads/${filename}`
        console.log(`Updating id=${row.id} -> ${newPath}`)
        await conn.query('UPDATE photos SET filepath = ? WHERE id = ?', [newPath, row.id])
      } else if (fp.includes('public/foto-sito/')) {
        const filename = fp.split('public/foto-sito/').pop()
        const newPath = `/foto-sito/${filename}`
        console.log(`Updating id=${row.id} -> ${newPath}`)
        await conn.query('UPDATE photos SET filepath = ? WHERE id = ?', [newPath, row.id])
      }
    }

    console.log('Normalization complete.')
  } catch (err) {
    console.error('Error while normalizing filepaths:', err)
  } finally {
    conn.release()
    pool.end()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
