export interface BrandAsset {
  id: string
  name: string
  type: 'logo' | 'color' | 'font' | 'image' | 'template'
  fileType: string
  url: string
  thumbnail?: string
  tags: string[]
  usageGuidelines?: string
  createdAt: Date
  updatedAt: Date
}

export interface BrandColor {
  id: string
  name: string
  hex: string
  type: 'primary' | 'secondary' | 'accent' | 'neutral'
  usage: 'background' | 'text' | 'accent' | 'button'
  description?: string
}

export interface BrandFont {
  id: string
  name: string
  family: string
  weights: string[]
  styles: ('normal' | 'italic')[]
  usage: 'heading' | 'body' | 'caption' | 'logo'
  license?: string
}

export interface BrandGuideline {
  id: string
  title: string
  description: string
  section: 'logos' | 'colors' | 'typography' | 'spacing' | 'imagery' | 'templates'
  content: string
  examples?: BrandAsset[]
  rules: string[]
}

export interface Brokerage {
  id: string
  name: string
  slug: string
  domain: string
  primaryBrand: Brand
  subBrands?: Brand[]
  agents: Agent[]
  subscription?: SubscriptionPlan
  createdAt: Date
  analytics?: Analytics
}

export interface Brand {
  id: string
  name: string
  brokerageId: string
  logo?: BrandAsset
  colors: BrandColor[]
  fonts: BrandFont[]
  guidelines: BrandGuideline[]
  templates: Template[]
  isActive: boolean
  createdAt: Date
}

export interface Agent {
  id: string
  name: string
  email: string
  phone: string
  brokerageId: string
  brandPreferences?: AgentBrandCustoms
  role: 'broker' | 'agent' | 'admin'
  teamId?: string
  isActive: boolean
  createdAt: Date
}

export interface AgentBrandCustoms {
  agentId: string
  preferredColors?: string[]
  customSignature?: string
  contactInfo?: ContactInfo
  specialties?: string[]
}

export interface ContactInfo {
  phone: string
  email: string
  website?: string
  socialMedia?: {
    facebook?: string
    instagram?: string
    linkedin?: string
  }
}

export interface Template {
  id: string
  name: string
  description: string
  category: 'listing' | 'business-card' | 'flyer' | 'email-signature' | 'social' | 'website'
  assetId: string
  preview: string
  customizable: boolean
  fields: TemplateField[]
  brandId: string
}

export interface TemplateField {
  name: string
  type: 'text' | 'image' | 'phone' | 'email' | 'multi-line' | 'select'
  required: boolean
  placeholder?: string
  options?: string[]
  defaultValue?: string
}

export interface SubscriptionPlan {
  name: string
  price: number
  features: string[]
  agentLimit: number
  brandLimit: number
  storageLimit: number
}
