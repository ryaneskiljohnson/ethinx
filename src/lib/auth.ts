import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Authentication types
export interface User {
  id: string
  email: string
  name: string
  role: 'agent' | 'senior-agent' | 'broker' | 'admin'
  brokerage_id: string
  status: 'active' | 'inactive' | 'pending'
  permissions: string[]
  created_at: string
  last_login: string
}

export interface Brokerage {
  id: string
  name: string
  slug: string
  domain?: string
  subscription_plan: SubscriptionPlan
  brand_settings: BrandSettings
  created_at: string
  updated_at: string
}

export interface BrandSettings {
  primary_color: string
  secondary_color: string
  logo_url: string
  typography: TypographySettings
  compliance_settings: ComplianceSettings
}

export interface TypographySettings {
  heading_font: string
  body_font: string
  mono_font: string
}

export interface ComplianceSettings {
  auto_disclaimers: boolean
  license_validation: boolean
  fair_housing_logo: boolean
  disclaimer_text: string
}

export interface SubscriptionPlan {
  name: string
  tier: 'starter' | 'professional' | 'enterprise'
  agent_limit: number
  storage_limit: number
  features: string[]
}

// Auth utilities
export const auth = {
  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const user = await this.getUser(data.user.id)
        return { user, error: null }
      }

      return { user: null, error: 'Authentication failed' }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  async signUp(email: string, password: string, userData: Partial<User>): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      if (data.user) {
        const user = await this.getUser(data.user.id)
        return { user, error: null }
      }

      return { user: null, error: 'Registration failed' }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut()
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    return this.getUser(user.id)
  },

  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, email, name, role, brokerage_id, status, permissions, created_at, last_login,
        brokerages(id, name, slug, domain, subscription_plan, brand_settings)
      `)
      .eq('id', userId)
      .single()

    if (error) return null
    return data as User
  },

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.getUser(userId)
    return user?.permissions.includes(permission) ?? false
  },

  async updatePermissions(userId: string, permissions: string[]): Promise<void> {
    await supabase
      .from('users')
      .update({ permissions })
      .eq('id', userId)
  }
}

// Permission constants
export const PERMISSIONS = {
  VIEW_ASSETS: 'view:assets',
  EDIT_ASSETS: 'edit:assets',
  DELETE_ASSETS: 'delete:assets',
  VIEW_TEMPLATES: 'view:templates',
  EDIT_TEMPLATES: 'edit:templates',
  MANAGE_AGENTS: 'manage:agents',
  VIEW_ANALYTICS: 'view:analytics',
  ADMIN_SETTINGS: 'admin:settings',
  COMPLIANCE_OVERRIDE: 'compliance:override'
} as const

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
  'agent': [
    PERMISSIONS.VIEW_ASSETS,
    PERMISSIONS.VIEW_TEMPLATES
  ],
  'senior-agent': [
    PERMISSIONS.VIEW_ASSETS,
    PERMISSIONS.VIEW_TEMPLATES,
    PERMISSIONS.EDIT_TEMPLATES,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  'broker': [
    PERMISSIONS.VIEW_ASSETS,
    PERMISSIONS.EDIT_ASSETS,
    PERMISSIONS.VIEW_TEMPLATES,
    PERMISSIONS.EDIT_TEMPLATES,
    PERMISSIONS.MANAGE_AGENTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.ADMIN_SETTINGS
  ],
  'admin': Object.values(PERMISSIONS)
} as const

