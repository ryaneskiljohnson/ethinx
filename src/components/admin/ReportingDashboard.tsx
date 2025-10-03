'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface ReportData {
  metrics: {
    totalAssets: number
    activeUsers: number
    downloadsThisMonth: number
    complianceScore: number
    revenueGrowth: number
    newAgents: number
  }
  charts: {
    downloadsOverTime: Array<{ month: string; downloads: number; users: number }>
    categoryBreakdown: Array<{ name: string; value: number; color: string }>
    agentPerformance: Array<{ agent: string; downloads: number; score: number }>
    complianceTrends: Array<{ date: string; score: number; violations: number }>
    realEstateMetrics: {
      listingsGenerated: number
      openHouseMaterials: number
      businessCards: number
      emailSignatures: number
    }
  }
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function ReportingDashboard() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [timeframe, setTimeframe] = useState('30d')
  const [reportType, setReportType] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadReportData()
    
    if (autoRefresh) {
      const interval = setInterval(loadReportData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [timeframe, reportType, autoRefresh])

  const loadReportData = async () => {
    setLoading(true)
    try {
      // Simulate API call to backend analytics
      const mockData: ReportData = {
        metrics: {
          totalAssets: 1247,
          activeUsers: 89,
          downloadsThisMonth: 2847,
          complianceScore: 94,
          revenueGrowth: 23.5,
          newAgents: 7
        },
        charts: {
          downloadsOverTime: [
            { month: 'Jan', downloads: 1200, users: 45 },
            { month: 'Feb', downloads: 1500, users: 52 },
            { month: 'Mar', downloads: 1800, users: 58 },
            { month: 'Apr', downloads: 2100, users: 63 },
            { month: 'May', downloads: 2400, users: 71 },
            { month: 'Jun', downloads: 2847, users: 89 }
          ],
          categoryBreakdown: [
            { name: 'Business Cards', value: 35, color: COLORS[0] },
            { name: 'Listing Materials', value: 28, color: COLORS[1] },
            { name: 'Email Signatures', value: 20, color: COLORS[2] },
            { name: 'Open House Signs', value: 8, color: COLORS[3] },
            { name: 'Postcards', value: 6, color: COLORS[4] },
            { name: 'Other', value: 3, color: COLORS[5] }
          ],
          agentPerformance: [
            { agent: 'Sarah Johnson', downloads: 127, score: 96 },
            { agent: 'Mike Rodriguez', downloads: 98, score: 93 },
            { agent: 'Jennifer Chen', downloads: 84, score: 87 },
            { agent: 'David Wilson', downloads: 73, score: 85 },
            { agent: 'Lisa Brown', downloads: 62, score: 82 }
          ],
          complianceTrends: [
            { date: '2024-01-01', score: 88, violations: 3 },
            { date: '2024-02-01', score: 92, violations: 2 },
            { date: '2024-03-01', score: 94, violations: 1 },
            { date: '2024-04-01', score: 96, violations: 0 },
            { date: '2024-05-01', score: 94, violations: 1 },
            { date: '2024-06-01', score: 94, violations: 1 }
          ],
          realEstateMetrics: {
            listingsGenerated: 147,
            openHouseMaterials: 89,
            businessCards: 256,
            emailSignatures: 312
          }
        }
      }
      
      setReportData(mockData)
    } catch (error) {
      console.error('Failed to load report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting report as ${format}`)
    // Implementation would generate and download report file
  }

  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load report data</p>
        <Button onClick={loadReportData} className="mt-4">Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="overview">Overview</option>
            <option value="detailed">Detailed Analysis</option>
            <option value="compliance">Compliance Report</option>
            <option value="performance">Agent Performance</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <label id="autoRefresh" className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-600">Auto Refresh</span>
          </label>
          
          <Button onClick={() => exportReport('pdf')} variant="outline" size="sm">
            Export PDF
          </Button>
          <Button onClick={() => exportReport('excel')} variant="outline" size="sm">
            Export Excel
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Assets</h3>
              <p className="text-2xl font-bold text-gray-900">{reportData.metrics.totalAssets.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📁</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+12.5%</span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
              <p className="text-2xl font-bold text-gray-900">{reportData.metrics.activeUsers}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+8</span>
            <span className="text-sm text-gray-500 ml-1">this month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Downloads</h3>
              <p className="text-2xl font-bold text-gray-900">{reportData.metrics.downloadsThisMonth.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⬇️</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+24.7%</span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Compliance Score</h3>
              <p className="text-2xl font-bold text-gray-900">{reportData.metrics.complianceScore}%</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛡️</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+2.1%</span>
            <span className="text-sm text-gray-500 ml-1">improved</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Revenue Growth</h3>
              <p className="text-2xl font-bold text-gray-900">{reportData.metrics.revenueGrowth}%</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+${reportData.metrics.revenueGrowth}</span>
            <span className="text-sm text-gray-500 ml-1">MRR increase</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">New Agents</h3>
              <p className="text-2xl font-bold text-gray-900">{reportData.metrics.newAgents}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🆕</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-blue-600">+{reportData.metrics.newAgents}</span>
            <span className="text-sm text-gray-500 ml-1">this month</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Downloads Over Time */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Downloads Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.charts.downloadsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="downloads" stroke="#3B82F6" strokeWidth={3} name="Downloads" />
              <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={3} name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Asset Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.charts.categoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Performance */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Top Performing Agents</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.charts.agentPerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <YAxis dataKey="agent" type="category" />
              <XAxis type="number" />
              <Tooltip />
              <Bar dataKey="downloads" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance Trends */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Compliance Score Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.charts.complianceTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} name="Compliance Score" />
              <Line type="monotone" dataKey="violations" stroke="#EF4444" strokeWidth={2} name="Violations" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real Estate Specific Metrics */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Real Estate Activity Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{reportData.charts.realEstateMetrics.listingsGenerated}</div>
            <div className="text-sm text-gray-500">Listings Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{reportData.charts.realEstateMetrics.openHouseMaterials}</div>
            <div className="text-sm text-gray-500">Open House Materials</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{reportData.charts.realEstateMetrics.businessCards}</div>
            <div className="text-sm text-gray-500">Business Cards</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{reportData.charts.realEstateMetrics.emailSignatures}</div>
            <div className="text-sm text-gray-500">Email Signatures</div>
          </div>
        </div>
      </div>

      {/* Export and Filter Actions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium text-gray-900">Report Generated</h4>
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => loadReportData()} variant="outline" size="sm">
              Refresh Now
            </Button>
            <Button onClick={() => exportReport('csv')} variant="outline" size="sm">
              Export CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
