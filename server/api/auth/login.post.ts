import bcrypt from 'bcryptjs'
import { query } from '../../utils/db'
import { generateToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required'
    })
  }

  try {
    const users: any = await query(
      'SELECT id, username, email, password, role FROM users WHERE email = ?',
      [email]
    )

    if (!Array.isArray(users) || users.length === 0) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      })
    }

    const user = users[0]
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      })
    }

    const token = generateToken(user.id, user.email)

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Login failed'
    })
  }
})
