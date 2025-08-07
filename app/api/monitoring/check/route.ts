import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '@/lib/auth'
import { checkSiteHealth, recordSiteCheck } from '@/lib/monitoring'
import { sql } from '@/lib/db'

async function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  return getUserById(payload.userId)
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { siteId } = await request.json()

    // Get site details
    const sites = await sql`
      SELECT * FROM sites 
      WHERE id = ${siteId} AND user_id = ${user.id}
    `

    if (sites.length === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    const site = sites[0]

    // Perform manual check
    const result = await checkSiteHealth(site.url, site.timeout_seconds)
    
    // Record the result
    await recordSiteCheck(site.id, result)

    return NextResponse.json({
      message: 'Site check completed',
      result: {
        status: result.status,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        errorMessage: result.errorMessage,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Manual site check error:', error)
    return NextResponse.json(
      { error: 'Failed to check site' },
      { status: 500 }
    )
  }
}
