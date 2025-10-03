'use client'

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  UserPlus, 
  Mail, 
  Phone, 
  Building2, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Star,
  Award,
  Settings
} from "lucide-react"

interface AgentData {
  name: string
  email: string
  phone: string
  role: 'agent' | 'senior-agent' | 'broker'
  team?: string
  permissions: string[]
  startDate: string
  status: 'pending' | 'invited' | 'active' | 'suspended'
}

interface OnboardingStep {
  id: number
  title: string
  description: string
  completed: boolean
  required: boolean
}

export default function AgentOnboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [agentData, setAgentData] = useState<AgentData>({
    name: '',
    email: '',
    phone: '',
    role: 'agent',
    permissions: [],
    startDate: '',
    status: 'invited'
  })

  const onboardingSteps: OnboardingStep[] = [
    { id: 1, title: 'Basic Information', description: 'Name, email, phone number', completed: false, required: true },
    { id: 2, title: 'Role & Permissions', description: 'Agent role and access levels', completed: false, required: true },
    { id: 3, title: 'Brand Access', description: 'Brand assets and template access', completed: false, required: true },
    { id: 4, title: 'Compliance Setup', description: 'License verification and disclaimers', completed: false, required: true },
    { id: 5, title: 'Team Assignment', description: 'Agent to team and supervisor assignment', completed: false, required: false },
    { id: 6, title: 'Review & Activate', description: 'Final review and account activation', completed: false, required: true }
  ]

  const permissionGroups = [
    {
      name: 'Brand Assets',
      permissions: [
        { id: 'view-logos', name: 'View Brand Logos', description: 'Access to company logos and variations' },
        { id: 'download-templates', name: 'Download Templates', description: 'Download business cards, flyers, etc.' },
        { id: 'custom-templates', name: 'Custom Templates', description: 'Modify templates with personal info' },
        { id: 'access-photos', name: 'Stock Photos', description: 'Access to licensed photography' }
      ]
    },
    {
      name: 'Marketing Tools',
      permissions: [
        { id: 'email-signatures', name: 'Email Signatures', description: 'Generate branded email signatures' },
        { id: 'social-media', name: 'Social Media Posts', description: 'Access social media templates' },
        { id: 'direct-mail', name: 'Direct Mail', description: 'Create direct mail materials' },
        { id: 'digital-scan', name: 'Digital QR Codes', description: 'Generate QR codes for properties' }
      ]
    }
  ]

  const rolePermissions = {
    'agent': ['view-logos', 'download-templates', 'custom-templates'],
    'senior-agent': ['view-logos', 'download-templates', 'custom-templates', 'access-photos', 'email-signatures', 'social-media'],
    'broker': ['view-logos', 'download-templates', 'custom-templates', 'access-photos', 'email-signatures', 'social-media', 'direct-mail', 'digital-scan']
  }

  const updateAgentData = (field: keyof AgentData, value: any) => {
    setAgentData(prev => ({ ...prev, [field]: value }))
    
    // Auto-update permissions based on role
    if (field === 'role') {
      setAgentData(prev => ({ ...prev, permissions: rolePermissions[value] || [] }))
    }
  }

  const togglePermission = (permissionId: string) => {
    setAgentData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const nextStep = () => {
    if (currentStep < onboardingSteps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <UserPlus className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Add New Agent</h2>
              <p className="text-gray-600 mt-2">Enter basic information for the new agent</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={agentData.name}
                  onChange={(e) => updateAgentData('name', e.target.value)}
                  placeholder="John Smith"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={agentData.email}
                  onChange={(e) => updateAgentData('email', e.target.value)}
                  placeholder="john@greatheights.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={agentData.phone}
                  onChange={(e) => updateAgentData('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={agentData.startDate}
                  onChange={(e) => updateAgentData('startDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Shield className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Role & Permissions</h2>
              <p className="text-gray-600 mt-2">Configure agent role and access permissions</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="role">Agent Role</Label>
                <select
                  id="role"
                  value={agentData.role}
                  onChange={(e) => updateAgentData('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="agent">Agent</option>
                  <option value="senior-agent">Senior Agent</option>
                  <option value="broker">Broker</option>
                </select>
              </div>

              {permissionGroups.map(group => (
                <div key={group.name} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{group.name}</h3>
                  <div className="space-y-3">
                    {group.permissions.map(permission => (
                      <div key={permission.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={permission.id}
                              checked={agentData.permissions.includes(permission.id)}
                              onChange={() => togglePermission(permission.id)}
                              className="rounded mr-3"
                            />
                            <label htmlFor={permission.id} className="font-medium text-gray-900">
                              {permission.name}
                            </label>
                          </div>
                          <p className="text-sm text-gray-600 ml-6">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Brand Access</h2>
              <p className="text-gray-600 mt-2">Configure access to brand assets and templates</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Prioritized Access
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Business Card Templates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Property Flyers
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Email Signatures
                  </li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-500" />
                  Available Templates
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Open House', 'Just Listed', 'Just Sold', 'Market Report', 'Community Post', 'Holiday'].map(template => (
                    <div key={template} className="bg-gray-50 rounded p-2 text-sm text-center">
                      {template}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Shield className="w-12 h-12 mx-auto mb-4 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Compliance Setup</h2>
              <p className="text-gray-600 mt-2">Verify licenses and set up compliance requirements</p>
            </div>

            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Required Verification
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-800">Real Estate License Verification</span>
                    <Button variant="outline" size="sm">Verify License</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-800">Fair Housing Certificate</span>
                    <Button variant="outline" size="sm">Upload Certificate</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-800">MLS Access Agreement</span>
                    <Button variant="outline" size="sm">Sign Agreement</Button>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Automatic Disclaimers</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-gray-900">Equal Housing Opportunity Statement</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-gray-900">Agent License Number Display</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-gray-900">Brokerage License Information</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Team Assignment</h2>
              <p className="text-gray-600 mt-2">Assign agent to teams and supervisors</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="team">Team Assignment</Label>
                <select
                  id="team"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Team</option>
                  <option value="luxury-properties">Luxury Properties</option>
                  <option value="first-time-buyers">First Time Buyers</option>
                  <option value="commercial">Commercial</option>
                  <option value="property-management">Property Management</option>
                </select>
              </div>

              <div>
                <Label htmlFor="supervisor">Supervisor</Label>
                <select
                  id="supervisor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Supervisor</option>
                  <option value="sarah-miller">Sarah Miller</option>
                  <option value="tom-garcia">Tom Garcia</option>
                  <option value="lisa-wang">Lisa Wang</option>
                </select>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentorship Program</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input type="checkbox" className="rounded mr-3" />
                  <span className="text-gray-900">Assign experienced mentor</span>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="rounded mr-3" />
                  <span className="text-gray-900">30-day onboarding review</span>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="rounded mr-3" />
                  <span className="text-gray-900">Weekly check-ins for first month</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Review & Activate</h2>
              <p className="text-gray-600 mt-2">Review all information before activating the agent account</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{agentData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{agentData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{agentData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium text-gray-900 capitalize">{agentData.role.replace('-', ' ')}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {agentData.permissions.map(permission => (
                    <div key={permission} className="bg-white rounded p-2 text-sm">
                      {permission.replace('-', ' ')}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Next Steps</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Agent will receive welcome email with login credentials</li>
                  <li>• Brand access permissions will be activated automatically</li>
                  <li>• Compliance requirements will be tracked in dashboard</li>
                  <li>• Training schedule will be sent separately</li>
                </ul>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {onboardingSteps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step.id ? <CheckCircle className="w-6 h-6" /> : <span>{step.id}</span>}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button 
          onClick={previousStep} 
          variant="outline" 
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button 
          onClick={nextStep} 
          disabled={currentStep === onboardingSteps.length}
          className="flex items-center"
        >
          {currentStep === onboardingSteps.length ? 'Complete' : 'Next'}
          {currentStep < onboardingSteps.length && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  )
}

