import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sql } from './db'
import type { User } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await sql`
    SELECT * FROM users WHERE id = ${id}
  `
  return users[0] || null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await sql`
    SELECT * FROM users WHERE email = ${email}
  `
  return users[0] || null
}

export async function createUser(userData: {
  username: string
  email: string
  password: string
}): Promise<User> {
  const passwordHash = await hashPassword(userData.password)
  
  const users = await sql`
    INSERT INTO users (username, email, password_hash)
    VALUES (${userData.username}, ${userData.email}, ${passwordHash})
    RETURNING *
  `
  
  return users[0]
}

export async function updateLastLogin(userId: string): Promise<void> {
  await sql`
    UPDATE users 
    SET last_login = NOW() 
    WHERE id = ${userId}
  `
}
