'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'

export interface SiteLog {
  id: string
  site_id: string
  site_name: string
  site_url: string
  status: 'up' | 'down'
  response_time?: number
  status_code?: number
  error_message?: string
  checked_at: string
}

export function useLogs(filters?: {
  siteId?: string
  status?: string
  limit?: number
  offset?: number
}) {
  const [logs, setLogs] = useState<SiteLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchLogs = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      if (filters?.siteId) params.append('site_id', filters.siteId)
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())

      const response = await fetch(`/api/logs?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch logs')
      }

      const data = await response.json()
      setLogs(data.logs || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [user, filters?.siteId, filters?.status, filters?.limit, filters?.offset])

  return {
    logs,
    isLoading,
    error,
    refetch: fetchLogs
  }
}
