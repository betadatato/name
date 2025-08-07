import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '@/lib/auth'
import { emailService } from '@/lib/email'

async function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  return getUserById(payload.userId)
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow admin users to test emails
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { testType, email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    let result = false
    let message = ''

    switch (testType) {
      case 'site_down':
        result = await emailService.sendEmail({
          to: email,
          subject: '🚨 TEST: Site Down Alert',
          html: emailService.generateSiteDownEmail(
            'Test Website',
            'https://example.com',
            'Connection timeout - This is a test alert'
          ),
          text: 'This is a test site down notification from your DIY UptimeRobot system.'
        })
        message = 'Site down test email sent'
        break

      case 'site_up':
        result = await emailService.sendEmail({
          to: email,
          subject: '🎉 TEST: Site Recovery Alert',
          html: emailService.generateSiteUpEmail(
            'Test Website',
            'https://example.com',
            300 // 5 minutes downtime
          ),
          text: 'This is a test site recovery notification from your DIY UptimeRobot system.'
        })
        message = 'Site recovery test email sent'
        break

      case 'confirmation':
        result = await emailService.sendEmail({
          to: email,
          subject: 'TEST: Confirm your DIY UptimeRobot account',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Test Email Confirmation</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: #3b82f6; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h1 style="margin: 0; font-size: 24px;">🧪 Email Test Successful</h1>
                  </div>
                  
                  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="margin-top: 0;">Email System Working!</h2>
                    <p>Congratulations! Your SMTP configuration is working correctly.</p>
                    <p><strong>Test performed by:</strong> ${user.username}</p>
                    <p><strong>Test time:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                  
                  <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 14px; color: #6b7280;">
                    <p style="margin: 0;">This was a test email from your DIY UptimeRobot monitoring system.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
          text: 'Email test successful! Your SMTP configuration is working correctly.'
        })
        message = 'Email confirmation test sent'
        break

      default:
        return NextResponse.json({ error: 'Invalid test type' }, { status: 400 })
    }

    return NextResponse.json({
      success: result,
      message: result ? message : 'Email sending failed - check server logs and SMTP configuration',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send test email', 
        details: error instanceof Error ? error.message : 'Unknown error',
        message: 'Check your SMTP configuration in environment variables'
      },
      { status: 500 }
    )
  }
}
