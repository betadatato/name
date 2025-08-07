import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Clock, TrendingUp, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data - in real app, this would come from your API based on the slug
const statusData = {
  siteName: 'Example Website',
  url: 'https://example.com',
  currentStatus: 'up',
  uptime: 99.2,
  avgResponseTime: 125,
  lastIncident: '2 days ago',
  incidents: [
    { date: '2024-01-20', duration: '5 minutes', reason: 'Server maintenance' },
    { date: '2024-01-15', duration: '12 minutes', reason: 'Database timeout' },
    { date: '2024-01-10', duration: '3 minutes', reason: 'Network issue' },
  ]
}

const uptimeData = [
  { date: '2024-01-01', uptime: 100 },
  { date: '2024-01-02', uptime: 99.8 },
  { date: '2024-01-03', uptime: 100 },
  { date: '2024-01-04', uptime: 99.5 },
  { date: '2024-01-05', uptime: 100 },
  { date: '2024-01-06', uptime: 98.2 },
  { date: '2024-01-07', uptime: 99.9 },
]

export default function StatusPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{statusData.siteName}</h1>
              <p className="text-gray-600 mt-1">{statusData.url}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                statusData.currentStatus === 'up' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <Badge variant={statusData.currentStatus === 'up' ? 'default' : 'destructive'} className="text-sm">
                {statusData.currentStatus === 'up' ? 'All Systems Operational' : 'Service Disruption'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statusData.currentStatus === 'up' ? 'Online' : 'Offline'}
              </div>
              <p className="text-xs text-muted-foreground">
                Last checked 2 minutes ago
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">30-Day Uptime</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusData.uptime}%</div>
              <p className="text-xs text-muted-foreground">
                Above industry average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusData.avgResponseTime}ms</div>
              <p className="text-xs text-muted-foreground">
                Average over 24 hours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Uptime Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>7-Day Uptime History</CardTitle>
            <CardDescription>Daily uptime percentage over the last week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={uptimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[95, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="uptime" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Incidents
            </CardTitle>
            <CardDescription>
              Past incidents and maintenance windows
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.incidents.length > 0 ? (
              <div className="space-y-4">
                {statusData.incidents.map((incident, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <div>
                        <p className="font-medium">{incident.reason}</p>
                        <p className="text-sm text-gray-600">{incident.date}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{incident.duration}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Incidents</h3>
                <p className="text-gray-600">This service has been running smoothly!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Powered by DIY UptimeRobot
            </p>
            <p className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
