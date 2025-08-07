import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Shield, Zap, Users, BarChart3, Bell } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">DIY UptimeRobot</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4" variant="secondary">
            Self-hosted • Open Source • Your Data
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Monitor Your Websites
            <br />
            <span className="text-blue-600">On Your Terms</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A self-hosted uptime monitoring dashboard built with Next.js and Python. 
            Think UptimeRobot, but you own the whole damn stack.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/auth/register">
              <Button size="lg" className="px-8">
                Start Monitoring
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="px-8">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Monitor Your Stack
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive uptime monitoring with all the features you expect, 
              plus the freedom of self-hosting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Real-time Monitoring</CardTitle>
                <CardDescription>
                  Monitor websites and APIs with custom intervals. Get instant alerts when something goes down.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>
                  Track uptime percentages, response times, and historical data with beautiful charts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Public Status Pages</CardTitle>
                <CardDescription>
                  Create branded status pages for your users. Show them exactly what's working.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Bell className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle>Smart Notifications</CardTitle>
                <CardDescription>
                  Get notified via email, Discord, or Slack when your services go down or recover.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Invite team members, set permissions, and collaborate on monitoring your infrastructure.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Activity className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Self-hosted</CardTitle>
                <CardDescription>
                  Your data stays on your servers. Full control, no vendor lock-in, no monthly fees.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join developers who chose to own their monitoring stack. 
            Set up your instance in minutes.
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="px-8">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6" />
              <span className="text-lg font-semibold">DIY UptimeRobot</span>
            </div>
            <p className="text-gray-400">
              Built with Next.js and Python • Self-hosted monitoring
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
