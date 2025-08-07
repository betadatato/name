import { NextResponse } from 'next/server'
import { monitoringScheduler } from '@/lib/scheduler'

export async function POST() {
  try {
    await monitoringScheduler.start()
    
    return NextResponse.json({
      message: 'Monitoring scheduler started successfully',
      status: monitoringScheduler.getStatus()
    })
  } catch (error) {
    console.error('Failed to start monitoring:', error)
    return NextResponse.json(
      { error: 'Failed to start monitoring scheduler' },
      { status: 500 }
    )
  }
}
