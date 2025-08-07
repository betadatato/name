import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '@/lib/auth'
import { sql } from '@/lib/db'

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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = sql`
      SELECT 
        sc.*,
        s.name as site_name,
        s.url as site_url
      FROM site_checks sc
      JOIN sites s ON sc.site_id = s.id
      WHERE s.user_id = ${user.id}
    `

    // Add filters
    if (siteId) {
      query = sql`${query} AND sc.site_id = ${siteId}`
    }

    if (status && status !== 'all') {
      query = sql`${query} AND sc.status = ${status}`
    }

    query = sql`
      ${query}
      ORDER BY sc.checked_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    const logs = await query

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Get logs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
