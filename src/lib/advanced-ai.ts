import { OpenAI } from 'openai'

export interface AIModel {
  name: string
  version: string
  capabilities: string[]
  costPerToken: number
  contextWindow: number
  maxTokens: number
}

export interface AIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    cost: number
  }
  model: string
  latency: number
}

export interface BrandAnalysis {
  brandConsistency: number
  visualAppeal: number
  professionalism: number
  marketAppeal: number
  recommendations: string[]
  violations: Array<{
    rule: string
    severity: 'low' | 'medium' | 'high'
    description: string
    suggestion: string
  }>
}

export interface ContentGenerationOptions {
  tone?: 'professional' | 'casual' | 'authoritative' | 'friendly'
  targetAudience?: 'first-time-buyers' | 'investors' | 'luxury-buyers' | 'young-professionals'
  propertyType?: 'residential' | 'commercial' | 'luxury' | 'investment'
  marketType?: 'buyers-market' | 'sellers-market' | 'balanced'
  length?: 'short' | 'medium' | 'long'
  includeMarketData?: boolean
  personalizeForAgent?: boolean
}

class AdvancedAIService {
  private openai: OpenAI
  private models: Map<string, AIModel> = new Map()
  private usageTracker = new Map<string, { requests: number; tokens: number; cost: number }>()

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey })
    this.initializeModels()
  }

  private initializeModels(): void {
    this.models.set('gpt-4o', {
      name: 'gpt-4o',
      version: '2024-05-13',
      capabilities: ['text-generation', 'image-analysis', 'code-generation', 'reasoning'],
      costPerToken: 0.000025,
      contextWindow: 128000,
      maxTokens: 4096
    })

    this.models.set('gpt-4-turbo', {
      name: 'gpt-4-turbo',
      version: '2024-01-01',
      capabilities: ['text-generation', 'analysis', 'reasoning'],
      costPerToken: 0.00001,
      contextWindow: 128000,
      maxTokens: 4096
    })

    this.models.set('gpt-3.5-turbo', {
      name: 'gpt-3.5-turbo',
      version: '2022-12-15',
      capabilities: ['text-generation', 'classification'],
      costPerToken: 0.0000015,
      contextWindow: 16385,
      maxTokens: 4096
    })
  }

  // Advanced Content Generation
  async generateListingDescription(
    propertyData: any,
    options: ContentGenerationOptions = {}
  ): Promise<AIResponse<string>> {
    const startTime = Date.now()
    
    try {
      const prompt = this.createListingPrompt(propertyData, options)
      
      const response = await this.openai.chat.completions.create({
        model: options.length === 'long' ? 'gpt-4o' : 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: this.getRealEstateExpertPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.length === 'long' ? 800 : 400,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })

      const generatedText = response.choices[0].message.content || ''
      const latency = Date.now() - startTime

      this.trackUsage('gpt-3.5-turbo', response.usage!)

      return {
        success: true,
        data: this.postProcessContent(generatedText),
        usage: this.formatUsageResponse(response.usage!),
        model: response.model,
        latency
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        model: 'gpt-3.5-turbo',
        latency: Date.now() - startTime
      }
    }
  }

  // Advanced Brand Analysis
  async analyzeBrandConsistency(
    assets: Array<{ content: string; metadata: any }>,
    brandGuidelines: any
  ): Promise<AIResponse<BrandAnalysis>> {
    const startTime = Date.now()

    try {
      const analysisPrompt = `
        Analyze these real estate marketing materials for brand consistency:
        
        Brand Guidelines:
        ${JSON.stringify(brandGuidelines)}
        
        Materials to analyze:
        ${assets.map(asset => `Content: ${asset.content}\nMetadata: ${JSON.stringify(asset.metadata)}`).join('\n\n')}
        
        Provide analysis in JSON format with:
        1. brandConsistency (0-100 score)
        2. visualAppeal (0-100 score)
        3. professionalism (0-100 score)
        4. marketAppeal (0-100 score)
        5. recommendations (array of strings)
        6. violations (array of objects with rule, severity, description, suggestion)
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a real estate branding expert specializing in consistency analysis. Return only valid JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })

      const analysisText = response.choices[0].message.content || ''
      const analysis = JSON.parse(analysisText)

      this.trackUsage('gpt-4o', response.usage!)

      return {
        success: true,
        data: analysis,
        usage: this.formatUsageResponse(response.usage!),
        model: response.model,
        latency: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        model: 'gpt-4o',
        latency: Date.now() - startTime
      }
    }
  }

  // Compliance and Risk Assessment
  async assessComplianceRisk(
    content: string,
    jurisdiction: string = 'US',
    propertyType: string = 'residential'
  ): Promise<AIResponse<any>> {
    const startTime = Date.now()

    try {
      const compliancePrompt = `
        Assess this real estate content for compliance risk in ${jurisdiction}:
        
        Content: "${content}"
        Property Type: ${propertyType}
        
        Check for violations of:
        1. Fair Housing Act
        2. Truth in Advertising
        3. Fair Practice Regulations
        4. Local Disclosure Requirements
        5. MLS Rules
        
        Return JSON with:
        - overallRiskScore (0-100)
        - violations (array)
        - recommendations (array)
        - requiredDisclaimers (array)
        - legalRisks (array)
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a real estate compliance expert. Provide comprehensive risk assessment. Return only valid JSON.'
          },
          {
            role: 'user',
            content: compliancePrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1200
      })

      const assessmentText = response.choices[0].message.content || ''
      const assessment = JSON.parse(assessmentText)

      this.trackUsage('gpt-4o', response.usage!)

      return {
        success: true,
        data: assessment,
        usage: this.formatUsageResponse(response.usage!),
        model: response.model,
        latency: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        model: 'gpt-4o',
        latency: Date.now() - startTime
      }
    }
  }

  // Market Trend Analysis
  async analyzeMarketTrends(
    marketData: any,
    propertyData: any,
    timeframe: string = '6 months'
  ): Promise<AIResponse<any>> {
    const startTime = Date.now()

    try {
      const trendPrompt = `
        Analyze these market trends for real estate insights:
        
        Market Data: ${JSON.stringify(marketData)}
        Property Data: ${JSON.stringify(propertyData)}
        Timeframe: ${timeframe}
        
        Provide insights in JSON format:
        1. priceTrend (direction and magnitude)
        2. inventoryTrend (level and change)
        3. demandIndicators (buyer activity, days on market)
        4. competitiveAnalysis (how this property compares)
        5. pricingRecommendations (specific suggestions)
        6. marketingStrategy (optimal approaches)
        7. targetMarketIdentification (ideal buyers)
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a real estate market analyst with expertise in pricing strategies and trend analysis. Return only valid JSON.'
          },
          {
            role: 'user',
            content: trendPrompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1500
      })

      const analysisText = response.choices[0].message.content || ''
      const analysis = JSON.parse(analysisText)

      this.trackUsage('gpt-4o', response.usage!)

      return {
        success: true,
        data: analysis,
        usage: this.formatUsageResponse(response.usage!),
        model: response.model,
        latency: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        model: 'gpt-4o',
        latency: Date.now() - startTime
      }
    }
  }

  // Personalized Agent Assistance
  async generateAgentInsights(
    agentData: any,
    recentActivity: any[],
    marketConditions: any
  ): Promise<AIResponse<any>> {
    const startTime = Date.now()

    try {
      const insightsPrompt = `
        Generate personalized insights for this real estate agent:
        
        Agent Profile: ${JSON.stringify(agentData)}
        Recent Activity: ${JSON.stringify(recentActivity)}
        Market Conditions: ${JSON.stringify(marketConditions)}
        
        Provide JSON insights:
        1. performanceAnalysis (strengths, opportunities)
        2. recommendedActions (what to do next)
        3. skillDevelopment (areas for improvement)
        4. marketingOpportunities (specific strategies)
        5. clientManagementTips (relationship building)
        6. productivitySuggestions (time management)
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a real estate coaching expert providing personalized guidance. Return only valid JSON.'
          },
          {
            role: 'user',
            content: insightsPrompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1400
      })

      const insightsText = response.choices[0].message.content || ''
      const insights = JSON.parse(insightsText)

      this.trackUsage('gpt-4o', response.usage!)

      return {
        success: true,
        data: insights,
        usage: this.formatUsageResponse(response.usage!),
        model: response.model,
        latency: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        model: 'gpt-4o',
        latency: Date.now() - startTime
      }
    }
  }

  // Advanced Image Analysis for Property Photos
  async analyzePropertyImages(
    images: Array<{ url: string; type: string }>,
    propertyData: any
  ): Promise<AIResponse<any>> {
    const startTime = Date.now()

    try {
      const imageAnalysisPromises = images.map(async (image) => {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this ${image.type} image of the property. Provide insights on:
                  1. visual appeal and marketing potential
                  2. staging recommendations
                  3. lighting and composition feedback
                  4. emotional impact assessment
                  5. buyer appeal factors`
                },
                {
                  type: 'image_url',
                  image_url: { url: image.url }
                }
              ]
            }
          ],
          max_tokens: 500
        })

        return JSON.parse(response.choices[0].message.content || '{}')
      })

      const analyses = await Promise.all(imageAnalysisPromises)
      
      // Combine analyses for overall property assessment
      const combinedAnalysis = this.combineImageAnalyses(analyses, propertyData)

      return {
        success: true,
        data: combinedAnalysis,
        model: 'gpt-4o',
        latency: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        model: 'gpt-4o',
        latency: Date.now() - startTime
      }
    }
  }

  // Batch Processing for Multiple Assets
  async batchProcessAssets(
    assets: Array<{ content: string; type: string; metadata?: any }>,
    operationType: 'brand-analysis' | 'compliance-check' | 'content-generation'
  ): Promise<AIResponse<any[]>> {
    const startTime = Date.now()
    const results = []

    try {
      // Process in batches of 5 to avoid rate limits
      for (let i = 0; i < assets.length; i += 5) {
        const batch = assets.slice(i, i + 5)
        
        const batchPromises = batch.map(async (asset) => {
          switch (operationType) {
            case 'brand-analysis':
              return this.analyzeBrandConsistency([asset], asset.metadata?.brandGuidelines)
            case 'compliance-check':
              return this.assessComplianceRisk(asset.content)
            case 'content-generation':
              return this.generateListingDescription(asset.metadata?.propertyData)
            default:
              throw new Error(`Unknown operation type: ${operationType}`)
          }
        })

        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults.map(r => r.data))

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      return {
        success: true,
        data: results,
        latency: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        latency: Date.now() - startTime
      }
    }
  }

  // Advanced Caching and Cost Optimization
  private createListingPrompt(propertyData: any, options: ContentGenerationOptions): string {
    return `
      Generate compelling real estate listing description for:
      
      Property Details: ${JSON.stringify(propertyData)}
      
      Requirements:
      - Tone: ${options.tone || 'professional'}
      - Target Audience: ${options.targetAudience || 'general'}
      - Length: ${options.length || 'medium'}
      - Include market appeal factors
      - Highlight unique selling points
      - Include lifestyle benefits
      - Comply with advertising regulations
      ${options.personalizeForAgent ? `- Include agent expertise: ${propertyData.agentName || 'Expert Agent'}` : ''}
    `
  }

  private getRealEstateExpertPrompt(): string {
    return `
      You are an expert real estate copywriter with 15+ years of experience.
      You specialize in creating compelling property descriptions that:
      - Build emotional connection with buyers
      - Highlight unique features and benefits
      - Comply with all advertising regulations
      - Drive interest and inquiries
      - Appeal to specific buyer demographics
    
      Always maintain professional standards and ethical practices.
    `
  }

  private postProcessContent(content: string): string {
    // Clean up formatting, add compliance disclaimers, etc.
    return content
      .replace(/\n+/g, '\n')
      .trim()
      .replace(/^(?:This|The)/i, (match) => match.toLowerCase())
  }

  private combineImageAnalyses(analyses: any[], propertyData: any): any {
    return {
      overallVisualAppeal: analyses.reduce((sum, a) => sum + (a.visualAppeal || 0), 0) / analyses.length,
      stagingScore: analyses.reduce((sum, a) => sum + (a.stagingScore || 0), 0) / analyses.length,
      lightingScore: analyses.reduce((sum, a) => sum + (a.lightingScore || 0), 0) / analyses.length,
      recommendations: analyses.flatMap(a => a.recommendations || []),
      topSellingPoints: this.extractTopSellingPoints(analyses, propertyData)
    }
  }

  private extractTopSellingPoints(analyses: any[], propertyData: any): string[] {
    // Combine insights from image analyses with property data
    const commonThemes = new Map()
    
    analyses.forEach(analysis => {
      analysis.sellingPoints?.forEach(point => {
        const count = commonThemes.get(point) || 0
        commonThemes.set(point, count + 1)
      })
    })

    return Array.from(commonThemes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([point]) => point)
  }

  private trackUsage(modelName: string, usage: any): void {
    const key = modelName
    const current = this.usageTracker.get(key) || { requests: 0, tokens: 0, cost: 0 }
    
    current.requests++
    current.tokens += usage.total_tokens
    current.cost += usage.total_tokens * this.models.get(modelName)!.costPerToken
    
    this.usageTracker.set(key, current)
  }

  private formatUsageResponse(usage: any): any {
    return {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      cost: usage.total_tokens * 0.000002 // Estimated average cost
    }
  }

  // Analytics and Usage Tracking
  getUsageStats(): any {
    return {
      models: Object.fromEntries(
        Array.from(this.usageTracker.entries()).map(([model, stats]) => [
          model, {
            requests: stats.requests,
            tokens: stats.tokens,
            cost: stats.cost,
            avgTokensPerRequest: stats.tokens / stats.requests
          }
        ])
      ),
      totalCost: Array.from(this.usageTracker.values()).reduce((sum, stats) => sum + stats.cost, 0),
      totalRequests: Array.from(this.usageTracker.values()).reduce((sum, stats) => sum + stats.requests, 0)
    }
  }

  // Model Selection Optimization
  selectOptimalModel(taskType: string, complexity: 'simple' | 'complex'): string {
    switch (taskType) {
      case 'content-generation':
        return complexity === 'complex' ? 'gpt-4o' : 'gpt-3.5-turbo'
      case 'analysis':
        return 'gpt-4o'
      case 'classification':
        return 'gpt-3.5-turbo'
      default:
        return 'gpt-3.5-turbo'
    }
  }
}

export const aiService = new AdvancedAIService(process.env.OPENAI_API_KEY || '')

export default aiService

