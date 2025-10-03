'use client'

import { useState } from "react"
import { 
  Download, 
  Users, 
  Building2, 
  BarChart3, 
  TrendingUp,
  Calendar,
  Filter,
  Eye,
  Share2,
  Heart
} from "lucide-react"

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('downloads')

  const timeRanges = [
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: '90d', label: 'Last 90 days' },
    { id: '1y', label: 'Last year' },
    { id: 'all', label: 'All time' }
  ]

  const metrics = [
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'users', label: 'Active Users', icon: Users },
    { id: 'assets', label: 'Brand Assets', icon: Building2 },
    { id: 'engagement', label: 'Engagement', icon: Heart }
  ]

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalDownloads: 2489,
      activeAgents: 24,
      totalAssets: 127,
      engagementRate: 87
    },
    topAssets: [
      { name: 'Business Card Template', downloads: 456, category: 'templates', trend: 'up' },
      { name: 'Primary Logo PNG', downloads: 398, category: 'logos', trend: 'up' },
      { name: 'Property Flyer Luxury', downloads: 312, category: 'templates', trend: 'up' },
      { name: 'Brand Color Palette', downloads: 289, category: 'colors', trend: 'stable' },
      { name: 'Email Signature Builder', downloads: 267, category: 'templates', trend: 'up' }
    ],
    agentsByActivity: [
      { name: 'Sarah Miller', downloads: 156, category: 'Senior Agent', lastActive: '2 hours ago' },
      { name: 'John Davis', downloads: 134, category: 'Agent', lastActive: '5 hours ago' },
      { name: 'Mike Chen', downloads: 98, category: 'Agent', lastActive: '1 day ago' },
      { name: 'Lisa Wang', downloads: 87, category: 'Agent', lastActive: '2 days ago' },
      { name: 'Tom Garcia', downloads: 76, category: 'Senior Agent', lastActive: '3 days ago' }
    ],
    categoryBreakdown: [
      { category: 'Templates', downloads: 1123, percentage: 45 },
      { category: 'Logos', downloads: 892, percentage: 36 },
      { category: 'Colors', downloads: 312, percentage: 13 },
      { category: 'Typography', downloads: 162, percentage: 6 }
    ],
    monthlyTrends: [
      { month: 'Jan', downloads: 1234 },
      { month: 'Feb', downloads: 1456 },
      { month: 'Mar', downloads: 1879 },
      { month: 'Apr', downloads: 2213 },
      { month: 'May', downloads: 2489 }
    ]
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights into brand asset usage and team engagement</p>
        </div>
        
        <div className="flex space-x-4">
          {/* Time Range Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {timeRanges.map(range => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map(metric => {
          const Icon = metric.icon
          const value = metric.id === 'downloads' ? analyticsData.overview.totalDownloads :
                      metric.id === 'users' ? analyticsData.overview.activeAgents :
                      metric.id === 'assets' ? analyticsData.overview.totalAssets :
                      analyticsData.overview.engagementRate

          return (
            <div key={metric.id} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  {value < 100 ? value : formatNumber(value)}
                  {metric.id === 'engagement' && '%'}
                </p>
                <p className="text-sm text-gray-600">{metric.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Assets Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Downloaded Assets</h3>
            <div className="flex space-x-2">
              <button className="text-gray-400 hover:text-gray-600">
                <Eye className="w-4 h-4" />
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {analyticsData.topAssets.map((asset, index) => (
              <div key={asset.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                    <p className="text-xs text-gray-500">{asset.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{asset.downloads}</p>
                    <div className="flex items-center">
                      <TrendingUp className={`w-3 h-3 mr-1 ${
                        asset.trend === 'up' ? 'text-green-600' : 
                        asset.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`} />
                      <span className={`text-xs ${
                        asset.trend === 'up' ? 'text-green-600' : 
                        asset.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {asset.trend === 'stable' ? 'Flat' : '+12%'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Activity */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Agent Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All Agents
            </button>
          </div>

          <div className="space-y-4">
            {analyticsData.agentsByActivity.map(agent => (
              <div key={agent.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                    <p className="text-xs text-gray-500">{agent.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{agent.downloads}</p>
                  <p className="text-xs text-gray-500">{agent.lastActive}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Downloads by Category</h3>
          
          <div className="space-y-4">
            {analyticsData.categoryBreakdown.map(category => (
              <div key={category.category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900">{category.category}</span>
                  <span className="text-sm text-gray-500">{category.downloads} ({category.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Downloads Trend</h3>
          
          <div className="space-y-4">
            {analyticsData.monthlyTrends.map((month, index) => (
              <div key={month.month} className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900 w-12">{month.month}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(month.downloads / Math.max(...analyticsData.monthlyTrends.map(m => m.downloads))) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-16 text-right">
                  {formatNumber(month.downloads)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real Estate Brand Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Property Flyers</h4>
            <p className="text-sm text-gray-600">Most used template category, averaging 45% of downloads</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Agent Engagement</h4>
            <p className="text-sm text-gray-600">87% engagement rate with consistent weekly usage patterns</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Growth Trend</h4>
            <p className="text-sm text-gray-600">23% increase in template usage month-over-month</p>
          </div>
        </div>
      </div>
    </div>
  )
}

