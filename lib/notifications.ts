import { emailService } from './email'
import { sql } from './db'

interface NotificationData {
  type: 'site_down' | 'site_up' | 'email_confirmation'
  siteName?: string
  siteUrl?: string
  errorMessage?: string
  downtime?: number
  timestamp?: Date
  email?: string
  confirmationLink?: string
  userId?: string
  siteId?: string
}

export async function sendNotification(data: NotificationData) {
  // Log notification for debugging
  switch (data.type) {
    case 'site_down':
      console.log(`🚨 NOTIFICATION: ${data.siteName} is DOWN`)
      break
    case 'site_up':
      console.log(`🎉 NOTIFICATION: ${data.siteName} is back UP`)
      break
    case 'email_confirmation':
      console.log(`📧 EMAIL: Confirmation sent to ${data.email}`)
      break
  }

  // Send actual email notifications
  if (data.type === 'site_down' || data.type === 'site_up') {
    await sendSiteNotification(data)
  } else if (data.type === 'email_confirmation') {
    await sendConfirmationEmail(data)
  }
}

async function sendSiteNotification(data: NotificationData) {
  if (!data.siteId) return

  try {
    // Get users who should receive notifications for this site
    const notifications = await sql`
      SELECT DISTINCT u.email, u.username
      FROM users u
      JOIN sites s ON s.user_id = u.id
      WHERE s.id = ${data.siteId} 
      AND s.notifications_enabled = true
      AND u.status = 'active'
    `

    for (const notification of notifications) {
      let subject: string
      let html: string

      if (data.type === 'site_down') {
        subject = `🚨 ${data.siteName} is DOWN`
        html = emailService.generateSiteDownEmail(
          data.siteName!,
          data.siteUrl!,
          data.errorMessage
        )
      } else {
        subject = `🎉 ${data.siteName} is back UP`
        html = emailService.generateSiteUpEmail(
          data.siteName!,
          data.siteUrl!,
          data.downtime
        )
      }

      await emailService.sendEmail({
        to: notification.email,
        subject,
        html,
        text: `${data.siteName} status change: ${data.type === 'site_down' ? 'DOWN' : 'UP'}`
      })
    }
  } catch (error) {
    console.error('❌ Error sending site notification:', error)
  }
}

async function sendConfirmationEmail(data: NotificationData) {
  if (!data.email || !data.confirmationLink) return

  const subject = 'Confirm your DIY UptimeRobot account'
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Confirm Your Account</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #3b82f6; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to DIY UptimeRobot</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin-top: 0;">Confirm Your Email Address</h2>
            <p>Thanks for signing up! Please click the button below to confirm your email address and activate your account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.confirmationLink}" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Confirm Email Address
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${data.confirmationLink}">${data.confirmationLink}</a>
            </p>
          </div>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 14px; color: #6b7280;">
            <p style="margin: 0;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `

  await emailService.sendEmail({
    to: data.email,
    subject,
    html,
    text: `Welcome to DIY UptimeRobot! Please confirm your email: ${data.confirmationLink}`
  })
}
