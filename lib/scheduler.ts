import { checkSiteHealth, recordSiteCheck, getSitesToMonitor, shouldCheckSite, detectStatusChange } from './monitoring'
import { sendNotification } from './notifications'
import { sql } from './db' // Import sql for database operations

class MonitoringScheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private isRunning = false

  async start() {
    if (this.isRunning) {
      console.log('Monitoring scheduler is already running')
      return
    }

    this.isRunning = true
    console.log('🚀 Starting monitoring scheduler...')

    // Initial check of all sites
    await this.checkAllSites()

    // Set up periodic checks
    this.schedulePeriodicChecks()

    console.log('✅ Monitoring scheduler started successfully')
  }

  stop() {
    console.log('🛑 Stopping monitoring scheduler...')
    
    // Clear all intervals
    this.intervals.forEach((interval) => {
      clearInterval(interval)
    })
    this.intervals.clear()
    
    this.isRunning = false
    console.log('✅ Monitoring scheduler stopped')
  }

  private async checkAllSites() {
    try {
      const sites = await getSitesToMonitor()
      console.log(`📊 Found ${sites.length} sites to monitor`)

      for (const site of sites) {
        try {
          const shouldCheck = await shouldCheckSite(site.id, site.check_interval)
          
          if (shouldCheck) {
            await this.checkSite(site)
          }
        } catch (error) {
          console.error(`❌ Error checking site ${site.name}:`, error)
        }
      }
    } catch (error) {
      console.error('❌ Error in checkAllSites:', error)
    }
  }

  private async checkSite(site: any) {
    console.log(`🔍 Checking ${site.name} (${site.url})...`)

    try {
      // Perform the health check
      const result = await checkSiteHealth(site.url, site.timeout_seconds)
      
      // Record the result
      await recordSiteCheck(site.id, result)

      // Check for status changes and send notifications
      if (site.notifications_enabled) {
        const statusChange = await detectStatusChange(site.id, result.status)
        
        if (statusChange.isStatusChange) {
          await this.handleStatusChange(site, result, statusChange)
        }
      }

      const statusIcon = result.status === 'up' ? '✅' : '❌'
      const responseInfo = result.responseTime ? ` (${result.responseTime}ms)` : ''
      console.log(`${statusIcon} ${site.name}: ${result.status.toUpperCase()}${responseInfo}`)

    } catch (error) {
      console.error(`❌ Error checking ${site.name}:`, error)
    }
  }

  private async handleStatusChange(site: any, result: any, statusChange: any) {
    try {
      if (result.status === 'down') {
        // Site went down - create incident
        console.log(`🚨 ALERT: ${site.name} is DOWN`)
        
        // Create incident automatically
        await sql`
          INSERT INTO incidents (site_id, title, description, status)
          VALUES (
            ${site.id}, 
            ${'Site Down: ' + site.name}, 
            ${result.errorMessage || 'Site is not responding'}, 
            'investigating'
          )
          ON CONFLICT DO NOTHING
        `
        
        await sendNotification({
          type: 'site_down',
          siteName: site.name,
          siteUrl: site.url,
          errorMessage: result.errorMessage,
          timestamp: new Date(),
          siteId: site.id
        })
      } else if (result.status === 'up' && statusChange.previousStatus === 'down') {
        // Site recovered - resolve any open incidents
        console.log(`🎉 RECOVERY: ${site.name} is back UP`)
        
        await sql`
          UPDATE incidents 
          SET status = 'resolved', resolved_at = NOW()
          WHERE site_id = ${site.id} AND status != 'resolved'
        `
        
        await sendNotification({
          type: 'site_up',
          siteName: site.name,
          siteUrl: site.url,
          downtime: statusChange.downtime,
          timestamp: new Date(),
          siteId: site.id
        })
      }
    } catch (error) {
      console.error(`❌ Error handling status change for ${site.name}:`, error)
    }
  }

  private schedulePeriodicChecks() {
    // Check every minute for sites that need monitoring
    const mainInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.checkAllSites()
      }
    }, 60 * 1000) // Check every minute

    this.intervals.set('main', mainInterval)
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      activeIntervals: this.intervals.size
    }
  }
}

// Singleton instance
export const monitoringScheduler = new MonitoringScheduler()
