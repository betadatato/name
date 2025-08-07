const { neon } = require('@neondatabase/serverless')

async function setupDatabase() {
  console.log('🚀 Setting up DIY UptimeRobot database...')
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required')
    console.log('Please add your Neon database URL to .env.local:')
    console.log('DATABASE_URL="postgresql://username:password@host/database?sslmode=require"')
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
  
  try {
    // Test connection
    console.log('🔗 Testing database connection...')
    await sql`SELECT 1`
    console.log('✅ Database connection successful')
    
    // Run the migration
    console.log('📄 Creating database schema...')
    await runMigration(sql)
    
    console.log('🎉 Database setup completed successfully!')
    console.log('')
    console.log('🔑 Sample login credentials:')
    console.log('   Admin: admin@example.com / admin123')
    console.log('   User:  john@example.com / user123')
    console.log('')
    console.log('🚀 You can now run: npm run dev')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    process.exit(1)
  }
}

async function runMigration(sql) {
  // Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      is_email_confirmed BOOLEAN DEFAULT FALSE,
      email_confirmation_token VARCHAR(255),
      role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_login TIMESTAMP WITH TIME ZONE
    )
  `
  
  // Create sites table
  await sql`
    CREATE TABLE IF NOT EXISTS sites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      check_interval INTEGER DEFAULT 5,
      timeout_seconds INTEGER DEFAULT 30,
      notifications_enabled BOOLEAN DEFAULT TRUE,
      public_status_page BOOLEAN DEFAULT FALSE,
      status_page_slug VARCHAR(100) UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `
  
  // Create site_checks table
  await sql`
    CREATE TABLE IF NOT EXISTS site_checks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      status VARCHAR(10) NOT NULL CHECK (status IN ('up', 'down')),
      response_time INTEGER,
      status_code INTEGER,
      error_message TEXT,
      checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `
  
  // Create incidents table
  await sql`
    CREATE TABLE IF NOT EXISTS incidents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(20) DEFAULT 'investigating' CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      resolved_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `
  
  // Create notifications table
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      config JSONB NOT NULL,
      enabled BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `
  
  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
  await sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`
  await sql`CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites(status_page_slug)`
  await sql`CREATE INDEX IF NOT EXISTS idx_site_checks_site_id ON site_checks(site_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_site_checks_checked_at ON site_checks(checked_at)`
  await sql`CREATE INDEX IF NOT EXISTS idx_incidents_site_id ON incidents(site_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`
  
  // Create trigger function
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql'
  `
  
  // Create triggers
  await sql`DROP TRIGGER IF EXISTS update_users_updated_at ON users`
  await sql`CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`
  
  await sql`DROP TRIGGER IF EXISTS update_sites_updated_at ON sites`
  await sql`CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`
  
  await sql`DROP TRIGGER IF EXISTS update_incidents_updated_at ON incidents`
  await sql`CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`
  
  await sql`DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications`
  await sql`CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`
  
  // Insert sample users
  await sql`
    INSERT INTO users (username, email, password_hash, is_email_confirmed, role, status) 
    VALUES ('admin', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlDO', TRUE, 'admin', 'active')
    ON CONFLICT (email) DO NOTHING
  `
  
  await sql`
    INSERT INTO users (username, email, password_hash, is_email_confirmed, role, status) 
    VALUES ('john_doe', 'john@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlDO', TRUE, 'user', 'active')
    ON CONFLICT (email) DO NOTHING
  `
}

setupDatabase()
