import { defineEventHandler, getRequestHeaders, readBody } from 'h3'
import Database from 'better-sqlite3'
import { join } from 'path'

const dbPath = join(process.cwd(), 'database', 'analytics.db')

// Initialize analytics database
function getAnalyticsDb() {
  const db = new Database(dbPath)
  
  // Create analytics table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      page TEXT NOT NULL,
      user_agent TEXT,
      referer TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  return db
}

export default defineEventHandler(async (event) => {
  const db = getAnalyticsDb()
  
  try {
    // Get visitor information
    const headers = getRequestHeaders(event)
    const body = await readBody(event)
    
    const ip = headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown'
    const userAgent = headers['user-agent'] || 'unknown'
    const referer = headers['referer'] || headers['referrer'] || 'direct'
    const page = body?.page || '/'
    
    // Insert visit record
    const stmt = db.prepare(`
      INSERT INTO visits (ip, page, user_agent, referer)
      VALUES (?, ?, ?, ?)
    `)
    
    stmt.run(ip, page, userAgent, referer)
    
    return {
      success: true,
      message: 'Visit tracked'
    }
  } catch (error: any) {
    console.error('Analytics tracking error:', error)
    return {
      success: false,
      message: error.message
    }
  } finally {
    db.close()
  }
})
