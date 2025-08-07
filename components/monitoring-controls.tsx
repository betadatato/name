'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Square, Activity, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function MonitoringControls() {
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [status, setStatus] = useState<{
    isRunning: boolean
    activeIntervals: number
  } | null>(null)
  const { toast } = useToast()

  const checkStatus = async () => {
    setIsChecking(true)
    try {
      const response = await fetch('/api/monitoring/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data.status)
      }
    } catch (error) {
      console.error('Failed to check status:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const startMonitoring = async () => {
    setIsStarting(true)
    try {
      const response = await fetch('/api/monitoring/start', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data.status)
        toast({
          title: 'Monitoring Started',
          description: 'Background monitoring is now active.',
        })
      } else {
        throw new Error('Failed to start monitoring')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start monitoring. Check console for details.',
        variant: 'destructive',
      })
    } finally {
      setIsStarting(false)
    }
  }

  const stopMonitoring = async () => {
    setIsStopping(true)
    try {
      const response = await fetch('/api/monitoring/stop', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data.status)
        toast({
          title: 'Monitoring Stopped',
          description: 'Background monitoring has been stopped.',
        })
      } else {
        throw new Error('Failed to stop monitoring')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to stop monitoring. Check console for details.',
        variant: 'destructive',
      })
    } finally {
      setIsStopping(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Monitoring Engine
        </CardTitle>
        <CardDescription>
          Control the background monitoring system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Status</p>
            <div className="flex items-center space-x-2 mt-1">
              {status ? (
                <>
                  <Badge variant={status.isRunning ? 'default' : 'secondary'}>
                    {status.isRunning ? 'Running' : 'Stopped'}
                  </Badge>
                  {status.isRunning && (
                    <span className="text-sm text-gray-600">
                      {status.activeIntervals} active intervals
                    </span>
                  )}
                </>
              ) : (
                <Badge variant="outline">Unknown</Badge>
              )}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={checkStatus}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={startMonitoring}
            disabled={isStarting || status?.isRunning}
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            {isStarting ? 'Starting...' : 'Start Monitoring'}
          </Button>
          
          <Button
            variant="outline"
            onClick={stopMonitoring}
            disabled={isStopping || !status?.isRunning}
            className="flex-1"
          >
            <Square className="h-4 w-4 mr-2" />
            {isStopping ? 'Stopping...' : 'Stop Monitoring'}
          </Button>
        </div>

        <div className="text-xs text-gray-600">
          <p>• The monitoring engine checks your sites based on their configured intervals</p>
          <p>• Status changes are automatically detected and logged</p>
          <p>• Notifications will be sent when sites go down or recover</p>
        </div>
      </CardContent>
    </Card>
  )
}
