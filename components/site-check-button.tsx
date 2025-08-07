'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Activity } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SiteCheckButtonProps {
  siteId: string
  siteName: string
  onCheckComplete?: () => void
}

export function SiteCheckButton({ siteId, siteName, onCheckComplete }: SiteCheckButtonProps) {
  const [isChecking, setIsChecking] = useState(false)
  const { toast } = useToast()

  const handleManualCheck = async () => {
    setIsChecking(true)
    try {
      const response = await fetch('/api/monitoring/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId })
      })

      if (response.ok) {
        const data = await response.json()
        const result = data.result
        
        toast({
          title: 'Check Complete',
          description: `${siteName} is ${result.status.toUpperCase()}${
            result.responseTime ? ` (${result.responseTime}ms)` : ''
          }`,
          variant: result.status === 'up' ? 'default' : 'destructive'
        })

        onCheckComplete?.()
      } else {
        throw new Error('Check failed')
      }
    } catch (error) {
      toast({
        title: 'Check Failed',
        description: 'Unable to check site status. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleManualCheck}
      disabled={isChecking}
    >
      <Activity className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
      {isChecking ? 'Checking...' : 'Check Now'}
    </Button>
  )
}
