import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { gql } from 'graphql-tag'
import { context } from './context'

// GraphQL Schema
const typeDefs = gql`
  scalar Date
  scalar JSON

  type Brokerage {
    id: ID!
    name: String!
    slug: String!
    domain: String
    subscriptionPlan: String!
    brandSettings: BrandSettings!
    agents: [User!]!
    assets(first: Int, after: String, category: AssetCategory): AssetConnection!
    templates(first: Int, after: String, type: TemplateType): TemplateConnection!
    analytics(timeframe: Timeframe!): AnalyticsMetrics!
    createdAt: Date!
    updatedAt: Date!
  }

  type BrandSettings {
    primaryColor: String!
    secondaryColor: String!
    logoUrl: String!
    typography: TypographySettings!
    complianceSettings: ComplianceSettings!
  }

  type TypographySettings {
    headingFont: String!
    bodyFont: String!
    monoFont: String!
  }

  type ComplianceSettings {
    autoDisclaimers: Boolean!
    licenseValidation: Boolean!
    fairHousingLogo: Boolean!
    disclaimerText: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    status: UserStatus!
    permissions: [String!]!
    licenseNumber: String
    phone: String
    profileImageUrl: String
    downloads: Int!
    assetCount: Int!
    lastLogin: Date
    createdAt: Date!
    updatedAt: Date!
  }

  enum UserRole {
    ADMIN
    BROKER
    SENIOR_AGENT
    AGENT
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
    PENDING
  }

  type Asset {
    id: ID!
    name: String!
    category: AssetCategory!
    subcategory: String
    description: String
    fileType: String!
    fileUrl: String!
    thumbnailUrl: String
    metadata: JSON!
    status: AssetStatus!
    downloads: Int!
    uploadedBy: User!
    tags: [String!]!
    createdAt: Date!
    updatedAt: Date!
    downloadHistory(first: Int): [DownloadRecord!]!
  }

  enum AssetCategory {
    LOGOS
    COLORS
    TYPOGRAPHY
    TEMPLATES
    IMAGERY
    COMPLIANCE
    GENERAL
  }

  enum AssetStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  type AssetConnection {
    edges: [AssetEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type AssetEdge {
    node: Asset!
    cursor: String!
  }

  type DownloadRecord {
    id: ID!
    user: User!
    downloadedAt: Date!
    userAgent: String
  }

  type Template {
    id: ID!
    name: String!
    type: TemplateType!
    description: String
    templateData: JSON!
    fields: [TemplateField!]!
    status: TemplateStatus!
    downloads: Int!
    isDefault: Boolean!
    createdBy: User!
    createdAt: Date!
    updatedAt: Date!
  }

  enum TemplateType {
    LISTING
    OPEN_HOUSE
    EMAIL_SIGNATURE
    BUSINESS_CARD
    POSTCARD
    BANNER
    OTHER
  }

  type TemplateField {
    name: String!
    type: FieldType!
    required: Boolean!
    defaultValue: String
    validation: FieldValidation
  }

  enum FieldType {
    TEXT
    EMAIL
    PHONE
    NUMBER
    DATE
    SELECT
    MULTI_SELECT
    TEXTAREA
    IMAGE_URL
    COLOR
  }

  type FieldValidation {
    minLength: Int
    maxLength: Int
    pattern: String
    options: [String!]
  }

  enum TemplateStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  type TemplateConnection {
    edges: [TemplateEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type TemplateEdge {
    node: Template!
    cursor: String!
  }

  type AnalyticsMetrics {
    totalDownloads: Int!
    activeUsers: Int!
    newUsers: Int!
    complianceScore: Float!
    revenueGrowth: Float!
    topAssets: [TopAsset!]!
    categoryBreakdown: [CategoryMetric!]!
    userEngagement: [UserEngagement!]!
    trends: [TrendData!]!
    realEstateMetrics: RealEstateMetrics!
  }

  type TopAsset {
    id: ID!
    name: String!
    category: AssetCategory!
    downloads: Int!
    uniqueDownloads: Int!
    avgRating: Float!
    conversionRate: Float!
    trend: TrendDirection!
    trendPercentage: Float!
  }

  enum TrendDirection {
    UP
    DOWN
    STABLE
  }

  type CategoryMetric {
    category: AssetCategory!
    totalAssets: Int!
    totalDownloads: Int!
    growthRate: Float!
    avgUsage: Float!
  }

  type UserEngagement {
    userId: ID!
    userName: String!
    role: UserRole!
    downloadsThisMonth: Int!
    downloadsTotal: Int!
    avgSessionDuration: Float!
    lastActive: Date!
    complianceScore: Float!
  }

  type TrendData {
    date: Date!
    downloads: Int!
    users: Int!
    compliance: Float!
    assets: Int!
  }

  type RealEstateMetrics {
    listingsGenerated: Int!
    openHouseMaterials: Int!
    emailSignatures: Int!
    businessCards: Int!
    complianceViolations: Int!
    teamProductivity: Float!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  enum Timeframe {
    SEVEN_DAYS
    THIRTY_DAYS
    NINETY_DAYS
    ONE_YEAR
  }

  # Query types
  type Query {
    # Brokerage queries
    brokerage: Brokerage
    userBrokerage(id: ID!): Brokerage

    # User queries
    me: User
    user(id: ID!): User
    users(first: Int, after: String, role: UserRole, status: UserStatus): UserConnection!

    # Asset queries
    asset(id: ID!): Asset
    assets(first: Int, after: String, category: AssetCategory, status: AssetStatus): AssetConnection!
    searchAssets(query: String!, filters: AssetFilters): AssetConnection!

    # Template queries
    template(id: ID!): Template
    templates(first: Int, after: String, type: TemplateType): TemplateConnection!

    # Analytics queries
    analytics(timeframe: Timeframe!, brokerageId: ID): AnalyticsMetrics!
    complianceMetrics: ComplianceMetrics!

    # Real estate specific queries
    mlsListings(first: Int, filters: MLSFilters): MLSListingConnection!
    marketAnalysis(zipCode: String!): MarketAnalysis!
  }

  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type UserEdge {
    node: User!
    cursor: String!
  }

  type AssetFilters {
    category: AssetCategory
    subcategory: String
    status: AssetStatus
    tags: [String!]
    createdAfter: Date
    createdBefore: Date
  }

  type MLSFilters {
    minPrice: Float
    maxPrice: Float
    bedrooms: Int
    bathrooms: Int
    propertyType: String
    city: String
    state: String
    zipCode: String
  }

  type MLSListingConnection {
    edges: [MLSListingEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type MLSListingEdge {
    node: MLSListing!
    cursor: String!
  }

  type MLSListing {
    id: ID!
    mlsNumber: String!
    address: String!
    city: String!
    state: String!
    zipCode: String!
    listPrice: Float!
    bedrooms: Int!
    bathrooms: Int!
    squareFeet: Int!
    propertyType: String!
    status: String!
    photos: [String!]!
    description: String!
    features: [String!]!
    agentId: ID!
    agentName: String!
    createdAt: Date!
  }

  type MarketAnalysis {
    zipCode: String!
    avgPrice: Float!
    priceTrend: TrendDirection!
    inventoryLevel: String!
    daysOnMarket: Int!
    marketType: MarketType!
    seasonality: MarketSeasonality!
  }

  enum MarketType {
    BUYERS_MARKET
    SELLERS_MARKET
    BALANCED_MARKET
  }

  type MarketSeasonality {
    peakMonths: [Int!]!
    lowMonths: [Int!]!
    seasonalAdjustment: Float!
  }

  type ComplianceMetrics {
    overallScore: Float!
    violationsByCategory: [ViolationCategory!]!
    recentViolations: [ComplianceViolation!]!
    complianceTrends: [ComplianceTrend!]!
  }

  type ViolationCategory {
    category: String!
    count: Int!
    severity: ViolationSeverity!
  }

  enum ViolationSeverity {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  type ComplianceViolation {
    id: ID!
    userId: ID!
    ruleId: String!
    ruleName: String!
    category: String!
    severity: ViolationSeverity!
    description: String!
    resolution: String
    status: ViolationStatus!
    createdAt: Date!
    resolvedAt: Date
  }

  enum ViolationStatus {
    PENDING
    ACKNOWLEDGED
    FIXED
    FALSE_POSITIVE
  }

  type ComplianceTrend {
    date: Date!
    violations: Int!
    resolved: Int!
    newViolations: Int!
  }

  # Mutation types
  type Mutation {
    # Asset mutations
    createAsset(input: CreateAssetInput!): Asset!
    updateAsset(id: ID!, input: UpdateAssetInput!): Asset!
    deleteAsset(id: ID!): Boolean!
    downloadAsset(id: ID!): Asset!

    # Template mutations
    createTemplate(input: CreateTemplateInput!): Template!
    updateTemplate(id: ID!, input: UpdateTemplateInput!): Template!
    generateFromTemplate(templateId: ID!, data: JSON!): GeneratedMaterial!

    # User mutations
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    activateUser(id: ID!): User!
    deactivateUser(id: ID!): User!

    # Real estate specific mutations
    syncMLSListing(mlsNumber: String!): MLSListing!
    generateBrandedListing(listingId: ID!, templateId: ID!): String!
    scanCompliance(input: ComplianceScanInput!): ComplianceScanResult!

    # Workflow mutations
    triggerWorkflow(workflowId: ID!, context: JSON!): WorkflowExecution!
    completeOnboardingStep(userId: ID!, stepId: String!): OnboardingProgress!
  }

  input CreateAssetInput {
    name: String!
    category: AssetCategory!
    subcategory: String
    description: String
    fileType: String!
    fileUrl: String!
    thumbnailUrl: String
    metadata: JSON
    tags: [String!]
  }

  input UpdateAssetInput {
    name: String
    description: String
    metadata: JSON
    status: AssetStatus
    tags: [String!]
  }

  input CreateTemplateInput {
    name: String!
    type: TemplateType!
    description: String
    templateData: JSON!
    fields: [TemplateFieldInput!]!
  }

  input TemplateFieldInput {
    name: String!
    type: FieldType!
    required: Boolean!
    defaultValue: String
    validation: FieldValidationInput
  }

  input FieldValidationInput {
    minLength: Int
    maxLength: Int
    pattern: String
    options: [String!]
  }

  input UpdateTemplateInput {
    name: String
    description: String
    templateData: JSON
    fields: [TemplateFieldInput!]
    status: TemplateStatus
  }

  type GeneratedMaterial {
    id: ID!
    templateId: ID!
    userId: ID!
    generatedUrl: String!
    fileType: String!
    materialData: JSON!
    createdAt: Date!
  }

  input CreateUserInput {
    name: String!
    email: String!
    role: UserRole!
    licenseNumber: String
    phone: String
  }

  input UpdateUserInput {
    name: String
    email: String
    role: UserRole
    licenseNumber: String
    phone: String
    profileImageUrl: String
  }

  input ComplianceScanInput {
    content: String!
    assetId: ID
    userId: ID
    jurisdiction: String
  }

  type ComplianceScanResult {
    violations: [ComplianceViolation!]!
    complianceScore: Float!
    suggestions: [String!]!
    automatedFixes: [AutomatedFix!]!
  }

  type AutomatedFix {
    ruleId: String!
    fixType: FixType!
    original: String!
    suggested: String!
    confidence: Float!
  }

  enum FixType {
    REPLACE_TEXT
    ADD_DISCLAIMER
    UPDATE_IMAGE
    RESTRUCTURE_CONTENT
  }

  type WorkflowExecution {
    id: ID!
    workflowId: ID!
    status: ExecutionStatus!
    result: JSON
    error: String
    startedAt: Date!
    completedAt: Date
  }

  enum ExecutionStatus {
    RUNNING
    COMPLETED
    FAILED
    CANCELLED
  }

  type OnboardingProgress {
    userId: ID!
    currentStep: Int!
    completedSteps: [String!]!
    remainingSteps: [String!]!
    status: OnboardingStatus!
    progressPercentage: Float!
  }

  enum OnboardingStatus {
    PENDING
    IN_PROGRESS
    COMPLETED
    BLOCKED
  }

  # Subscription types
  type Subscription {
    # Real-time updates
    assetUpdates(brokerageId: ID!): AssetUpdate!
    complianceAlerts(brokerageId: ID!): ComplianceViolation!
    userActivity(userId: ID!): UserActivityEvent!
    
    # Analytics updates
    analyticsUpdates(brokerageId: ID!, timeframe: Timeframe!): AnalyticsMetrics!
    
    # Collaboration events
    collaborationSession(sessionId: String!): CollaborationEvent!
  }

  type AssetUpdate {
    type: AssetUpdateType!
    asset: Asset!
    user: User!
    timestamp: Date!
  }

  enum AssetUpdateType {
    CREATED
    UPDATED
    DOWNLOADED
    DELETED
  }

  type UserActivityEvent {
    type: ActivityType!
    user: User!
    data: JSON
    timestamp: Date!
  }

  enum ActivityType {
    LOGIN
    LOGOUT
    ASSET_DOWNLOAD
    TEMPLATE_CREATION
    COMPLIANCE_SCAN
  }

  type CollaborationEvent {
    type: CollaborationEventType!
    userId: ID!
    userName: String!
    data: JSON
    timestamp: Date!
  }

  enum CollaborationEventType {
    USER_JOINED
    USER_LEFT
    CURSOR_MOVE
    FOCUS_CHANGE
    COMMENT_ADDED
  }
`

// Resolvers
const resolvers = {
  Date: {
    serialize: (date: Date) => date.toISOString(),
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast: any) => new Date(ast.value)
  },

  Query: {
    brokerage: async (parent: any, args: any, ctx: any) => {
      return await ctx.brokerageService.getCurrentUserBrokerage(ctx.user.id)
    },

    userBrokerage: async (parent: any, args: any, ctx: any) => {
      return await ctx.brokerageService.getBrokerageById(args.id)
    },

    me: async (parent: any, args: any, ctx: any) => {
      return ctx.user
    },

    user: async (parent: any, args: any, ctx: any) => {
      return await ctx.userService.getUserById(args.id, ctx.user.brokerageId)
    },

    users: async (parent: any, args: any, ctx: any) => {
      return await ctx.userService.getUsersPaginated({
        ...args,
        brokerageId: ctx.user.brokerageId
      })
    },

    asset: async (parent: any, args: any, ctx: any) => {
      return await ctx.assetService.getAssetById(args.id, ctx.user.brokerageId)
    },

    assets: async (parent: any, args: any, ctx: any) => {
      return await ctx.assetService.getAssetsPaginated({
        ...args,
        brokerageId: ctx.user.brokerageId
      })
    },

    searchAssets: async (parent: any, args: any, ctx: any) => {
      return await ctx.assetService.searchAssets(args.query, {
        ...args.filters,
        brokerageId: ctx.user.brokerageId
      })
    },

    template: async (parent: any, args: any, ctx: any) => {
      return await ctx.templateService.getTemplateById(args.id, ctx.user.brokerageId)
    },

    templates: async (parent: any, args: any, ctx: any) => {
      return await ctx.templateService.getTemplatesPaginated({
        ...args,
        brokerageId: ctx.user.brokerageId
      })
    },

    analytics: async (parent: any, args: any, ctx: any) => {
      const brokerageId = args.brokerageId || ctx.user.brokerageId
      return await ctx.analyticsService.getDashboardMetrics(brokerageId, args.timeframe)
    },

    complianceMetrics: async (parent: any, args: any, ctx: any) => {
      return await ctx.complianceService.getComplianceMetrics(ctx.user.brokerageId)
    },

    mlsListings: async (parent: any, args: any, ctx: any) => {
      return await ctx.mlsService.searchListings({
        ...args.filters,
        brokerageId: ctx.user.brokerageId
      })
    },

    marketAnalysis: async (parent: any, args: any, ctx: any) => {
      return await ctx.marketService.analyzeMarket(args.zipCode)
    }
  },

  Mutation: {
    createAsset: async (parent: any, args: any, ctx: any) => {
      return await ctx.assetService.createAsset({
        ...args.input,
        brokerageId: ctx.user.brokerageId,
        createdBy: ctx.user.id
      })
    },

    updateAsset: async (parent: any, args: any, ctx: any) => {
      return await ctx.assetService.updateAsset(args.id, args.input, ctx.user)
    },

    deleteAsset: async (parent: any, args: any, ctx: any) => {
      return await ctx.assetService.deleteAsset(args.id, ctx.user)
    },

    downloadAsset: async (parent: any, args: any, ctx: any) => {
      await ctx.downloadService.recordDownload(args.id, ctx.user.id)
      return await ctx.assetService.getAssetById(args.id, ctx.user.brokerageId)
    },

    createTemplate: async (parent: any, args: any, ctx: any) => {
      return await ctx.templateService.createTemplate({
        ...args.input,
        brokerageId: ctx.user.brokerageId,
        createdBy: ctx.user.id
      })
    },

    updateTemplate: async (parent: any, args: any, ctx: any) => {
      return await ctx.templateService.updateTemplate(args.id, args.input, ctx.user)
    },

    generateFromTemplate: async (parent: any, args: any, ctx: any) => {
      return await ctx.templateService.generateMaterial(args.templateId, args.data, ctx.user)
    },

    createUser: async (parent: any, args: any, ctx: any) => {
      return await ctx.userService.createUser({
        ...args.input,
        brokerageId: ctx.user.brokerageId
      })
    },

    updateUser: async (parent: any, args: any, ctx: any) => {
      return await ctx.userService.updateUser(args.id, args.input, ctx.user)
    },

    activateUser: async (parent: any, args: any, ctx: any) => {
      return await ctx.userService.updateUserStatus(args.id, 'active', ctx.user)
    },

    deactivateUser: async (parent: any, args: any, ctx: any) => {
      return await ctx.userService.updateUserStatus(args.id, 'inactive', ctx.user)
    },

    syncMLSListing: async (parent: any, args: any, ctx: any) => {
      return await ctx.mlsService.syncListing(args.mlsNumber, ctx.user.brokerageId)
    },

    generateBrandedListing: async (parent: any, args: any, ctx: any) => {
      return await ctx.mlsService.generateBrandedListing(args.listingId, args.templateId, ctx.user.brokerageId)
    },

    scanCompliance: async (parent: any, args: any, ctx: any) => {
      return await ctx.complianceService.scanContent(args.input, ctx.user)
    },

    triggerWorkflow: async (parent: any, args: any, ctx: any) => {
      return await ctx.workflowService.executeWorkflow(args.workflowId, args.context, ctx.user)
    },

    completeOnboardingStep: async (parent: any, args: any, ctx: any) => {
      return await ctx.onboardingService.completeStep(args.userId, args.stepId, ctx.user)
    }
  },

  Subscription: {
    assetUpdates: {
      subscribe: async (parent: any, args: any, ctx: any) => {
        return ctx.subscriptionService.subscribeToAssetUpdates(args.brokerageId)
      }
    },

    complianceAlerts: {
      subscribe: async (parent: any, args: any, ctx: any) => {
        return ctx.subscriptionService.subscribeToComplianceAlerts(args.brokerageId)
      }
    },

    userActivity: {
      subscribe: async (parent: any, args: any, ctx: any) => {
        return ctx.subscriptionService.subscribeToUserActivity(args.userId)
      }
    },

    analyticsUpdates: {
      subscribe: async (parent: any, args: any, ctx: any) => {
        return ctx.subscriptionService.subscribeToAnalyticsUpdates(args.brokerageId, args.timeframe)
      }
    },

    collaborationSession: {
      subscribe: async (parent: any, args: any, ctx: any) => {
        return ctx.subscriptionService.subscribeToCollaborationSession(args.sessionId)
      }
    }
  },

  Asset: {
    uploadedBy: async (parent: any, args: any, ctx: any) => {
      return await ctx.userService.getUserById(parent.createdBy, parent.brokerageId)
    },
    
    downloadHistory: async (parent: any, args: any, ctx: any) => {
      return await ctx.downloadService.getDownloadHistory(parent.id, args.first)
    }
  },

  Brokerage: {
    agents: async (parent: any, args: any, ctx: any) => {
      return await ctx.userService.getUsersByBrokerage(parent.id)
    },

    assets: async (parent: any, args: any, ctx: any) => {
      return await ctx.assetService.getAssetsPaginated({
        ...args,
        brokerageId: parent.id
      })
    },

    templates: async (parent: any, args: any, ctx: any) => {
      return await ctx.templateService.getTemplatesPaginated({
        ...args,
        brokerageId: parent.id
      })
    },

    analytics: async (parent: any, args: any, ctx: any) => {
      return await ctx.analyticsService.getDashboardMetrics(parent.id, args.timeframe)
    }
  }
}

// Context type
interface GraphQLContext {
  user: any
  services: {
    brokerageService: any
    userService: any
    assetService: any
    templateService: any
    analyticsService: any
    complianceService: any
    mlsService: any
    marketService: any
    downloadService: any
    workflowService: any
    onboardingService: any
    subscriptionService: any
  }
}

// Create Apollo Server
const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  plugins: [
    // Add plugins for monitoring, caching, etc.
  ]
})

export async function createGraphQLServer() {
  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => {
      // Create GraphQL context here
      const context = await context.createContext(req)
      return context
    },
    listen: { port: 4000 }
  })

  console.log(`GraphQL server ready at ${url}`)
  return server
}

export { typeDefs, resolvers }
export default server

