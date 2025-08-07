import { NextResponse } from 'next/server'
import { monitoringScheduler } from '@/lib/scheduler'

export async function GET() {
  try {
    const status = monitoringScheduler.getStatus()
    
    return NextResponse.json({
      status,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to get monitoring status:', error)
    return NextResponse.json(
      { error: 'Failed to get monitoring status' },
      { status: 500 }
    )
  }
}
