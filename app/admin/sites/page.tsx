'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreHorizontal, Edit, Trash2, ExternalLink, Activity } from 'lucide-react'
import Link from 'next/link'
import { useSites } from '@/hooks/use-sites'
import { useToast } from '@/hooks/use-toast'
import { SiteCheckButton } from '@/components/site-check-button'

export default function SitesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { sites, isLoading, deleteSite } = useSites()
  const { toast } = useToast()

  const filteredSites = sites.filter(site => 
    site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      await deleteSite(id)
      toast({
        title: 'Site deleted',
        description: `${name} has been removed from monitoring.`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete site',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'bg-green-500'
      case 'down':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'up':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Online</Badge>
      case 'down':
        return <Badge variant="destructive">Offline</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sites</h1>
          <p className="text-gray-600">Manage your monitored websites and APIs</p>
        </div>
        <Link href="/admin/sites/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Site
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search sites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sites List */}
      <div className="grid gap-4">
        {filteredSites.map((site) => (
          <Card key={site.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(site.current_status || 'unknown')}`} />
                  <div>
                    <h3 className="font-semibold text-lg">{site.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{site.url}</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {site.last_response_time && site.last_response_time > 0 ? `${site.last_response_time}ms` : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600">Response</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{site.check_interval}min</p>
                    <p className="text-xs text-gray-600">Interval</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {site.last_check ? new Date(site.last_check).toLocaleString() : 'Never'}
                    </p>
                    <p className="text-xs text-gray-600">Last Check</p>
                  </div>
                  {getStatusBadge(site.current_status || 'unknown')}

                  <SiteCheckButton 
                    siteId={site.id}
                    siteName={site.name}
                    onCheckComplete={() => window.location.reload()}
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Activity className="h-4 w-4 mr-2" />
                        View Logs
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/sites/${site.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Site
                        </Link>
                      </DropdownMenuItem>
                      {site.status_page_slug && (
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          <Link href={`/status/${site.status_page_slug}`}>Status Page</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(site.id, site.name)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Site
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSites.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sites found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first site to monitor.'}
              </p>
              {!searchTerm && (
                <Link href="/admin/sites/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Site
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
