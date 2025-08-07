import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

const updateSiteSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  url: z.string().url().optional(),
  description: z.string().optional(),
  check_interval: z.number().min(1).max(60).optional(),
  timeout_seconds: z.number().min(5).max(120).optional(),
  notifications_enabled: z.boolean().optional(),
  public_status_page: z.boolean().optional(),
})

async function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  return getUserById(payload.userId)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sites = await sql`
      SELECT * FROM sites 
      WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (sites.length === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    return NextResponse.json({ site: sites[0] })
  } catch (error) {
    console.error('Get site error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updateData = updateSiteSchema.parse(body)

    // Check if site exists and belongs to user
    const existingSites = await sql`
      SELECT * FROM sites 
      WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (existingSites.length === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // Update site with individual fields
    const updates: any = {}
    if (updateData.name !== undefined) updates.name = updateData.name
    if (updateData.url !== undefined) updates.url = updateData.url
    if (updateData.description !== undefined) updates.description = updateData.description
    if (updateData.check_interval !== undefined) updates.check_interval = updateData.check_interval
    if (updateData.timeout_seconds !== undefined) updates.timeout_seconds = updateData.timeout_seconds
    if (updateData.notifications_enabled !== undefined) updates.notifications_enabled = updateData.notifications_enabled
    if (updateData.public_status_page !== undefined) updates.public_status_page = updateData.public_status_page

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ site: existingSites[0] })
    }

    // Perform update
    const sites = await sql`
      UPDATE sites 
      SET 
        name = COALESCE(${updates.name || null}, name),
        url = COALESCE(${updates.url || null}, url),
        description = COALESCE(${updates.description || null}, description),
        check_interval = COALESCE(${updates.check_interval || null}, check_interval),
        timeout_seconds = COALESCE(${updates.timeout_seconds || null}, timeout_seconds),
        notifications_enabled = COALESCE(${updates.notifications_enabled !== undefined ? updates.notifications_enabled : null}, notifications_enabled),
        public_status_page = COALESCE(${updates.public_status_page !== undefined ? updates.public_status_page : null}, public_status_page),
        updated_at = NOW()
      WHERE id = ${params.id} AND user_id = ${user.id}
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

    console.error('Update site error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await sql`
      DELETE FROM sites 
      WHERE id = ${params.id} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Site deleted successfully' })
  } catch (error) {
    console.error('Delete site error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
