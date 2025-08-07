'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Mail, CheckCircle, XCircle, AlertTriangle, Send, Settings } from 'lucide-react'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [testType, setTestType] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    timestamp: string
  } | null>(null)

  const handleSendTest = async () => {
    if (!email || !testType) {
      setResult({
        success: false,
        message: 'Please fill in all fields',
        timestamp: new Date().toISOString()
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testType, email }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error occurred',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Testing</h1>
        <p className="text-muted-foreground">
          Test your email notification system to ensure alerts are working correctly.
        </p>
      </div>

      {/* SMTP Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            SMTP Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                SMTP configuration status is checked server-side. Check your environment variables:
                <br />
                <strong>Required:</strong> SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Email Test Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Test Email
          </CardTitle>
          <CardDescription>
            Send a test email to verify your notification system is working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Test Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testType">Test Type</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="site_down">🚨 Site Down Alert</SelectItem>
                  <SelectItem value="site_up">🎉 Site Recovery Alert</SelectItem>
                  <SelectItem value="confirmation">📧 Email Confirmation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleSendTest} 
            disabled={isLoading || !email || !testType}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send Test Email'}
          </Button>
        </CardContent>
      </Card>

      {/* Test Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Test Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                <strong>{result.success ? 'Success:' : 'Error:'}</strong> {result.message}
                <br />
                <small className="text-muted-foreground">
                  Test performed at: {new Date(result.timestamp).toLocaleString()}
                </small>
              </AlertDescription>
            </Alert>

            {result.success && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Check your email inbox (and spam folder)</li>
                  <li>• Verify the email formatting looks correct</li>
                  <li>• Test with different email providers if needed</li>
                  <li>• Monitor server logs for any additional details</li>
                </ul>
              </div>
            )}

            {!result.success && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">Troubleshooting:</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Check your SMTP credentials in environment variables</li>
                  <li>• Verify your email provider allows SMTP connections</li>
                  <li>• Check server logs for detailed error messages</li>
                  <li>• Ensure firewall/network allows SMTP traffic</li>
                  <li>• Try using an app-specific password for Gmail</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Email Templates Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Email Template Examples</CardTitle>
          <CardDescription>
            Preview of what your notification emails will look like.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-red-600 mb-2">🚨 Site Down Alert</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Red header with alert icon</p>
                <p>• Site name and URL</p>
                <p>• Error message details</p>
                <p>• Timestamp information</p>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-green-600 mb-2">🎉 Site Recovery</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Green header with celebration</p>
                <p>• Recovery confirmation</p>
                <p>• Downtime duration</p>
                <p>• Recovery timestamp</p>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-blue-600 mb-2">📧 Email Confirmation</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Blue branded header</p>
                <p>• Welcome message</p>
                <p>• Confirmation button</p>
                <p>• Fallback link</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
