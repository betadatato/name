'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Download } from 'lucide-react'
import { useLogs } from '@/hooks/use-logs'
import { useSites } from '@/hooks/use-sites'

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [siteFilter, setSiteFilter] = useState('all')
  
  const { sites } = useSites()
  const { logs, isLoading } = useLogs({
    status: statusFilter,
    siteId: siteFilter !== 'all' ? siteFilter : undefined,
    limit: 50
  })

  const filteredLogs = logs.filter(log => 
    log.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.site_url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'up':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Up</Badge>
      case 'down':
        return <Badge variant="destructive">Down</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStatusCodeColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-green-600'
    if (code >= 400 && code < 500) return 'text-yellow-600'
    if (code >= 500) return 'text-red-600'
    return 'text-gray-600'
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
          <h1 className="text-3xl font-bold text-gray-900">Logs</h1>
          <p className="text-gray-600">View monitoring logs and check history</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search logs..."
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
                <SelectItem value="up">Up</SelectItem>
                <SelectItem value="down">Down</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || statusFilter !== 'all' || siteFilter !== 'all') && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setSiteFilter('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Checks</CardTitle>
          <CardDescription>
            Latest monitoring results from all your sites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    log.status === 'up' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <h3 className="font-medium">{log.site_name}</h3>
                    <p className="text-sm text-gray-600">{log.site_url}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(log.checked_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">Checked</p>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      log.status_code ? getStatusCodeColor(log.status_code) : 'text-gray-600'
                    }`}>
                      {log.status_code || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600">Status Code</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {log.response_time && log.response_time > 0 ? `${log.response_time}ms` : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600">Response Time</p>
                  </div>
                  
                  <div className="text-right min-w-[100px]">
                    <p className="text-sm font-medium">
                      {log.error_message || 'OK'}
                    </p>
                    <p className="text-xs text-gray-600">Message</p>
                  </div>
                  
                  {getStatusBadge(log.status)}
                </div>
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
              <p className="text-gray-600">
                {logs.length === 0 
                  ? 'No monitoring data available yet. Add some sites to start monitoring.'
                  : 'Try adjusting your search terms or filters.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
