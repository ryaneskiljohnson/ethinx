'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Download, 
  Search, 
  Menu, 
  Home, 
  Star, 
  User,
  Settings,
  Bell,
  Filter,
  Grid3X3,
  List,
  Heart,
  Share2,
  Eye,
  MoreVertical
} from "lucide-react"

export default function MobileAgentPortal() {
  const [activeTab, setActiveTab] = useState('home')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'stats', label: 'Stats', icon: Star },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ]

  const quickActions = [
    { label: 'Business Card', icon: Download, color: 'bg-blue-500' },
    { label: 'Property Flyer', icon: Building2, color: 'bg-green-500' },
    { label: 'Open House Sign', icon: Star, color: 'bg-purple-500' },
    { label: 'Email Signature', icon: Share2, color: 'bg-orange-500' }
  ]

  const recentAssets = [
    { name: 'Business Card Template', downloads: 5, category: 'templates', desc: 'Professional agent cards' },
    { name: 'Property Flyer - Luxury', downloads: 3, category: 'templates', desc: 'High-end listing materials' },
    { name: 'Primary Logo PNG', downloads: 2, category: 'logos', desc: 'Main logo files' },
    { name: 'Brand Colors', downloads: 1, category: 'colors', desc: 'Color palette' },
    { name: 'Email Signature Builder', downloads: 4, category: 'tools', desc: 'Generate signatures' }
  ]

  const categories = ['all', 'templates', 'logos', 'colors', 'tools', 'photos']

  const renderHome = () => (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-gray-600">Sarah Miller</p>
        </div>
        <div className="relative">
          <Button size="sm" variant="outline" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <button key={index} className={`${action.color} rounded-lg p-4 text-white text-center`}>
              <action.icon className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm font-medium">{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">This Month</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">15</div>
            <div className="text-xs text-gray-600">Downloads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-xs text-gray-600">Templates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">3</div>
            <div className="text-xs text-gray-600">Properties</div>
          </div>
        </div>
      </div>

      {/* Recent Assets */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Assets</h2>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <div className="space-y-3">
          {recentAssets.map((asset, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{asset.name}</h3>
                <p className="text-sm text-gray-600">{asset.desc}</p>
                <p className="text-xs text-gray-500">{asset.downloads} downloads</p>
              </div>
              <Button size="sm" variant="outline">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAssetLibrary = () => (
    <div className="space-y-4 p-4">
      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex space-x-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search assets..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-full text-gray-700"
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">All Assets</h2>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Asset Grid/List */}
        <div className={`mt-4 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}>
          {recentAssets.map((asset, index) => (
            viewMode === 'grid' ? (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm">{asset.name}</h3>
                  <p className="text-xs text-gray-600">{asset.desc}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">{asset.downloads} dl</span>
                    <button className="text-blue-600">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{asset.name}</h3>
                  <p className="text-sm text-gray-600">{asset.desc}</p>
                  <p className="text-xs text-gray-500">{asset.downloads} downloads</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-1 text-gray-600 hover:text-blue-600">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-600 hover:text-blue-600">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-600 hover:text-blue-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  )

  const renderProfile = () => (
    <div className="space-y-6 p-4">
      {/* Profile Header */}
      <div className="bg-white rounded-xl p-6 text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <User className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Sarah Miller</h1>
        <p className="text-gray-600">Senior Agent</p>
        <p className="text-sm text-gray-500">Great Heights Realty</p>
      </div>

      {/* Profile Stats */}
      <div className="bg-white rounded-xl p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Stats</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Downloads</span>
            <span className="font-medium text-gray-900">156</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Templates Used</span>
            <span className="font-medium text-gray-900">43</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Team Rank</span>
            <span className="font-medium text-gray-900">#2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Member Since</span>
            <span className="font-medium text-gray-900">March 2023</span>
          </div>
        </div>
      </div>

      {/* Quick Settings */}
      <div className="bg-white rounded-xl p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Settings</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Push Notifications</span>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Brand Updates</span>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Team Messages</span>
            <div className="w-12 h-6 bg-gray-300 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome()
      case 'stats': return renderAssetLibrary()
      case 'profile': return renderProfile()
      case 'settings': return <div>Settings</div>
      default: return renderHome()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">RealBrand Pro</span>
          </div>
          <Button variant="outline" size="sm">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-20">
        {renderContent()}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  activeTab === tab.id ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

