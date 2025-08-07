import { NextResponse } from 'next/server'
import { monitoringScheduler } from '@/lib/scheduler'

export async function POST() {
  try {
    monitoringScheduler.stop()
    
    return NextResponse.json({
      message: 'Monitoring scheduler stopped successfully',
      status: monitoringScheduler.getStatus()
    })
  } catch (error) {
    console.error('Failed to stop monitoring:', error)
    return NextResponse.json(
      { error: 'Failed to stop monitoring scheduler' },
      { status: 500 }
    )
  }
}
