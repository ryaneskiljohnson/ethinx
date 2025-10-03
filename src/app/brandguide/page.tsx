'use client'

import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Download, 
  ExternalLink,
  Copy,
  Heart,
  Share2
} from "lucide-react"

export default function BrandGuide() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Great Heights Realty</h1>
              <p className="text-sm text-gray-600">Brand Guidelines • Updated Jan 2024</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-200 sticky top-0 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex space-x-8 py-4">
            <a href="#logos" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">Logos</a>
            <a href="#colors" className="text-gray-600 font-medium hover:text-gray-900 transition-colors pb-4">Colors</a>
            <a href="#typography" className="text-gray-600 font-medium hover:text-gray-900 transition-colors pb-4">Typography</a>
            <a href="#spacing" className="text-gray-600 font-medium hover:text-gray-900 transition-colors pb-4">Spacing</a>
            <a href="#templates" className="text-gray-600 font-medium hover:text-gray-900 transition-colors pb-4">Templates</a>
            <a href="#imagery" className="text-gray-600 font-medium hover:text-gray-900 transition-colors pb-4">Imagery</a>
            <a href="#compliance" className="text-gray-600 font-medium hover:text-gray-900 transition-colors pb-4">Compliance</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Hero Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white">
            <h2 className="text-4xl font-bold mb-4">Building Trust Through Consistent Branding</h2>
            <p className="text-xl text-white/90 max-w-2xl">
                      Our brand guidelines ensure every interaction with Great Heights Realty 
                      reinforces our commitment to excellence, integrity, and client success.
            </p>
          </div>
        </section>

        {/* Logos Section */}
        <section id="logos" className="mb-16">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Logos</h3>
            <p className="text-gray-600 text-lg">
              Our logo represents the pinnacle of real estate excellence. Use these guidelines 
              to maintain consistency across all materials and touchpoints.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Primary Logo */}
            <div className="bg-gray-50 rounded-xl p-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Primary Logo</h4>
              <div className="bg-white rounded-lg p-8 shadow-sm mb-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center mb-4">
                    <Building2 className="w-16 h-16 text-white" />
                  </div>
                  <div className="font-bold text-gray-900">Great Heights</div>
                  <div className="text-sm text-gray-600">Realty</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  PNG
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  SVG
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>

            {/* Usage Guidelines */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h5 className="font-semibold text-gray-900 mb-3">Usage Guidelines</h5>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Maintain clear space equal to the height of the "H" in "Heights"
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Minimum size: 100px width for digital, 1 inch for print
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Never alter website colors or proportions
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Use on white or light backgrounds for maximum impact
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h5 className="font-semibold text-red-900 mb-3">Do Not</h5>
                <ul className="space-y-2 text-red-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Stretch or distort the logo proportions
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Change any colors or add effects
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Use on busy or conflicting backgrounds
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Colors Section */}
        <section id="colors" className="mb-16">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Brand Colors</h3>
            <p className="text-gray-600 text-lg">
              Our color palette reflects professionalism, trust, and the natural beauty 
              of Colorado's real estate landscape.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Primary Colors</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-lg mr-4"></div>
                      <div>
                        <div className="font-semibold text-gray-900">Mountain Blue</div>
                        <div className="text-sm text-gray-600">Primary Brand Color</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-mono">#2563EB</div>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-green-600 rounded-lg mr-4"></div>
                      <div>
                        <div className="font-semibold text-gray-900">Forest Green</div>
                        <div className="text-sm text-gray-600">Secondary Accent</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-mono">#059669</div>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Neutral Colors</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gray-900 rounded-lg mr-4"></div>
                      <div>
                        <div className="font-semibold text-gray-900">Charcoal</div>
                        <div className="text-sm text-gray-600">Text Primary</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-mono">#111827</div>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg mr-4 border"></div>
                      <div>
                        <div className="font-semibold text-gray-900">Light Gray</div>
                        <div className="text-sm text-gray-600">Background</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-mono">#F9FAFB</div>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Section */}
        <section id="templates" className="mb-16">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Marketing Templates</h3>
            <p className="text-gray-600 text-lg">
              Pre-built templates for all your marketing needs, customizable for each agent 
              while maintaining brand consistency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="font-semibold">Business Card</div>
                  <div className="text-sm">Professional agent cards</div>
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Agent Business Card</h4>
              <p className="text-gray-600 text-sm mb-4">
                      Customizable business cards featuring your contact information 
                      while maintaining brand consistency.
              </p>
              <div className="flex space-x-2">
                <Button size="sm" className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Customize
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                      <div className="w-full h-48 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-2" />
                  <div className="font-semibold">Property Flyer</div>
                  <div className="text-sm">Listing presentations</div>
                </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Property Listing Flyer</h4>
              <p className="text-gray-600 text-sm mb-4">
                      Eye-catching flyers that highlight property features while 
                      showcasing your professional branding.
              </p>
              <div className="flex space-x-2">
                <Button size="sm" className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Customize
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="font-semibold">Email Signature</div>
                  <div className="text-sm">Professional email template</div>
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Email Signature</h4>
              <p className="text-gray-600 text-sm mb-4">
                      Professional email signatures that reinforce brand recognition 
                      with every client communication.
              </p>
              <div className="flex space-x-2">
                <Button size="sm" className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Customize
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Customization */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Agent Customization</h3>
            <p className="text-gray-600 mb-6">
              Maintain your brokerage brand while allowing agents to add their personal touch. 
              Agents can customize contact information while keeping all brand elements consistent.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">Agent Information</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Name and title</li>
                    <li>• Contact information</li>
                    <li>• Professional certifications</li>
                    <li>• Specialization areas</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">Brand Elements</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Logo placement and sizing</li>
                    <li>• Color usage guidelines</li>
                    <li>• Typography standards</li>
                    <li>• Required disclaimers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Section */}
        <section id="compliance" className="mb-16">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Real Estate Compliance</h3>
            <p className="text-gray-600 text-lg">
              Essential compliance requirements for all marketing materials to ensure 
              regulatory adherence and professional standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Required Disclaimers
              </h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Equal Housing Opportunity statement
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Brokerage license information
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Agent license number display
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Fair housing logo requirement
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                Quality Standards
              </h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  High-resolution images only (300 DPI minimum)
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Consistent typography and spacing
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Professional photography standards
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Brand voice consistency in copy
                </li>
              </ul>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
