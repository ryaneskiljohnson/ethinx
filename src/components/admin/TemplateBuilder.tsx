'use client'

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Plus, 
  Eye, 
  Download, 
  Save, 
  Settings,
  Type,
  Image,
  Palette,
  Layout,
  Text,
  Square,
  X
} from "lucide-react"

interface TemplateField {
  id: string
  type: 'text' | 'image' | 'color' | 'spacing'
  label: string
  defaultValue?: string
  required: boolean
  options?: string[]
  placeholder?: string
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  fields: TemplateField[]
  layout: any
  preview?: string
}

export default function TemplateBuilder() {
  const [activeTab, setActiveTab] = useState('sections')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([])
  const [templateData, setTemplateData] = useState<any>({})
  const [showPreview, setShowPreview] = useState(false)

  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: Type },
    { type: 'image', label: 'Image Upload', icon: Image },
    { type: 'color', label: 'Color Picker', icon: Palette },
    { type: 'spacing', label: 'Spacing', icon: Layout }
  ]

  const templateCategories = [
    { id: 'business-cards', name: 'Business Cards', icon: Square },
    { id: 'property-flyers', name: 'Property Flyers', icon: Image },
    { id: 'email-signatures', name: 'Email Signatures', icon: Type },
    { id: 'social-media', name: 'Social Media Posts', icon: Square },
    { id: 'open-house-signs', name: 'Open House Signs', icon: Square }
  ]

  const addField = (type: TemplateField['type']) => {
    const newField: TemplateField = {
      id: Date.now().toString(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      placeholder: `Enter ${type}...`
    }
    setTemplateFields([...templateFields, newField])
  }

  const removeField = (fieldId: string) => {
    setTemplateFields(templateFields.filter(f => f.id !== fieldId))
  }

  const updateField = (fieldId: string, updates: Partial<TemplateField>) => {
    setTemplateFields(templateFields.map(f => 
      f.id === fieldId ? { ...f, ...updates } : f
    ))
  }

  const generatePreview = () => {
    setShowPreview(true)
    // Generate preview based on template fields and data
  }

  const saveTemplate = () => {
    const template: Template = {
      id: Date.now().toString(),
      name: 'Custom Template',
      description: 'Template built with builder',
      category: 'business-cards',
      fields: templateFields,
      layout: {}
    }
    console.log('Saving template:', template)
  }

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Template Sections */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Template Builder</h2>
        </div>

        {/* Template Categories */}
        <div className="p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Categories</h3>
          {templateCategories.map(category => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                  activeTab === category.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            )
          })}
        </div>

        {/* Field Types */}
        <div className="flex-1 p-4">
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">Add Fields</h3>
          <div className="space-y-2">
            {fieldTypes.map(fieldType => {
              const Icon = fieldType.icon
              return (
                <button
                  key={fieldType.type}
                  onClick={() => addField(fieldType.type as any)}
                  className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Icon className="w-4 h-4 mr-3 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{fieldType.label}</span>
                  <Plus className="w-4 h-4 ml-auto text-gray-400" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <Button 
            onClick={generatePreview} 
            className="w-full" 
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Template
          </Button>
          <Button 
            onClick={saveTemplate} 
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Business Card Template</h1>
              <p className="text-sm text-gray-600">Create customizable business cards for your agents</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-6 flex items-center justify-center">
          {showPreview ? (
            /* Preview Mode */
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 w-full max-w-md">
              <div className="space-y-4">
                {/* Brand Logo Area */}
                <div className="h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building className="w-10 h-10 text-gray-400" />
                </div>
                
                {/* Agent Info */}
                <div className="text-center space-y-2">
                  <div className="h-6 bg-blue-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
                
                {/* Contact Info */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ) : (
            /* Builder Mode */
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 w-full max-w-md">
              <div className="text-center py-8">
                <Layout className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Design Canvas</h3>
                <p className="text-gray-600 mb-4">Add fields from the sidebar to start building</p>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Field Properties */}
      {templateFields.length > 0 && (
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Template Fields</h3>
          
          <div className="space-y-4">
            {templateFields.map(field => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-medium text-gray-900">{field.label}</h4>
                  <button
                    onClick={() => removeField(field.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`label-${field.id}`}>Field Label</Label>
                    <Input
                      id={`label-${field.id}`}
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Field label"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`placeholder-${field.id}`}>Placeholder</Label>
                    <Input
                      id={`placeholder-${field.id}`}
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      placeholder="Placeholder text"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`required-${field.id}`}
                      checked={field.required}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor={`required-${field.id}`}>Required Field</Label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
