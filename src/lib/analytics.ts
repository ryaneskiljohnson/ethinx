import { supabase } from './auth'
import { auth } from './auth'

export interface AnalyticsMetrics {
  totalDownloads: number
  activeUsers: number
  newUsers: number
  topAssets: TopAsset[]
  categoryBreakdown: CategoryMetric[]
  userEngagement: UserEngagement[]
  complianceScore: number
  trends: TrendData[]
  realEstateMetrics: RealEstateMetrics
}

export interface TopAsset {
  id: string
  name: string
  category: string
  downloads: number
  uniqueDownloads: number
  avgRating: number
  conversionRate: number
  lastDownload: string
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

export interface CategoryMetric {
  category: string
  totalAssets: number
  totalDownloads: number
  growthRate: number
  avgUsage: number
  topPerforming: string[]
}

export interface UserEngagement {
  userId: string
  userName: string
  role: string
  downloadsThisMonth: number
  downloadsTotal: number
  avgSessionDuration: number
  lastActive: string
  complianceScore: number
  templatesUsed: number
}

export interface TrendData {
  date: string
  downloads: number
  users: number
  compliance: number
  assets: number
}

export interface RealEstateMetrics {
  propertyListingsGenerated: number
  openHouseMaterials: number
  emailSignatures: number
  businessCards: number
  complianceViolations: number
  licenseExpirations: number
  teamProductivity: number
}

class AnalyticsEngine {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTTL = 5 * 60 * 1000 // 5 minutes

  // Core analytics methods
  async getDashboardMetrics(timeframe: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsMetrics> {
    const currentUser = await auth.getCurrentUser()
    if (!currentUser) throw new Error('Unauthorized')

    const cacheKey = `dashboard-${currentUser.brokerage_id}-${timeframe}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const [topAssets, categoryBreakdown, userEngagement, trends, realEstateMetrics] = await Promise.all([
      this.getTopAssets(currentUser.brokerage_id, timeframe),
      this.getCategoryBreakdown(currentUser.brokerage_id, timeframe),
      this.getUserEngagement(currentUser.brokerage_id, timeframe),
      this.getTrendData(currentUser.brokerage_id, timeframe),
      this.getRealEstateMetrics(currentUser.brokerage_id, timeframe)
    ])

    const totalDownloads = await this.getTotalDownloads(currentUser.brokerage_id, timeframe)
    const activeUsers = await this.getActiveUsers(currentUser.brokerage_id, timeframe)
    const newUsers = await this.getNewUsers(currentUser.brokerage_id, timeframe)
    const complianceScore = await this.getComplianceScore(currentUser.brokerage_id)

    const metrics: AnalyticsMetrics = {
      totalDownloads,
      activeUsers,
      newUsers,
      topAssets,
      categoryBreakdown,
      userEngagement,
      complianceScore,
      trends,
      realEstateMetrics
    }

    this.setCache(cacheKey, metrics)
    return metrics
  }

  // Individual metric methods
  async getTopAssets(brokerageId: string, timeframe: string): Promise<TopAsset[]> {
    const { data } = await supabase.rpc('get_top_assets', {
      p_brokerage_id: brokerageId,
      p_timeframe: timeframe
    })

    return data.map((asset: any) => ({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      downloads: asset.downloads,
      uniqueDownloads: asset.unique_downloads,
      avgRating: asset.avg_rating,
      conversionRate: asset.conversion_rate,
      lastDownload: asset.last_download,
      trend: asset.trend,
      trendPercentage: asset.trend_percentage
    }))
  }

  async getCategoryBreakdown(brokerageId: string, timeframe: string): Promise<CategoryMetric[]> {
    const { data } = await supabase.rpc('get_category_breakdown', {
      p_brokerage_id: brokerageId,
      p_timeframe: timeframe
    })

    return data.map((cat: any) => ({
      category: cat.category,
      totalAssets: cat.total_assets,
      totalDownloads: cat.total_downloads,
      growthRate: cat.growth_rate,
      avgUsage: cat.avg_usage,
      topPerforming: cat.top_performing
    }))
  }

  async getUserEngagement(brokerageId: string, timeframe: string): Promise<UserEngagement[]> {
    const { data } = await supabase.rpc('get_user_engagement', {
      p_brokerage_id: brokerageId,
      p_timeframe: timeframe
    })

    return data.map((user: any) => ({
      userId: user.user_id,
      userName: user.user_name,
      role: user.role,
      downloadsThisMonth: user.downloads_this_month,
      downloadsTotal: user.downloads_total,
      avgSessionDuration: user.avg_session_duration,
      lastActive: user.last_active,
      complianceScore: user.compliance_score,
      templatesUsed: user.templates_used
    }))
  }

  async getTrendData(brokerageId: string, timeframe: string): Promise<TrendData[]> {
    const { data } = await supabase.rpc('get_trend_data', {
      p_brokerage_id: brokerageId,
      p_timeframe: timeframe
    })

    return data.map((trend: any) => ({
      date: trend.date,
      downloads: trend.downloads,
      users: trend.users,
      compliance: trend.compliance,
      assets: trend.assets
    }))
  }

  async getRealEstateMetrics(brokerageId: string, timeframe: string): Promise<RealEstateMetrics> {
    const { data } = await supabase.rpc('get_real_estate_metrics', {
      p_brokerage_id: brokerageId,
      p_timeframe: timeframe
    })

    const metrics = data[0]
    return {
      propertyListingsGenerated: metrics.property_listings_generated,
      openHouseMaterials: metrics.open_house_materials,
      emailSignatures: metrics.email_signatures,
      businessCards: metrics.business_cards,
      complianceViolations: metrics.compliance_violations,
      licenseExpirations: metrics.license_expirations,
      teamProductivity: metrics.team_productivity
    }
  }

  async getTotalDownloads(brokerageId: string, timeframe: string): Promise<number> {
    const { data } = await supabase.rpc('get_total_downloads', {
      p_brokerage_id: brokerageId,
      p_timeframe: timeframe
    })
    return data || 0
  }

  async getActiveUsers(brokerageId: string, timeframe: string): Promise<number> {
    const { data } = await supabase.rpc('get_active_users', {
      p_brokerage_id: brokerageId,
      p_timeframe: timeframe
    })
    return data || 0
  }

  async getNewUsers(brokerageId: string, timeframe: string): Promise<number> {
    const { data } = await supabase.rpc('get_new_users', {
      p_brokerage_id: brokerageId,
      p_timeframe: timeframe
    })
    return data || 0
  }

  async getComplianceScore(brokerageId: string): Promise<number> {
    const { data } = await supabase.rpc('get_compliance_score', {
      p_brokerage_id: brokerageId
    })
    return data || 0
  }

  // Event tracking
  async trackEvent(eventType: string, userId: string, data: any): Promise<void> {
    await supabase.from('analytics_events').insert({
      event_type: eventType,
      user_id: userId,
      data,
      timestamp: new Date().toISOString()
    })
  }

  async trackDownload(assetId: string, userId: string, userAgent?: string): Promise<void> {
    await supabase.from('downloads').insert({
      asset_id: assetId,
      user_id: userId,
      user_agent: userAgent,
      downloaded_at: new Date().toISOString()
    })

    // Update asset download count
    await supabase.rpc('increment_download_count', {
      p_asset_id: assetId
    })

    // Track event
    await this.trackEvent('asset_download', userId, { assetId, userAgent })
  }

  async trackAssetView(assetId: string, userId: string): Promise<void> {
    await this.trackEvent('asset_view', userId, { assetId })
  }

  async trackUserSession(userId: string, startTime: Date, endTime: Date): Promise<void> {
    const duration = endTime.getTime() - startTime.getTime()
    await this.trackEvent('session_end', userId, { duration })
  }

  // Advanced analytics queries
  async getConversionFunnel(userId: string, timeframe: string): Promise<any> {
    const { data } = await supabase.rpc('get_conversion_funnel', {
      p_user_id: userId,
      p_timeframe: timeframe
    })
    return data
  }

  async getRetentionAnalysis(brokerageId: string): Promise<any> {
    const { data } = await supabase.rpc('get_retention_analysis', {
      p_brokerage_id: brokerageId
    })
    return data
  }

  async getPredictiveInsights(brokerageId: string): Promise<any> {
    const { data } = await supabase.rpc('get_predictive_insights', {
      p_brokerage_id: brokerageId
    })
    return data
  }

  async getComplianceTrends(brokerageId: string, timeframe: string): Promise<any> {
    const { data } = await supabase.rpc('get_compliance_trends', {
      p_brokerage_id: brokerageId,
      p_timeframe: timeframe
    })
    return data
  }

  // Cache management
  private getFromCache(key: string): any {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // Real-time analytics
  async subscribeToRealtimeMetrics(callback: (metrics: AnalyticsMetrics) => void): Promise<any> {
    return supabase
      .channel('analytics-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'downloads'
      }, () => {
        // Refresh metrics when new downloads occur
        this.getDashboardMetrics().then(callback)
      })
      .subscribe()
  }

  // Generate insights
  async generateInsights(brokerageId: string): Promise<any> {
    const metrics = await this.getDashboardMetrics()
    
    const insights = {
      growthTrends: this.analyzeGrowthTrends(metrics.trends),
      topPerformers: metrics.topAssets.slice(0, 5),
      complianceHealth: this.analyzeComplianceHealth(metrics.complianceScore),
      userEngagement: this.analyzeUserEngagement(metrics.userEngagement),
      realEstateInsights: this.analyzeRealEstateMetrics(metrics.realEstateMetrics)
    }

    return insights
  }

  private analyzeGrowthTrends(trends: TrendData[]): any {
    if (trends.length < 2) return null

    const recent = trends.slice(-7) // Last 7 data points
    const previous = trends.slice(-14, -7) // Previous 7 data points

    const recentAvg = recent.reduce((sum, t) => sum + t.downloads, 0) / recent.length
    const previousAvg = previous.reduce((sum, t) => sum + t.downloads, 0) / previous.length

    return {
      downloadGrowth: ((recentAvg - previousAvg) / previousAvg) * 100,
      userGrowth: recent[recent.length - 1].users - recent[0].users,
      assetCreationRate: recent.length
    }
  }

  private analyzeComplianceHealth(score: number): any {
    const status = score >= 90 ? 'excellent' : score >= 80 ? 'good' : score >= 70 ? 'fair' : 'poor'
    
    return {
      score,
      status,
      recommendations: this.getComplianceRecommendations(score)
    }
  }

  private getComplianceRecommendations(score: number): string[] {
    if (score >= 90) return ['Maintain current compliance standards']
    if (score >= 80) return ['Review recent policy updates', 'Consider additional training']
    if (score >= 70) return ['Schedule compliance review', 'Update policy documentation']
    return ['Urgent compliance review needed', 'Update agent training materials', 'Review all marketing materials']
  }

  private analyzeUserEngagement(users: UserEngagement[]): any {
    const avgDownloads = users.reduce((sum, u) => sum + u.downloadsThisMonth, 0) / users.length
    const topPerformers = users.sort((a, b) => b.downloadsThisMonth - a.downloadsThisMonth).slice(0, 3)
    
    return {
      avgDownloadsThisMonth: avgDownloads,
      topPerformers,
      engagementLevel: avgDownloads > 50 ? 'high' : avgDownloads > 20 ? 'medium' : 'low'
    }
  }

  private analyzeRealEstateMetrics(metrics: RealEstateMetrics): any {
    const totalMaterials = metrics.propertyListingsGenerated + metrics.openHouseMaterials + metrics.businessCards + metrics.emailSignatures
    
    return {
      materialProductionRate: totalMaterials,
      teamEfficiency: metrics.teamProductivity,
      complianceHealth: 100 - (metrics.complianceViolations / totalMaterials) * 100,
      licenseStatus: metrics.licenseExpirations === 0 ? 'healthy' : 'needs attention'
    }
  }
}

export const analytics = new AnalyticsEngine()
