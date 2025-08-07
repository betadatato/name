import { monitoringScheduler } from './scheduler'

let isInitialized = false

export async function initializeMonitoring() {
  if (isInitialized) return
  
  try {
    console.log('🚀 Initializing DIY UptimeRobot monitoring...')
    
    // Start the monitoring scheduler
    await monitoringScheduler.start()
    
    isInitialized = true
    console.log('✅ Monitoring system initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize monitoring:', error)
  }
}

// Auto-start monitoring in production
if (process.env.NODE_ENV === 'production') {
  initializeMonitoring()
}
