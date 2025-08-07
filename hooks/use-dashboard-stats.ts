'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useSites } from './use-sites'

export interface DashboardStats {
  totalSites: number
  averageUptime: number
  activeIncidents: number
  averageResponseTime: number
  uptimeData: Array<{ time: string; uptime: number }>
  responseTimeData: Array<{ time: string; responseTime: number }>
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { sites } = useSites()

  const fetchStats = async () => {
    if (!user || sites.length === 0) return

    try {
      setIsLoading(true)
      
      // Calculate basic stats from sites data
      const totalSites = sites.length
      const activeSites = sites.filter(site => site.current_status === 'up').length
      const averageUptime = totalSites > 0 ? (activeSites / totalSites) * 100 : 0
      const activeIncidents = sites.filter(site => site.current_status === 'down').length
      
      // Calculate average response time
      const responseTimes = sites
        .filter(site => site.last_response_time && site.last_response_time > 0)
        .map(site => site.last_response_time!)
      const averageResponseTime = responseTimes.length > 0 
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0

      // Generate mock trend data (in real app, this would come from historical data)
      const uptimeData = Array.from({ length: 7 }, (_, i) => ({
        time: `Day ${i + 1}`,
        uptime: Math.max(95, averageUptime + (Math.random() - 0.5) * 5)
      }))

      const responseTimeData = Array.from({ length: 7 }, (_, i) => ({
        time: `Day ${i + 1}`,
        responseTime: Math.max(50, averageResponseTime + (Math.random() - 0.5) * 100)
      }))

      setStats({
        totalSites,
        averageUptime: Math.round(averageUptime * 10) / 10,
        activeIncidents,
        averageResponseTime,
        uptimeData,
        responseTimeData
      })
      
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [user, sites])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  }
}
