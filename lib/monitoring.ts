import { sql } from './db'

export interface MonitoringResult {
  status: 'up' | 'down'
  responseTime?: number
  statusCode?: number
  errorMessage?: string
}

export async function checkSiteHealth(url: string, timeoutSeconds: number = 30): Promise<MonitoringResult> {
  const startTime = Date.now()
  
  try {
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutSeconds * 1000)

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'DIY-UptimeRobot/1.0 (Uptime Monitor)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      // Don't follow redirects automatically to get the actual response
      redirect: 'manual'
    })

    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime

    // Consider redirects (3xx) as successful
    const isUp = response.status < 400 || (response.status >= 300 && response.status < 400)

    return {
      status: isUp ? 'up' : 'down',
      responseTime,
      statusCode: response.status,
      errorMessage: isUp ? undefined : `HTTP ${response.status} ${response.statusText}`
    }

  } catch (error: any) {
    const responseTime = Date.now() - startTime

    let errorMessage = 'Unknown error'
    
    if (error.name === 'AbortError') {
      errorMessage = `Timeout after ${timeoutSeconds} seconds`
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'DNS resolution failed'
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused'
    } else if (error.code === 'ECONNRESET') {
      errorMessage = 'Connection reset'
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timeout'
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      status: 'down',
      responseTime: responseTime > 0 ? responseTime : undefined,
      statusCode: undefined,
      errorMessage
    }
  }
}

export async function recordSiteCheck(siteId: string, result: MonitoringResult): Promise<void> {
  await sql`
    INSERT INTO site_checks (site_id, status, response_time, status_code, error_message)
    VALUES (
      ${siteId}, 
      ${result.status}, 
      ${result.responseTime || null}, 
      ${result.statusCode || null}, 
      ${result.errorMessage || null}
    )
  `
}

export async function getSitesToMonitor() {
  return await sql`
    SELECT id, name, url, check_interval, timeout_seconds, notifications_enabled
    FROM sites 
    WHERE check_interval > 0
    ORDER BY id
  `
}

export async function getLastSiteCheck(siteId: string) {
  const checks = await sql`
    SELECT * FROM site_checks 
    WHERE site_id = ${siteId} 
    ORDER BY checked_at DESC 
    LIMIT 1
  `
  return checks[0] || null
}

export async function shouldCheckSite(siteId: string, intervalMinutes: number): Promise<boolean> {
  const lastCheck = await getLastSiteCheck(siteId)
  
  if (!lastCheck) return true
  
  const lastCheckTime = new Date(lastCheck.checked_at).getTime()
  const now = Date.now()
  const intervalMs = intervalMinutes * 60 * 1000
  
  return (now - lastCheckTime) >= intervalMs
}

export async function detectStatusChange(siteId: string, currentStatus: 'up' | 'down'): Promise<{
  isStatusChange: boolean
  previousStatus?: 'up' | 'down'
  downtime?: number
}> {
  const recentChecks = await sql`
    SELECT status, checked_at FROM site_checks 
    WHERE site_id = ${siteId} 
    ORDER BY checked_at DESC 
    LIMIT 2
  `

  if (recentChecks.length < 2) {
    return { isStatusChange: false }
  }

  const [latest, previous] = recentChecks
  const isStatusChange = latest.status !== previous.status

  if (isStatusChange && currentStatus === 'up' && previous.status === 'down') {
    // Site recovered - calculate downtime
    const downtimeChecks = await sql`
      SELECT checked_at FROM site_checks 
      WHERE site_id = ${siteId} AND status = 'down'
      ORDER BY checked_at DESC
    `

    if (downtimeChecks.length > 0) {
      const firstDownTime = new Date(downtimeChecks[downtimeChecks.length - 1].checked_at).getTime()
      const recoveryTime = new Date(latest.checked_at).getTime()
      const downtime = Math.round((recoveryTime - firstDownTime) / 1000) // in seconds

      return {
        isStatusChange: true,
        previousStatus: previous.status,
        downtime
      }
    }
  }

  return {
    isStatusChange,
    previousStatus: previous.status
  }
}
