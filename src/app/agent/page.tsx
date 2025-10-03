'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Download, 
  Copy,
  Eye,
  Share2,
  Heart,
  Search,
  Filter,
  Grid3X3,
  List,
  ArrowRight
} from "lucide-react"

export default function AgentBrandGuide() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'logos', 'colors', 'typography', 'templates', 'imagery', 'compliance']
  
  const brandAssets = [
    {
      id: 1,
      name: "Primary Logo - Horizontal",
      type: "logo",
      format: "PNG, SVG, PDF",
      description: "Main brokerage logo for digital and print use",
      thumbnail: "bg-blue-600",
      downloads: 145
    },
    {
      id: 2,
      name: "Primary Logo - Vertical",
      type: "logo", 
      format: "PNG, SVG",
      description: "Stacked logo variant for narrow spaces",
      thumbnail: "bg-green-600",
      downloads: 89
    },
    {
      id: 3,
      name: "Brand Color Palette",
      type: "colors",
      format: "PDF, ASE",
      description: "Complete color system with hex codes and usage",
      thumbnail: "bg-purple-600",
      downloads: 234
    },
    {
      id: 4,
      name: "Business Card Template",
      type: "templates",
      format: "AI, PSD",
      description: "Customizable business card design",
      thumbnail: "bg-orange-600",
      downloads: 156
    },
    {
      id: 5,
      name: "Property Flyer - Luxury",
      type: "templates",
      format: "AI, PSD",
      description: "Premium listing flyer template",
      thumbnail: "bg-red-600",
      downloads: 98
    },
    {
      id: 6,
      name: "Email Signature Builder",
      type: "templates",
      format: "Online Tool",
      description: "Generate compliant email signatures",
      thumbnail: "bg-teal-600",
      downloads: 167
    }
  ]

  const filteredAssets = selectedCategory === 'all' 
    ? brandAssets 
    : brandAssets.filter(asset => asset.type === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Great Heights Realty</h1>
                  <p className="text-gray-600">Brand Asset Library • Updated January 2024</p>
                </div>
              </div>
              <p className="text-lg text-gray-700 max-w-2xl">
                Access all brand materials, templates, and guidelines to create consistent, 
                professional marketing content that builds trust with your clients.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">6</div>
              <div className="text-sm text-gray-600">Brand Assets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">24</div>
              <div className="text-sm text-gray-600">Agent Access</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">893</div>
              <div className="text-sm text-gray-600">Total Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600">Active Templates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Category Filter */}
              <div className="flex space-x-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Asset Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredAssets.map(asset => (
            <div key={asset.id} className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${viewMode === 'list' ? 'flex' : ''}`}>
              {/* Thumbnail */}
              <div className={`${viewMode === 'grid' ? 'h-48' : 'w-48 h-32'} bg-gradient-to-br ${asset.thumbnail} rounded-t-xl ${viewMode === 'list' ? 'rounded-none rounded-l-xl' : ''} flex items-center justify-center`}>
                <div className="text-white text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-2" />
                  <div className="text-sm font-medium">{asset.type.toUpperCase()}</div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{asset.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {asset.format}
                  </span>
                  <span className="text-xs text-gray-500">
                    {asset.downloads} downloads
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline">
            Load More Assets
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>

      {/* Usage Guidelines */}
      <section className="bg-gray-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Usage Guidelines</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">✅ Do</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Use approved logos and templates only
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Keep clear space around logos per guidelines
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Use correct file formats for each medium
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Maintain brand color accuracy
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">❌ Don't</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Alter logo proportions or colors
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Use outdated versions of assets
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Create unauthorized variations
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Use brand assets on conflicting backgrounds
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Need help or have questions about brand usage?</p>
            <Button variant="outline">
              Contact Brand Manager
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
