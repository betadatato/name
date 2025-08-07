import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

const createIncidentSchema = z.object({
  site_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).default('investigating')
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

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('site_id')
    const status = searchParams.get('status')

    let query = sql`
      SELECT 
        i.*,
        s.name as site_name,
        s.url as site_url
      FROM incidents i
      JOIN sites s ON i.site_id = s.id
      WHERE s.user_id = ${user.id}
    `

    if (siteId) {
      query = sql`${query} AND i.site_id = ${siteId}`
    }

    if (status && status !== 'all') {
      query = sql`${query} AND i.status = ${status}`
    }

    query = sql`${query} ORDER BY i.started_at DESC`

    const incidents = await query

    return NextResponse.json({ incidents })
  } catch (error) {
    console.error('Get incidents error:', error)
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
    const incidentData = createIncidentSchema.parse(body)

    // Verify user owns the site
    const sites = await sql`
      SELECT id FROM sites 
      WHERE id = ${incidentData.site_id} AND user_id = ${user.id}
    `

    if (sites.length === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    const incidents = await sql`
      INSERT INTO incidents (site_id, title, description, status)
      VALUES (${incidentData.site_id}, ${incidentData.title}, ${incidentData.description || null}, ${incidentData.status})
      RETURNING *
    `

    return NextResponse.json({ incident: incidents[0] })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create incident error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
