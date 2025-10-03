'use client'

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  X,
  Folder,
  FolderOpen,
  Search,
  Filter
} from "lucide-react"

interface BrandAsset {
  id: string
  name: string
  category: string
  subcategory: string
  description: string
  tags: string[]
  fileTypes: string[]
  thumbnail: string
  createdAt: string
  updatedAt: string
  uploadedBy: string
  downloads: number
  status: 'draft' | 'published' | 'archived'
  size: string
  license: string
  usage: 'brokerage' | 'agent' | 'public'
}

export default function ContentManager() {
  const [selectedAsset, setSelectedAsset] = useState<BrandAsset | null>(null)
  const [editingAsset, setEditingAsset] = useState<Partial<BrandAsset>>({})
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['brand-fundamentals'])

  const categories = [
    { id: 'brand-fundamentals', name: 'Brand Fundamentals', children: [
      { id: 'logos', name: 'Logos' },
      { id: 'colors', name: 'Colors' },
      { id: 'typography', name: 'Typography' }
    ]},
    { id: 'marketing-templates', name: 'Marketing Templates', children: [
      { id: 'business-cards', name: 'Business Cards' },
      { id: 'property-flyers', name: 'Property Flyers' },
      { id: 'open-house-signs', name: 'Open House Signs' },
      { id: 'email-signatures', name: 'Email Signatures' },
      { id: 'social-media', name: 'Social Media Templates' }
    ]},
    { id: 'digital-assets', name: 'Digital Assets', children: [
      { id: 'photos', name: 'Stock Photos' },
      { id: 'icons', name: 'Icons & Graphics' },
      { id: 'backgrounds', name: 'Background Images' }
    ]},
    { id: 'compliance', name: 'Compliance Materials', children: [
      { id: 'disclaimers', name: 'Required Disclaimers' },
      { id: 'license-info', name: 'License Information' },
      { id: 'legal-docs', name: 'Legal Documents' }
    ]}
  ]

  const mockAssets: BrandAsset[] = [
    {
      id: '1',
      name: 'Primary Logo - Horizontal',
      category: 'logos',
      subcategory: 'main-logo',
      description: 'Main brokerage logo for digital and print use. Maintain clear space equal to height of H in Heights.',
      tags: ['logo', 'primary', 'horizontal', 'print'],
      fileTypes: ['PNG', 'SVG', 'PDF', 'EPS'],
      thumbnail: 'bg-blue-600',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      uploadedBy: 'Sarah Miller',
      downloads: 145,
      status: 'published',
      size: '2.4 MB',
      license: 'Commercial Use',
      usage: 'agent'
    },
    {
      id: '2',
      name: 'Brand Color Palette 2024',
      category: 'colors',
      subcategory: 'color-system',
      description: 'Complete color system with hex codes, RGB values, and usage guidelines for all marketing materials.',
      tags: ['colors', 'palette', 'brand', 'primary', 'secondary'],
      fileTypes: ['PDF', 'ASE', 'ACO'],
      thumbnail: 'bg-purple-600',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      uploadedBy: 'Marketing Team',
      downloads: 234,
      status: 'published',
      size: '1.8 MB',
      license: 'Internal Use Only',
      usage: 'agent'
    },
    {
      id: '3',
      name: 'Luxury Property Flyer Template',
      category: 'property-flyers',
      subcategory: 'luxury',
      description: 'Premium listing flyer template for luxury properties. Includes photo placement and design elements.',
      tags: ['flyer', 'luxury', 'template', 'property', 'listing'],
      fileTypes: ['AI', 'PSD', 'PDF'],
      thumbnail: 'bg-green-600',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-22',
      uploadedBy: 'Design Team',
      downloads: 98,
      status: 'published',
      size: '15.2 MB',
      license: 'Commercial Use',
      usage: 'agent'
    }
  ]

  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = filterCategory === 'all' || asset.category === filterCategory
    
    return matchesSearch && matchesCategory
  })

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  const handleAssetEdit = (asset: BrandAsset) => {
    setEditingAsset(asset)
    setSelectedAsset(asset)
    setShowAssetModal(true)
  }

  const saveAssetChanges = () => {
    // Implement save logic
    console.log('Saving asset changes:', editingAsset)
    setShowAssetModal(false)
    setEditingAsset({})
    setSelectedAsset(null)
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Library</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <React.Fragment key={cat.id}>
                  <option value={cat.id}>{cat.name}</option>
                  {cat.children?.map(child => (
                    <option key={child.id} value={child.id}>  {child.name}</option>
                  ))}
                </React.Fragment>
              ))}
            </select>
          </div>
        </div>

        {/* Folder Structure */}
        <div className="flex-1 p-4 space-y-2">
          {categories.map(category => (
            <div key={category.id}>
              <button
                onClick={() => toggleFolder(category.id)}
                className="flex items-center w-full text-left py-2 px-2 rounded-lg hover:bg-gray-100"
              >
                {expandedFolders.includes(category.id) ? 
                  <FolderOpen className="w-4 h-4 mr-2 text-blue-600" /> :
                  <Folder className="w-4 h-4 mr-2 text-gray-600" />
                }
                <span className="font-medium text-gray-900">{category.name}</span>
              </button>
              
              {expandedFolders.includes(category.id) && (
                <div className="ml-6 space-y-1">
                  {category.children?.map(child => (
                    <button
                      key={child.id}
                      onClick={() => setFilterCategory(child.id)}
                      className={`flex items-center w-full text-left py-1 px-2 rounded-lg text-sm ${
                        filterCategory === child.id 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Asset Button */}
        <div className="p-4 border-t border-gray-200">
          <Button 
            className="w-full"
            onClick={() => setShowAssetModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Asset
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Manager</h1>
              <p className="text-gray-600 mt-1">
                Manage brand assets, templates, and marketing materials
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Asset
              </Button>
            </div>
          </div>
        </div>

        {/* Asset Grid */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map(asset => (
              <div key={asset.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                <div className={`h-48 bg-gradient-to-br ${asset.thumbnail} rounded-t-xl flex items-center justify-center`}>
                  <div className="text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                      {asset.category === 'logos' ? '🏢' : 
                       asset.category === 'colors' ? '🎨' : 
                       asset.category === 'property-flyers' ? '📄' : '📎'}
                    </div>
                    <div className="text-sm font-medium">{asset.category.replace('-', ' ')}</div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">{asset.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      asset.status === 'published' ? 'bg-green-100 text-green-800' :
                      asset.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {asset.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{asset.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-500">{asset.fileTypes.join(', ')}</span>
                    <span className="text-xs text-gray-500">{asset.downloads} downloads</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAssetEdit(asset)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Detail Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedAsset ? 'Edit Asset' : 'Add New Asset'}
              </h3>
              <Button variant="outline" size="sm" onClick={() => setShowAssetModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form className="space-y-6">
              <div>
                <Label htmlFor="name">Asset Name</Label>
                <Input
                  id="name"
                  value={editingAsset.name || selectedAsset?.name || ''}
                  onChange={(e) => setEditingAsset(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Primary Logo Horizontal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select 
                    id="category"
                    value={editingAsset.category || selectedAsset?.category || ''}
                    onChange={(e) => setEditingAsset(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="logos">Logos</option>
                    <option value="colors">Colors</option>
                    <option value="typography">Typography</option>
                    <option value="templates">Templates</option>
                    <option value="imagery">Imagery</option>
                    <option value="compliance">Compliance</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select 
                    id="status"
                    value={editingAsset.status || selectedAsset?.status || 'draft'}
                    onChange={(e) => setEditingAsset(prev => ({ ...prev, status: e.target.value as BrandAsset['status'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea 
                  id="description"
                  value={editingAsset.description || selectedAsset?.description || ''}
                  onChange={(e) => setEditingAsset(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={editingAsset.tags?.join(', ') || selectedAsset?.tags?.join(', ') || ''}
                  onChange={(e) => setEditingAsset(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))}
                  placeholder="logo, primary, branding"
                />
              </div>

              <div>
                <Label htmlFor="usage">Usage Permission</Label>
                <select 
                  id="usage"
                  value={editingAsset.usage || selectedAsset?.usage || 'agent'}
                    onChange={(e) => setEditingAsset(prev => ({ ...prev, usage: e.target.value as BrandAsset['usage'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="agent">All Agents</option>
                  <option value="brokerage">Brokerage Only</option>
                  <option value="public">Public Access</option>
                </select>
              </div>

              <div>
                <Label>File Upload</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Drag and drop files here or click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">Supports PNG, SVG, PDF, AI, PSD</p>
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowAssetModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={saveAssetChanges}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
