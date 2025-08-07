'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Globe, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSites } from '@/hooks/use-sites'
import { useToast } from '@/hooks/use-toast'

export default function EditSitePage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    interval: 5,
    timeout: 30,
    description: '',
    notifications: true,
    publicStatus: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSite, setIsLoadingSite] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const { sites, updateSite } = useSites()
  const { toast } = useToast()

  useEffect(() => {
    const site = sites.find(s => s.id === params.id)
    if (site) {
      setFormData({
        name: site.name,
        url: site.url,
        interval: site.check_interval,
        timeout: site.timeout_seconds,
        description: site.description || '',
        notifications: site.notifications_enabled,
        publicStatus: site.public_status_page
      })
      setIsLoadingSite(false)
    }
  }, [sites, params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await updateSite(params.id, {
        name: formData.name,
        url: formData.url,
        description: formData.description || undefined,
        check_interval: formData.interval,
        timeout_seconds: formData.timeout,
        notifications_enabled: formData.notifications,
        public_status_page: formData.publicStatus
      })

      toast({
        title: 'Site updated',
        description: `${formData.name} has been updated successfully.`,
      })

      router.push('/admin/sites')
    } catch (err: any) {
      setError(err.message || 'Failed to update site')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoadingSite) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/sites">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sites
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Site</h1>
          <p className="text-gray-600">Update monitoring settings for {formData.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Site Settings
          </CardTitle>
          <CardDescription>
            Update the configuration for this monitored site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Site Name</Label>
                <Input
                  id="name"
                  placeholder="My Website"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this site..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interval">Check Interval</Label>
                <Select value={formData.interval.toString()} onValueChange={(value) => handleInputChange('interval', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Every 1 minute</SelectItem>
                    <SelectItem value="2">Every 2 minutes</SelectItem>
                    <SelectItem value="5">Every 5 minutes</SelectItem>
                    <SelectItem value="10">Every 10 minutes</SelectItem>
                    <SelectItem value="15">Every 15 minutes</SelectItem>
                    <SelectItem value="30">Every 30 minutes</SelectItem>
                    <SelectItem value="60">Every hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Select value={formData.timeout.toString()} onValueChange={(value) => handleInputChange('timeout', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="20">20 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Get notified when this site goes down or recovers
                  </p>
                </div>
                <Switch
                  checked={formData.notifications}
                  onCheckedChange={(checked) => handleInputChange('notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Status Page</Label>
                  <p className="text-sm text-gray-600">
                    Allow public access to this site's status page
                  </p>
                </div>
                <Switch
                  checked={formData.publicStatus}
                  onCheckedChange={(checked) => handleInputChange('publicStatus', checked)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Updating Site...' : 'Update Site'}
              </Button>
              <Link href="/admin/sites">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
