'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Users, 
  BarChart3, 
  Settings,
  FolderOpen,
  ShieldCheck,
  Plus,
  Upload,
  Bell,
  Search,
  UserPlus
} from "lucide-react"
import ContentManager from "@/components/admin/ContentManager"
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard"
import TemplateBuilder from "@/components/admin/TemplateBuilder"
import AgentOnboarding from "@/components/admin/AgentOnboarding"
import ComplianceMonitor from "@/components/admin/ComplianceMonitor"

export default function EnhancedAdminPortal() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showNotifications, setShowNotifications] = useState(false)

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'content', label: 'Content Manager', icon: FolderOpen },
    { id: 'agents', label: 'Team Management', icon: Users },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
    { id: 'templates', label: 'Template Builder', icon: Plus },
    { id: 'onboarding', label: 'Agent Onboarding', icon: UserPlus },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const notifications = [
    { id: 1, type: 'warning', message: 'Business Card Template needs license update', time: '2 hours ago' },
    { id: 2, type: 'success', message: 'Sarah Miller uploaded new property photos', time: '4 hours ago' },
    { id: 3, type: 'info', message: '24 agents downloaded brand guidelines this week', time: '1 day ago' },
    { id: 4, type: 'warning', message: 'Mike Chen\'s template usage exceeds license limits', time: '2 days ago' }
  ]

  const quickActions = [
    { label: 'Add Agent', icon: Users, color: 'blue' },
    { label: 'Upload Asset', icon: Upload, color: 'green' },
    { label: 'Create Template', icon: Plus, color: 'purple' },
    { label: 'Export Report', icon: BarChart3, color: 'orange' }
  ]

  const recentActivity = [
    { action: 'Downloaded', asset: 'Luxury Property Flyer Template', agent: 'Sarah Miller', time: '5 minutes ago' },
    { action: 'Viewed', asset: 'Brand Guidelines 2024', agent: 'John Davis', time: '12 minutes ago' },
    { action: 'Uploaded', asset: 'Open House Sign Template', agent: 'Marketing Team', time: '2 hours ago' },
    { action: 'Updated', asset: 'Email Signature Builder', agent: 'Design Team', time: '4 hours ago' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Great Heights Realty</h1>
                <p className="text-sm text-gray-600">Admin Portal v2.0</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets, agents, templates..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(notification => (
                        <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'warning' ? 'bg-yellow-400' :
                              notification.type === 'success' ? 'bg-green-400' :
                              'bg-blue-400'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button>Admin View</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map(action => {
                const Icon = action.icon
                return (
                  <button key={action.label} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 ${action.color === 'blue' ? 'bg-blue-100' : action.color === 'green' ? 'bg-green-100' : action.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'} rounded-lg mb-4 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${action.color === 'blue' ? 'text-blue-600' : action.color === 'green' ? 'text-green-600' : action.color === 'purple' ? 'text-purple-600' : 'text-orange-600'}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900">{action.label}</h3>
                  </button>
                )
              })}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">+12%</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">2,847</h3>
                <p className="text-sm text-gray-600">Total Downloads</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">+2</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">24</h3>
                <p className="text-sm text-gray-600">Active Agents</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">+8</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">127</h3>
                <p className="text-sm text-gray-600">Brand Assets</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">+23%</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">87%</h3>
                <p className="text-sm text-gray-600">Engagement Rate</p>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {activity.agent.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action} "{activity.asset}"
                          </p>
                          <p className="text-xs text-gray-500">{activity.agent} • {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team Activity Summary */}
              <div>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Agents</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Sarah Miller', downloads: 156, growth: '+23%' },
                      { name: 'John Davis', downloads: 134, growth: '+18%' },
                      { name: 'Mike Chen', downloads: 98, growth: '+15%' },
                      { name: 'Lisa Wang', downloads: 87, growth: '+12%' },
                      { name: 'Tom Garcia', downloads: 76, growth: '+8%' }
                    ].map((agent, index) => (
                      <div key={agent.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                            <p className="text-xs text-gray-500">{agent.downloads} downloads</p>
                          </div>
                        </div>
                        <span className="text-sm text-green-600 font-medium">{agent.growth}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Include the detailed analytics dashboard */}
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <AnalyticsDashboard />
            </div>
          </div>
        )}

        {/* Content Manager Tab */}
        {activeTab === 'content' && (
          <div className="h-[calc(100vh-200px)]">
            <ContentManager />
          </div>
        )}

        {/* Team Management Tab */}
        {activeTab === 'agents' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
                <p className="text-gray-600 mt-1">Manage agent accounts, permissions, and brand access</p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Invite Agent
              </Button>
            </div>

            {/* Agent Management Interface */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Agent Directory</h3>
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      Export List
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      Bulk Actions
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search agents..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">All Agents</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending Invites</option>
                  </select>
                </div>
              </div>

              {/* Agent Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"><input type="checkbox" /></th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { name: 'John Davis', email: 'john@greatheights.com', role: 'Agent', status: 'active', downloads: 47, lastActive: '2 hours ago', access: 'Standard' },
                      { name: 'Sarah Miller', email: 'sarah@greatheights.com', role: 'Senior Agent', status: 'active', downloads: 89, lastActive: '5 hours ago', access: 'Premium' },
                      { name: 'Mike Chen', email: 'mike@greatheights.com', role: 'Agent', status: 'inactive', downloads: 0, lastActive: '3 days ago', access: 'Standard' },
                      { name: 'Lisa Wang', email: 'lisa@greatheights.com', role: 'Agent', status: 'active', downloads: 34, lastActive: '1 day ago', access: 'Standard' }
                    ].map((agent, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><input type="checkbox" /></td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                              <span className="text-blue-600 font-semibold">
                                {agent.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                              <div className="text-sm text-gray-500">{agent.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {agent.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {agent.access}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {agent.downloads}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {agent.lastActive}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">Edit</button>
                            <button className="text-gray-600 hover:text-gray-800">View</button>
                            <button className="text-red-600 hover:text-red-800">Deactivate</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-8">
            <ComplianceMonitor />
          </div>
        )}

        {/* Template Builder Tab */}
        {activeTab === 'templates' && (
          <div className="h-[calc(100vh-200px)]">
            <TemplateBuilder />
          </div>
        )}

        {/* Agent Onboarding Tab */}
        {activeTab === 'onboarding' && (
          <div>
            <AgentOnboarding />
          </div>
        )}

        {/* Original Compliance Tab */}
        {activeTab === 'comply-old' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Compliance Management</h2>
              <p className="text-gray-600 mt-1">Ensure all marketing materials meet real estate industry regulations</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Required Disclaimers</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Equal Housing Opportunity', status: 'compliant', required: true },
                    { title: 'Brokerage License Display', status: 'compliant', required: true },
                    { title: 'Agent License Information', status: 'warning', required: true },
                    { title: 'Fair Housing Logo', status: 'non-compliant', required: true }
                  ].map(disclaimer => (
                    <div key={disclaimer.title} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          disclaimer.status === 'compliant' ? 'bg-green-500' :
                          disclaimer.status === 'warning' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="font-medium text-gray-900">{disclaimer.title}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        disclaimer.status === 'compliant' ? 'bg-green-100 text-green-800' :
                        disclaimer.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {disclaimer.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">License Tracking</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Agent License Valid', count: '22/24', status: 'good' },
                    { title: 'Brokerage License Expires', text: 'March 2024', status: 'warning' },
                    { title: 'Fair Housing Certificate', text: 'Current', status: 'good' },
                    { title: 'MLS Access Active', text: 'All Agents', status: 'good' }
                  ].map(item => (
                    <div key={item.title} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{item.title}</span>
                      <span className="text-sm text-gray-600">{item.count || item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Brand Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Brand Configuration</h3>
                <p className="text-gray-600">Configure branding preferences and default settings.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">System Preferences</h3>
                <p className="text-gray-600">Manage system-wide settings and automation.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
