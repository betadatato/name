import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

export const sql = neon(process.env.DATABASE_URL)

// Database types
export interface User {
  id: string
  username: string
  email: string
  password_hash: string
  is_email_confirmed: boolean
  email_confirmation_token?: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string
  last_login?: string
}

export interface Site {
  id: string
  user_id: string
  name: string
  url: string
  description?: string
  check_interval: number
  timeout_seconds: number
  notifications_enabled: boolean
  public_status_page: boolean
  status_page_slug?: string
  created_at: string
  updated_at: string
}

export interface SiteCheck {
  id: string
  site_id: string
  status: 'up' | 'down'
  response_time?: number
  status_code?: number
  error_message?: string
  checked_at: string
}

export interface Incident {
  id: string
  site_id: string
  title: string
  description?: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  started_at: string
  resolved_at?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  site_id?: string
  type: string
  config: Record<string, any>
  enabled: boolean
  created_at: string
  updated_at: string
}
