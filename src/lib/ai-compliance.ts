import { supabase } from './auth'
import { auth } from './auth'

export interface ComplianceRule {
  id: string
  name: string
  description: string
  category: 'fair_housing' | 'mls_rules' | 'advertising' | 'brokerage_policy' | 'legal' | 'brand'
  severity: 'low' | 'medium' | 'high' | 'critical'
  aiEnabled: boolean
  keywords: string[]
  regexPatterns: string[]
  autoActions: ComplianceAction[]
  enabled: boolean
}

export interface ComplianceAction {
  type: 'block' | 'warn' | 'flag_for_review' | 'auto_fix'
  message?: string
  parameters?: Record<string, any>
}

export interface ComplianceViolation {
  id: string
  userId: string
  userEmail: string
  assetId?: string
  ruleId: string
  ruleName: string
  category: string
  severity: string
  content: string
  violationText: string
  suggestedFix?: string
  aiConfidence: number
  status: 'pending' | 'acknowledged' | 'fixed' | 'false_positive'
  reportedBy: 'ai' | 'manual' | 'system'
  createdAt: string
  resolvedAt?: string
}

export interface ComplianceMetrics {
  totalViolations: number
  violationsByCategory: Record<string, number>
  violationsBySeverity: Record<string, number>
  complianceScore: number // 0-100
  trend: 'improving' | 'declining' | 'stable'
  topViolationTypes: Array<{ rule: string; count: number }>
  agentScores: Array<{ userId: string; score: number; violations: number }>
}

class AIComplianceEngine {
  private openaiApiKey: string
  private rules: ComplianceRule[] = []

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || ''
    this.initDefaultRules()
  }

  // Initialize default compliance rules for real estate
  private initDefaultRules(): void {
    this.rules = [
      // Fair Housing Rules
      {
        id: 'fair-housing-discrimination',
        name: 'Fair Housing Discrimination Check',
        description: 'Detect potential discriminatory language in marketing materials',
        category: 'fair_housing',
        severity: 'critical',
        aiEnabled: true,
        keywords: ['family with children', 'married couples', 'christians only', 'no pets', 'perfect for families'],
        regexPatterns: [],
        autoActions: [{ type: 'block', message: 'Potential fair housing violation detected' }],
        enabled: true
      },
      
      {
        id: 'hud-compliant-advertising',
        name: 'HUD Compliant Advertising',
        description: 'Ensure property descriptions comply with HUD guidelines',
        category: 'fair_housing',
        severity: 'high',
        aiEnabled: true,
        keywords: ['hud', 'handicapped accessible', 'wheelchair', 'disability friendly'],
        regexPatterns: [],
        autoActions: [{ type: 'flag_for_review', message: 'HUD compliance check recommended' }],
        enabled: true
      },

      // MLS Rules Compliance
      {
        id: 'mls-copyright',
        name: 'MLS Copyright Compliance',
            description: 'Ensure MLS data usage complies with copyright rules',
        category: 'mls_rules',
        severity: 'high',
        aiEnabled: true,
        keywords: ['mls', 'multiple listing service', 'proprietary information'],
        regexPatterns: ['\\br\\b.*[0-9]{6,}', 'mls .* [0-9]{6,}'],
        autoActions: [{ type: 'warn', message: 'MLS copyright compliance required' }],
        enabled: true
      },

      // Real Estate License Compliance
      {
        id: 'license-disclosure',
        name: 'License Disclosure Requirement',
        description: 'Ensure proper license disclosure in marketing materials',
        category: 'legal',
        severity: 'medium',
        aiEnabled: true,
        keywords: [],
        regexPatterns: ['license #[0-9]+', 'license number', 'nc#?[0-9]+'],
        autoActions: [{ type: 'auto_fix', message: 'License information may be missing' }],
        enabled: true
      },

      // Brand Compliance Rules
      {
        id: 'brand-guideline-compliance',
        name: 'Brand Guideline Compliance',
        description: 'Check adherence to brokerage brand guidelines',
        category: 'brand',
        severity: 'medium',
        aiEnabled: true,
        keywords: [],
        regexPatterns: [],
        autoActions: [{ type: 'warn', message: 'Does not match brand guidelines' }],
        enabled: true
      },

      // Disclosure Requirements
      {
        id: 'agency-disclosure',
        name: 'Agency Disclosure Requirements',
        description: 'Ensure proper agency disclosure in client communications',
        category: 'legal',
        severity: 'high',
        aiEnabled: true,
        keywords: ['dual agency', 'agent represents', 'buyer\'s agent', 'seller\'s agent'],
        regexPatterns: [],
        autoActions: [{ type: 'warn', message: 'Agency disclosure may be required' }],
        enabled: true
      }
    ]
  }

  // Core compliance checking
  async checkContent(
    content: string, 
    assetId?: string, 
    userId?: string
  ): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = []
    const brokerageId = userId ? await this.getBrokerageId(userId) : null

    // Rule-based checking
    for (const rule of this.rules.filter(r => r.enabled)) {
      const ruleViolations = await this.checkRule(content, rule, assetId, userId)
      violations.push(...ruleViolations)
    }

    // AI-enhanced checking
    try {
      const aiViolations = await this.runAIChecks(content, brokerageId)
      violations.push(...aiViolations)
    } catch (error) {
      console.error('AI compliance check failed:', error)
    }

    // Store violations
    for (const violation of violations) {
      await this.storeViolation(violation)
    }

    return violations
  }

  private async checkRule(
    content: string, 
    rule: ComplianceRule, 
    assetId?: string, 
    userId?: string
  ): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = []
    const lowercaseContent = content.toLowerCase()

    // Keyword checking
    for (const keyword of rule.keywords) {
      if (lowercaseContent.includes(keyword.toLowerCase())) {
        violations.push({
          id: crypto.randomUUID(),
          userId: userId || 'unknown',
          userEmail: userId ? await this.getUserEmail(userId) : 'unknown',
          assetId,
          ruleId: rule.id,
          ruleName: rule.name,
          category: rule.category,
          severity: rule.severity,
          content,
          violationText: `Keyword "${keyword}" may violate ${rule.name}`,
          aiConfidence: 0.8,
          status: 'pending',
          reportedBy: 'ai',
          createdAt: new Date().toISOString()
        })
      }
    }

    // Regex pattern checking
    for (const pattern of rule.regexPatterns) {
      const regex = new RegExp(pattern, 'gi')
      const matches = content.match(regex)
      
      if (matches) {
        matches.forEach(match => {
          violations.push({
            id: crypto.randomUUID(),
            userId: userId || 'unknown',
            userEmail: userId ? await this.getUserEmail(userId) : 'unknown',
            assetId,
            ruleId: rule.id,
            ruleName: rule.name,
            category: rule.category,
            severity: rule.severity,
            content,
            violationText: `Pattern "${match}" may violate ${rule.name}`,
            aiConfidence: 0.85,
            status: 'pending',
            reportedBy: 'ai',
            createdAt: new Date().toISOString()
          })
        })
      }
    }

    return violations
  }

  private async runAIChecks(content: string, brokerageId?: string): Promise<ComplianceViolation[]> {
    if (!this.openaiApiKey || !brokerageId) return []

    try {
      // OpenAI API call for advanced content analysis
      const prompt = `
        Analyze this real estate marketing content for compliance violations. Check for:
        1. Fair Housing Act violations (discriminatory language)
        2. Missing required disclosures
        3. MLS copyright violations
        4. Licensing irregularities
        5. Brokerage policy violations
        
        Content to analyze:
        "${content}"
        
        Return a JSON array of violations with this structure:
        [
          {
            "category": "fair_housing|mls_rules|legal|brand",
            "severity": "low|medium|high|critical",
            "rule": "rule_name",
            "violation": "description of violation",
            "confidence": 0.95,
            "suggestedFix": "suggested correction"
          }
        ]
      `

      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'text-davinci-003',
          prompt,
          max_tokens: 1000,
          temperature: 0.3
        })
      })

      const data = await response.json()
      const violations = JSON.parse(data.choices[0].text)

      return violations.map((v: any) => ({
        id: crypto.randomUUID(),
        userId: 'unknown',
        userEmail: 'unknown',
        ruleId: v.rule,
        ruleName: v.rule,
        category: v.category,
        severity: v.severity,
        content,
        violationText: v.violation,
        suggestedFix: v.suggestedFix,
        aiConfidence: v.confidence,
        status: 'pending' as const,
        reportedBy: 'ai' as const,
        createdAt: new Date().toISOString()
      }))

    } catch (error) {
      console.error('OpenAI API error:', error)
      return []
    }
  }

  // Real-time scanning for uploaded assets
  async scanAsset(assetId: string, userId: string): Promise<ComplianceViolation[]> {
    const asset = await this.getAssetContent(assetId)
    if (!asset) return []

    const violations = await this.checkContent(asset.content, assetId, userId)
    
    // Update asset metadata with compliance status
    await supabase
      .from('brand_assets')
      .update({
        metadata: {
          ...asset.metadata,
          complianceChecked: true,
          violationCount: violations.length,
          lastComplianceCheck: new Date().toISOString()
        }
      })
      .eq('id', assetId)

    return violations
  }

  async scanUserContent(userId: string, timeframe: string = '7d'): Promise<ComplianceMetrics> {
    const violations = await this.getViolationsByUser(userId, timeframe)
    
    return {
      totalViolations: violations.length,
      violationsByCategory: this.groupBy(violations, 'category'),
      violationsBySeverity: this.groupBy(violations, 'severity'),
      complianceScore: this.calculateComplianceScore(violations),
      trend: this.calculateTrend(userId),
      topViolationTypes: this.getTopViolationTypes(violations),
      agentScores: await this.getAgentComplianceScores()
    }
  }

  // Helper methods
  private async getBrokerageId(userId: string): Promise<string | null> {
    const { data } = await supabase
      .from('users')
      .select('brokerage_id')
      .eq('id', userId)
      .single()
    return data?.brokerage_id || null
  }

  private async getUserEmail(userId: string): Promise<string> {
    const { data } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()
    return data?.email || 'unknown'
  }

  private async getAssetContent(assetId: string): Promise<any> {
    const { data } = await supabase
      .from('brand_assets')
      .select('name, description, metadata')
      .eq('id', assetId)
      .single()
    
    return data ? {
      content: `${data.name} ${data.description}`,
      metadata: data.metadata
    } : null
  }

  private async storeViolation(violation: ComplianceViolation): Promise<void> {
    await supabase.from('compliance_records').insert({
      id: violation.id,
      brokerage_id: await this.getBrokerageId(violation.userId),
      user_id: violation.userId,
      rule_type: violation.ruleName,
      status: violation.status as 'violation',
      description: violation.violationText,
      evidence_urls: [],
      created_at: violation.createdAt
    })
  }

  private async getViolationsByUser(userId: string, timeframe: string): Promise<ComplianceViolation[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeframe.replace('d', '')))

    const { data } = await supabase
      .from('compliance_records')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', cutoffDate.toISOString())
      .eq('status', 'violation')

    return data || []
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = item[key]
      groups[value] = (groups[value] || 0) + 1
      return groups
    }, {})
  }

  private calculateComplianceScore(violations: ComplianceViolation[]): number {
    const criticalViolations = violations.filter(v => v.severity === 'critical').length
    const highViolations = violations.filter(v => v.severity === 'high').length
    const mediumViolations = violations.filter(v => v.severity === 'medium').length

    // Calculate penalty score
    const penalty = (criticalViolations * 20) + (highViolations * 10) + (mediumViolations * 5)
    
    return Math.max(0, 100 - penalty)
  }

  private async calculateTrend(userId: string): Promise<'improving' | 'declining' | 'stable'> {
    const recentViolations = await this.getViolationsByUser(userId, '7d')
    const previousViolations = await this.getViolationsByUser(userId, '14d')
    
    if (recentViolations.length < previousViolations.length) return 'improving'
    if (recentViolations.length > previousViolations.length) return 'declining'
    return 'stable'
  }

  private getTopViolationTypes(violations: ComplianceViolation[]): Array<{ rule: string; count: number }> {
    const grouped = this.groupBy(violations, 'ruleName')
    return Object.entries(grouped)
      .map(([rule, count]) => ({ rule, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  private async getAgentComplianceScores(): Promise<Array<{ userId: string; score: number; violations: number }>> {
    const { data } = await supabase
      .from('users')
      .select(`
        id,
        violations:compliance_records(count),
        scores:compliance_scores(score)
      `)
      .eq('role', 'agent')
      .eq('status', 'active')

    return data?.map(user => ({
      userId: user.id,
      score: this.calculateComplianceScore(user.violations || []),
      violations: user.violations?.length || 0
    })) || []
  }

  // Real-time monitoring
  async startRealTimeMonitoring(brokerageId: string): Promise<void> {
    // Set up webhook monitoring for asset uploads
    supabase
      .channel('asset-uploads')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'brand_assets'
      }, async (payload) => {
        await this.scanAsset(payload.new.id, payload.new.created_by)
      })
      .subscribe()
  }

  // Custom rule creation
  async createCustomRule(brokerageId: string, rule: Omit<ComplianceRule, 'id'>): Promise<void> {
    const customRule: ComplianceRule = {
      id: crypto.randomUUID(),
      ...rule
    }

    this.rules.push(customRule)
    
    // Store in database
    await supabase.from('custom_compliance_rules').insert({
      id: customRule.id,
      brokerage_id: brokerageId,
      rule_data: customRule,
      created_at: new Date().toISOString()
    })
  }
}

export const aiCompliance = new AIComplianceEngine()

