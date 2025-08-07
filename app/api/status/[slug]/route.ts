import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Get site by slug
    const sites = await sql`
      SELECT * FROM sites 
      WHERE status_page_slug = ${params.slug} AND public_status_page = true
    `

    if (sites.length === 0) {
      return NextResponse.json({ error: 'Status page not found' }, { status: 404 })
    }

    const site = sites[0]

    // Get current status and recent checks
    const recentChecks = await sql`
      SELECT * FROM site_checks 
      WHERE site_id = ${site.id}
      ORDER BY checked_at DESC
      LIMIT 100
    `

    // Calculate uptime percentage (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const uptimeStats = await sql`
      SELECT 
        COUNT(*) as total_checks,
        COUNT(CASE WHEN status = 'up' THEN 1 END) as up_checks,
        AVG(CASE WHEN response_time IS NOT NULL THEN response_time END) as avg_response_time
      FROM site_checks 
      WHERE site_id = ${site.id} 
      AND checked_at >= ${thirtyDaysAgo.toISOString()}
    `

    const stats = uptimeStats[0]
    const uptimePercentage = stats.total_checks > 0 
      ? (stats.up_checks / stats.total_checks * 100).toFixed(2)
      : '0.00'

    // Get recent incidents
    const incidents = await sql`
      SELECT * FROM incidents 
      WHERE site_id = ${site.id}
      ORDER BY started_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      site: {
        name: site.name,
        url: site.url,
        description: site.description
      },
      currentStatus: recentChecks[0]?.status || 'unknown',
      uptimePercentage: parseFloat(uptimePercentage),
      avgResponseTime: Math.round(stats.avg_response_time || 0),
      lastCheck: recentChecks[0]?.checked_at,
      recentChecks: recentChecks.slice(0, 24), // Last 24 checks for chart
      incidents
    })
  } catch (error) {
    console.error('Get status page error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
