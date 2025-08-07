const nodemailer = require('nodemailer')
const path = require('path')
const fs = require('fs')

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '')
    }
  })
}

async function testSMTPConnection() {
  console.log('🧪 Testing SMTP Configuration...\n')

  // Check environment variables
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
  const missingVars = requiredVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingVars.forEach(varName => console.error(`   - ${varName}`))
    console.error('\nPlease add these to your .env.local file\n')
    return
  }

  console.log('✅ Environment variables found:')
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST}`)
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT}`)
  console.log(`   SMTP_USER: ${process.env.SMTP_USER}`)
  console.log(`   SMTP_SECURE: ${process.env.SMTP_SECURE || 'false'}`)
  console.log(`   SMTP_FROM: ${process.env.SMTP_FROM || process.env.SMTP_USER}\n`)

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  try {
    console.log('🔍 Testing SMTP connection...')
    await transporter.verify()
    console.log('✅ SMTP connection successful!\n')

    // Send test email
    console.log('📧 Sending test email...')
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself
      subject: '🧪 DIY UptimeRobot - SMTP Test',
      html: `
        <h2>🎉 SMTP Test Successful!</h2>
        <p>Your DIY UptimeRobot email configuration is working correctly.</p>
        <p><strong>Test performed:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</p>
        <p><strong>SMTP Port:</strong> ${process.env.SMTP_PORT}</p>
        <hr>
        <p><small>This test email was sent by your DIY UptimeRobot monitoring system.</small></p>
      `,
      text: 'SMTP Test Successful! Your DIY UptimeRobot email configuration is working correctly.'
    })

    console.log('✅ Test email sent successfully!')
    console.log(`   Message ID: ${info.messageId}`)
    console.log(`   Check your inbox: ${process.env.SMTP_USER}\n`)

  } catch (error) {
    console.error('❌ SMTP test failed:')
    console.error(`   Error: ${error.message}\n`)
    
    console.log('🔧 Troubleshooting tips:')
    console.log('   1. Check your SMTP credentials are correct')
    console.log('   2. Verify your email provider allows SMTP connections')
    console.log('   3. For Gmail, use an "App Password" instead of your regular password')
    console.log('   4. Check if 2FA is enabled and configured properly')
    console.log('   5. Verify firewall/network allows SMTP traffic')
    console.log('   6. Some providers require "Less secure app access" to be enabled\n')
  }
}

testSMTPConnection()
