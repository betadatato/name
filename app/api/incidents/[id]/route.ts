import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

const updateIncidentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).optional()
})

async function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  return getUserById(payload.userId)
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
    const updateData = updateIncidentSchema.parse(body)

    // Check if incident exists and user owns it
    const existingIncidents = await sql`
      SELECT i.* FROM incidents i
      JOIN sites s ON i.site_id = s.id
      WHERE i.id = ${params.id} AND s.user_id = ${user.id}
    `

    if (existingIncidents.length === 0) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
    }

    // Build update query
    const updates: any = {}
    if (updateData.title !== undefined) updates.title = updateData.title
    if (updateData.description !== undefined) updates.description = updateData.description
    if (updateData.status !== undefined) {
      updates.status = updateData.status
      if (updateData.status === 'resolved') {
        updates.resolved_at = new Date().toISOString()
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ incident: existingIncidents[0] })
    }

    const incidents = await sql`
      UPDATE incidents 
      SET 
        title = COALESCE(${updates.title || null}, title),
        description = COALESCE(${updates.description || null}, description),
        status = COALESCE(${updates.status || null}, status),
        resolved_at = COALESCE(${updates.resolved_at || null}, resolved_at),
        updated_at = NOW()
      WHERE id = ${params.id}
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

    console.error('Update incident error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
