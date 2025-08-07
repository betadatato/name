'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'

export interface Site {
  id: string
  name: string
  url: string
  description?: string
  check_interval: number
  timeout_seconds: number
  notifications_enabled: boolean
  public_status_page: boolean
  status_page_slug?: string
  created_at: string
  updated_at: string
  current_status?: string
  last_response_time?: number
  last_check?: string
}

export function useSites() {
  const [sites, setSites] = useState<Site[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchSites = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/sites')
      
      if (!response.ok) {
        throw new Error('Failed to fetch sites')
      }

      const data = await response.json()
      setSites(data.sites || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const createSite = async (siteData: {
    name: string
    url: string
    description?: string
    check_interval?: number
    timeout_seconds?: number
    notifications_enabled?: boolean
    public_status_page?: boolean
  }) => {
    try {
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create site')
      }

      const data = await response.json()
      setSites(prev => [data.site, ...prev])
      return data.site
    } catch (error) {
      throw error
    }
  }

  const updateSite = async (id: string, updates: Partial<Site>) => {
    try {
      const response = await fetch(`/api/sites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update site')
      }

      const data = await response.json()
      setSites(prev => prev.map(site => site.id === id ? data.site : site))
      return data.site
    } catch (error) {
      throw error
    }
  }

  const deleteSite = async (id: string) => {
    try {
      const response = await fetch(`/api/sites/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete site')
      }

      setSites(prev => prev.filter(site => site.id !== id))
    } catch (error) {
      throw error
    }
  }

  useEffect(() => {
    fetchSites()
  }, [user])

  return {
    sites,
    isLoading,
    error,
    refetch: fetchSites,
    createSite,
    updateSite,
    deleteSite
  }
}
