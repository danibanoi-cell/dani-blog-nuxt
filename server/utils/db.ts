import mysql from 'mysql2/promise'

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dani_portfolio',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

let pool: mysql.Pool | null = null

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(config)
  }
  return pool
}

export const query = async (sql: string, params?: any[]) => {
  const connection = await getPool().getConnection()
  try {
    const [results] = await connection.execute(sql, params)
    return results
  } finally {
    connection.release()
  }
}
