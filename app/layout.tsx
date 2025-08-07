import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/auth-provider'

// Initialize monitoring system
import '@/lib/startup'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DIY UptimeRobot - Self-hosted Uptime Monitoring',
  description: 'Monitor your websites and APIs with your own uptime monitoring dashboard',
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
