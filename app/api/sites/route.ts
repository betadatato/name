import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

const createSiteSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url(),
  description: z.string().optional(),
  check_interval: z.number().min(1).max(60).default(5),
  timeout_seconds: z.number().min(5).max(120).default(30),
  notifications_enabled: z.boolean().default(true),
  public_status_page: z.boolean().default(false),
})

async function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  return getUserById(payload.userId)
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sites = await sql`
      SELECT 
        s.*,
        COALESCE(
          (SELECT status FROM site_checks 
           WHERE site_id = s.id 
           ORDER BY checked_at DESC 
           LIMIT 1), 
          'unknown'
        ) as current_status,
        COALESCE(
          (SELECT response_time FROM site_checks 
           WHERE site_id = s.id 
           ORDER BY checked_at DESC 
           LIMIT 1), 
          0
        ) as last_response_time,
        (SELECT checked_at FROM site_checks 
         WHERE site_id = s.id 
         ORDER BY checked_at DESC 
         LIMIT 1) as last_check
      FROM sites s
      WHERE s.user_id = ${user.id}
      ORDER BY s.created_at DESC
    `

    return NextResponse.json({ sites })
  } catch (error) {
    console.error('Get sites error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const siteData = createSiteSchema.parse(body)

    // Generate slug from name
    const slug = siteData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const sites = await sql`
      INSERT INTO sites (
        user_id, name, url, description, check_interval, 
        timeout_seconds, notifications_enabled, public_status_page, status_page_slug
      )
      VALUES (
        ${user.id}, ${siteData.name}, ${siteData.url}, ${siteData.description || null},
        ${siteData.check_interval}, ${siteData.timeout_seconds}, 
        ${siteData.notifications_enabled}, ${siteData.public_status_page}, ${slug}
      )
      RETURNING *
    `

    return NextResponse.json({ site: sites[0] })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create site error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
