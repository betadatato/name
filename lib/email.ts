import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    }

    if (config.auth.user && config.auth.pass) {
      this.transporter = nodemailer.createTransporter(config)
    } else {
      console.warn('⚠️ SMTP credentials not configured. Email notifications will be logged only.')
    }
  }

  async sendEmail(data: EmailData): Promise<boolean> {
    if (!this.transporter) {
      console.log('📧 EMAIL (not sent - no SMTP config):', data.subject, 'to', data.to)
      return false
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text
      })

      console.log('✅ Email sent:', info.messageId)
      return true
    } catch (error) {
      console.error('❌ Email send failed:', error)
      return false
    }
  }

  generateSiteDownEmail(siteName: string, siteUrl: string, errorMessage?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Site Down Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #ef4444; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px;">🚨 Site Down Alert</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #ef4444;">Site is Currently Down</h2>
              <p><strong>Site:</strong> ${siteName}</p>
              <p><strong>URL:</strong> <a href="${siteUrl}">${siteUrl}</a></p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              ${errorMessage ? `<p><strong>Error:</strong> ${errorMessage}</p>` : ''}
            </div>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 14px; color: #6b7280;">
              <p style="margin: 0;">This alert was sent by your DIY UptimeRobot monitoring system.</p>
              <p style="margin: 5px 0 0 0;">You'll receive another notification when the site recovers.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  generateSiteUpEmail(siteName: string, siteUrl: string, downtime?: number): string {
    const downtimeText = downtime ? this.formatDowntime(downtime) : 'Unknown duration'
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Site Recovery Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px;">🎉 Site Recovery Alert</h1>
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #10b981;">Site is Back Online</h2>
              <p><strong>Site:</strong> ${siteName}</p>
              <p><strong>URL:</strong> <a href="${siteUrl}">${siteUrl}</a></p>
              <p><strong>Recovery Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Downtime:</strong> ${downtimeText}</p>
            </div>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 14px; color: #6b7280;">
              <p style="margin: 0;">This recovery alert was sent by your DIY UptimeRobot monitoring system.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private formatDowntime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }
}

export const emailService = new EmailService()
