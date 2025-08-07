'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MonitoringControls } from '@/components/monitoring-controls'
import { Settings, Database, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your monitoring system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monitoring Controls */}
        <MonitoringControls />

        {/* Database Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database
            </CardTitle>
            <CardDescription>
              Database connection and statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Connection Status</p>
              <p className="text-sm text-green-600">Connected to Neon</p>
            </div>
            <div>
              <p className="font-medium">Environment</p>
              <p className="text-sm text-gray-600">
                {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure alert preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-600">Coming soon - SMTP integration</p>
            </div>
            <div>
              <p className="font-medium">Discord/Slack</p>
              <p className="text-sm text-gray-600">Coming soon - Webhook support</p>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security
            </CardTitle>
            <CardDescription>
              Authentication and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">JWT Authentication</p>
              <p className="text-sm text-green-600">Active</p>
            </div>
            <div>
              <p className="font-medium">Password Hashing</p>
              <p className="text-sm text-green-600">bcrypt (12 rounds)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
