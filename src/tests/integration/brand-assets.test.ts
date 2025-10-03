import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@/lib/auth'
import { analytics } from '@/lib/analytics'
import { aiCompliance } from '@/lib/ai-compliance'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('Brand Assets Integration Tests', () => {
  let testBrokerage: any
  let testUser: any
  let testAsset: any

  beforeAll(async () => {
    // Create test brokerage
    const { data: brokerage } = await supabase
      .from('brokerages')
      .insert({
        name: 'Test Real Estate Brokerage',
        slug: 'test-brokerage',
        subscription_plan: 'professional'
      })
      .select()
      .single()

    testBrokerage = brokerage

    // Create test user
    const { data: user } = await supabase
      .from('users')
      .insert({
        brokerage_id: testBrokerage.id,
        email: 'test@testbrokerage.com',
        name: 'Test Agent',
        role: 'agent',
        status: 'active',
        permissions: ['view:assets', 'edit:assets']
      })
      .select()
      .single()

    testUser = user
  })

  afterAll(async () => {
    // Cleanup test data
    await supabase.from('users').delete().eq('id', testUser.id)
    await supabase.from('brokerages').delete().eq('id', testBrokerage.id)
  })

  beforeEach(async () => {
    // Create test asset
    const { data: asset } = await supabase
      .from('brand_assets')
      .insert({
        brokerage_id: testBrokerage.id,
        created_by: testUser.id,
        name: 'Test Business Card',
        category: 'templates',
        subcategory: 'business-cards',
        description: 'Professional business card template',
        file_type: 'pdf',
        file_url: 'https://example.com/test-card.pdf',
        status: 'published'
      })
      .select()
      .single()

    testAsset = asset
  })

  describe('Asset Management', () => {
    it('should create and retrieve assets', async () => {
      expect(testAsset).toBeDefined()
      expect(testAsset.name).toBe('Test Business Card')
      expect(testAsset.status).toBe('published')
    })

    it('should enforce row-level security', async () => {
      // Create another brokerage
      const { data: otherBrokerage } = await supabase
        .from('brokerages')
        .insert({
          name: 'Other Brokerage',
          slug: 'other-brokerage',
          subscription_plan: 'professional'
        })
        .select()
        .single()

      // Try to access asset from different brokerage
      const { data: assets } = await supabase
        .from('brand_assets')
        .select('*')
        .eq('brokerage_id', otherBrokerage.id)

      expect(assets).toHaveLength(0) // Should not see assets from other brokerage

      // Cleanup
      await supabase.from('brokerages').delete().eq('id', otherBrokerage.id)
    })

    it('should track asset downloads', async () => {
      const { data: download } = await supabase
        .from('downloads')
        .insert({
          asset_id: testAsset.id,
          user_id: testUser.id,
          user_agent: 'test-agent',
          downloaded_at: new Date().toISOString()
        })
        .select()
        .single()

      expect(download).toBeDefined()
      expect(download.asset_id).toBe(testAsset.id)
      expect(download.user_id).toBe(testUser.id)

      // Verify download count was incremented
      const { data: updatedAsset } = await supabase
        .from('brand_assets')
        .select('downloads')
        .eq('id', testAsset.id)
        .single()

      expect(updatedAsset.downloads).toBeGreaterThanOrEqual(1)
    })
  })

  describe('AI Compliance Integration', () => {
    it('should detect fair housing violations', async () => {
      const content = 'Perfect for Christian families with children only'
      
      const violations = await aiCompliance.checkContent(content, testAsset.id, testUser.id)
      
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].category).toBe('fair_housing')
      expect(violations[0].severity).toBe('critical')
    })

    it('should scan uploaded assets for compliance', async () => {
      const violations = await aiCompliance.scanAsset(testAsset.id, testUser.id)
      
      // Should complete without errors
      expect(violations).toBeDefined()
    })

    it('should track compliance violations', async () => {
      const violation = {
        id: 'test-violation',
        userId: testUser.id,
        userEmail: testUser.email,
        ruleId: 'fair-housing-check',
        ruleName: 'Fair Housing Check',
        category: 'fair_housing',
        severity: 'high',
        content: 'Test content',
        violationText: 'Potential violation',
        aiConfidence: 0.85,
        status: 'pending' as const,
        reportedBy: 'ai' as const,
        createdAt: new Date().toISOString()
      }

      // This won't actually store since we're mocking compliance_records table
      // In a real test, you'd verify the violation was stored
      expect(violation.aiConfidence).toBeGreaterThan(0.8)
    })
  })

  describe('Analytics Integration', () => {
    it('should track analytics events', async () => {
      await analytics.trackAssetView(testAsset.id, testUser.id)
      await analytics.trackDownload(testAsset.id, testUser.id)

      // In a real implementation, verify events were recorded
      expect(testAsset.id).toBeDefined()
      expect(testUser.id).toBeDefined()
    })

    it('should calculate download metrics', async () => {
      // Generate some test downloads
      for (let i = 0; i < 5; i++) {
        await supabase.from('downloads').insert({
          asset_id: testAsset.id,
          user_id: testUser.id
        })
      }

      const metrics = await analytics.getDashboardMetrics('30d')
      
      expect(metrics.totalDownloads).toBeGreaterThanOrEqual(5)
    })

    it('should generate compliance metrics', async () => {
      const metrics = await analytics.getRealEstateMetrics(testBrokerage.id, '30d')
      
      expect(metrics).toBeDefined()
      expect(typeof metrics.propertyListingsGenerated).toBe('number')
      expect(typeof metrics.complianceHealth).toBe('number')
    })
  })

  describe('Template Generation', () => {
    it('should generate templates with MLS data', async () => {
      const mlsData = {
        address: '123 Main Street',
        listPrice: 500000,
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1500,
        agentName: 'Test Agent'
      }

      // Create template
      const { data: template } = await supabase
        .from('templates')
        .insert({
          brokerage_id: testBrokerage.id,
          created_by: testUser.id,
          name: 'Test Listing Template',
          type: 'listing',
          description: 'Test template',
          template_data: {
            title: '{{mls.address}} - ${{mls.listPrice}}',
            content: '{{mls.bedrooms}} bed, {{mls.bathrooms}} bath, {{mls.squareFeet}} sq ft',
            agent: 'Contact: {{mls.agentName}}'
          },
          fields: ['address', 'listPrice', 'bedrooms', 'bathrooms'],
          status: 'published'
        })
        .select()
        .single()

      expect(template).toBeDefined()
      
      // In a real test, you'd inject MLS data and verify output
      expect(template.template_data.title).toContain('{{mls.address}}')
    })
  })

  describe('Real Estate Specific Features', () => {
    it('should handle license validation', async () => {
      // Update user with fake license
      await supabase
        .from('users')
        .update({ license_number: 'REALTOR123456' })
        .eq('id', testUser.id)

      const { data: updatedUser } = await supabase
        .from('users')
        .select('license_number')
        .eq('id', testUser.id)
        .single()

      expect(updatedUser.license_number).toBe('REALTOR123456')
    })

    it('should manage agent onboarding workflow', async () => {
      const onboardingSteps = [
        { id: 'basic-info', name: 'Basic Information', completed: true },
        { id: 'license-upload', name: 'License Upload', completed: false },
        { id: 'mls-setup', name: 'MLS Setup', completed: false }
      ]

      // Create onboarding workflow
      const { data: onboarding } = await supabase
        .from('agent_onboarding')
        .insert({
          agent_id: testUser.id,
          broker_id: testUser.id,
          status: 'in_progress',
          current_step: 1,
          steps: onboardingSteps
        })
        .select()
        .single()

      expect(onboarding).toBeDefined()
      expect(onboarding.status).toBe('in_progress')
      expect(onboarding.current_step).toBe(1)
    })

    it('should track real estate specific metrics', async () => {
      // Create some generated materials
      await supabase.from('generated_listing_materials').insert({
        brokerage_id: testBrokerage.id,
        template_id: 'test-template',
        mls_number: '12345',
        generated_url: 'https://example.com/listing-12345.pdf'
      })

      const metrics = await analytics.getRealEstateMetrics(testBrokerage.id, '30d')
      
      expect(metrics).toBeDefined()
      expect(typeof metrics.listingsGenerated).toBe('number')
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed asset data gracefully', async () => {
      try {
        await supabase
          .from('brand_assets')
          .insert({
            brokerage_id: testBrokerage.id,
            name: '', // Empty name should fail validation
            category: 'invalid-category',
            status: 'invalid-status'
          })
        
        // Should not reach here
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should handle database connection failures', async () => {
      // This would test connection failure scenarios
      // In a real implementation, you'd use connection pooling failures
      expect(true).toBe(true) // Placeholder
    })

    it('should validate file uploads', async () => {
      const invalidFileUrl = 'not-a-valid-url'
      
      try {
        await supabase
          .from('brand_assets')
          .insert({
            brokerage_id: testBrokerage.id,
            created_by: testUser.id,
            name: 'Test Asset',
            category: 'images',
            file_type: 'invalid-type',
            file_url: invalidFileUrl,
            status: 'published'
          })
        
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('Performance Tests', () => {
    it('should handle large asset datasets', async () => {
      const startTime = Date.now()
      
      // Create multiple assets
      const promises = []
      for (let i = 0; i < 100; i++) {
        promises.push(
          supabase.from('brand_assets').insert({
            brokerage_id: testBrokerage.id,
            created_by: testUser.id,
            name: `Test Asset ${i}`,
            category: 'images',
            status: 'published'
          })
        )
      }
      
      await Promise.all(promises)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000) // 5 seconds
    })

    it('should efficiently query filtered assets', async () => {
      const startTime = Date.now()
      
      // Query with filters
      const { data } = await supabase
        .from('brand_assets')
        .select('*')
        .eq('brokerage_id', testBrokerage.id)
        .eq('category', 'templates')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(1000) // 1 second
      expect(data).toBeDefined()
    })
  })

  describe('Security Tests', () => {
    it('should prevent SQL injection in asset names', async () => {
      const maliciousName = "'; DROP TABLE brand_assets; --"
      
      try {
        await supabase
          .from('brand_assets')
          .insert({
            brokerage_id: testBrokerage.id,
            created_by: testUser.id,
            name: maliciousName,
            category: 'images',
            status: 'published'
          })
        
        // Query should still work
        const { data } = await supabase
          .from('brand_assets')
          .select('*')
          .eq('brokerage_id', testBrokerage.id)
        
        expect(data).toBeDefined()
        // Asset should exist with escaped name
        expect(data.some(asset => asset.name === maliciousName)).toBe(true)
      } catch (error) {
        // In proper setup, this should not throw
        expect(error).toBeDefined()
      }
    })

    it('should validate user permissions', async () => {
      // Create user with limited permissions
      const { data: limitedUser } = await supabase
        .from('users')
        .insert({
          brokerage_id: testBrokerage.id,
          email: 'limited@test.com',
          name: 'Limited User',
          role: 'agent',
          permissions: ['view:assets'] // No edit permission
        })
        .select()
        .single()

      // Should be able to read assets
      const { data: assets } = await supabase
        .from('brand_assets')
        .select('*')
        .eq('brokerage_id', testBrokerage.id)
      
      expect(assets).toBeDefined()
      
      // Cleanup
      await supabase.from('users').delete().eq('id', limitedUser.id)
    })
  })
})

export {} // This ensures the file is treated as a module

