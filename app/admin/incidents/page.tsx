'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreHorizontal, Edit, CheckCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { useSites } from '@/hooks/use-sites'
import { useToast } from '@/hooks/use-toast'

interface Incident {
  id: string
  site_id: string
  site_name: string
  site_url: string
  title: string
  description?: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  started_at: string
  resolved_at?: string
  created_at: string
  updated_at: string
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [siteFilter, setSiteFilter] = useState('all')
  const { user } = useAuth()
  const { sites } = useSites()
  const { toast } = useToast()

  const fetchIncidents = async () => {
    if (!user) return

    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (siteFilter !== 'all') params.append('site_id', siteFilter)

      const response = await fetch(`/api/incidents?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setIncidents(data.incidents || [])
      }
    } catch (error) {
      console.error('Failed to fetch incidents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateIncidentStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await fetchIncidents()
        toast({
          title: 'Incident updated',
          description: `Status changed to ${status}`,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update incident',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchIncidents()
  }, [user, statusFilter, siteFilter])

  const filteredIncidents = incidents.filter(incident =>
    incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.site_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'investigating':
        return <Badge variant="destructive">Investigating</Badge>
      case 'identified':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Identified</Badge>
      case 'monitoring':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Monitoring</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Incidents</h1>
          <p className="text-gray-600">Track and manage service incidents</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Incident
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={siteFilter} onValueChange={setSiteFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {sites.map(site => (
                  <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="identified">Identified</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      <div className="grid gap-4">
        {filteredIncidents.map((incident) => (
          <Card key={incident.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {getStatusIcon(incident.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{incident.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{incident.site_name} • {incident.site_url}</p>
                    {incident.description && (
                      <p className="text-sm text-gray-700 mb-3">{incident.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Started: {new Date(incident.started_at).toLocaleString()}</span>
                      {incident.resolved_at && (
                        <span>Resolved: {new Date(incident.resolved_at).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {getStatusBadge(incident.status)}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Incident
                      </DropdownMenuItem>
                      {incident.status !== 'resolved' && (
                        <>
                          <DropdownMenuItem onClick={() => updateIncidentStatus(incident.id, 'identified')}>
                            Mark as Identified
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateIncidentStatus(incident.id, 'monitoring')}>
                            Mark as Monitoring
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateIncidentStatus(incident.id, 'resolved')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Resolved
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIncidents.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || siteFilter !== 'all'
                  ? 'Try adjusting your search terms or filters.'
                  : 'Great! No incidents have been reported yet.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
