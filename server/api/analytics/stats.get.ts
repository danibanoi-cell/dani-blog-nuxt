import { defineEventHandler, getRequestHeaders } from 'h3'
import Database from 'better-sqlite3'
import { join } from 'path'
import jwt from 'jsonwebtoken'

const dbPath = join(process.cwd(), 'database', 'analytics.db')
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

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
  // Verify admin authentication
  const headers = getRequestHeaders(event)
  const authHeader = headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      message: 'Unauthorized'
    }
  }
  
  const token = authHeader.substring(7)
  
  try {
    jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return {
      success: false,
      message: 'Invalid token'
    }
  }
  
  const db = getAnalyticsDb()
  
  try {
    // Get total visits (last 30 days)
    const totalVisits = db.prepare(`
      SELECT COUNT(*) as count 
      FROM visits 
      WHERE timestamp >= datetime('now', '-30 days')
    `).get() as { count: number }
    
    // Get unique visitors (distinct IPs, last 30 days)
    const uniqueVisitors = db.prepare(`
      SELECT COUNT(DISTINCT ip) as count 
      FROM visits 
      WHERE timestamp >= datetime('now', '-30 days')
    `).get() as { count: number }
    
    // Get page views (total clicks)
    const pageViews = db.prepare(`
      SELECT COUNT(*) as count 
      FROM visits 
      WHERE timestamp >= datetime('now', '-30 days')
    `).get() as { count: number }
    
    // Get photos viewed (index page visits)
    const photosViewed = db.prepare(`
      SELECT COUNT(*) as count 
      FROM visits 
      WHERE page LIKE '%/%' 
      AND page NOT LIKE '%admin%'
      AND timestamp >= datetime('now', '-30 days')
    `).get() as { count: number }
    
    // Get recent visitors (last 50)
    const recentVisitors = db.prepare(`
      SELECT 
        ip,
        page,
        user_agent as userAgent,
        timestamp
      FROM visits 
      ORDER BY timestamp DESC 
      LIMIT 50
    `).all()
    
    // Get top pages
    const topPages = db.prepare(`
      SELECT 
        page as url,
        COUNT(*) as views
      FROM visits 
      WHERE timestamp >= datetime('now', '-30 days')
      GROUP BY page 
      ORDER BY views DESC 
      LIMIT 10
    `).all()
    
    return {
      success: true,
      stats: {
        totalVisits: totalVisits.count,
        uniqueVisitors: uniqueVisitors.count,
        pageViews: pageViews.count,
        photosViewed: photosViewed.count,
        recentVisitors,
        topPages
      }
    }
  } catch (error: any) {
    console.error('Analytics stats error:', error)
    return {
      success: false,
      message: error.message,
      stats: {
        totalVisits: 0,
        uniqueVisitors: 0,
        pageViews: 0,
        photosViewed: 0,
        recentVisitors: [],
        topPages: []
      }
    }
  } finally {
    db.close()
  }
})
