import { EventEmitter } from 'events'
import { Redis } from '@upstash/redis'

export interface EventMessage<T = any> {
  id: string
  type: string
  timestamp: Date
  source: string
  correlationId?: string
  causationId?: string
  data: T
  metadata: {
    userId?: string
    sessionId?: string
    brokerageId?: string
    version: string
    environment: string
  }
}

export interface EventHandler<T = any> {
  eventType: string
  handler: (message: EventMessage<T>) => Promise<void>
  priority?: number
  retries?: number
  circuitBreaker?: boolean
}

export interface EventPattern {
  pattern: string
  handler: (message: EventMessage) => Promise<void>
  filter?: (message: EventMessage) => boolean
}

export interface SubscriptionConfig {
  queueName: string
  handler: EventHandler
  concurrency?: number
  deadLetterQueue?: string
  retryDelay?: number
  maxRetries?: number
}

class EventBus extends EventEmitter {
  private redis: Redis
  private handlers = new Map<string, EventHandler[]>()
  private patterns: EventPattern[] = []
  private subscriptions = new Map<string, SubscriptionConfig[]>()
  private deadLetterQueues = new Map<string, EventMessage[]>()
  private metrics = {
    messagesSent: 0,
    messagesReceived: 0,
    messagesProcessed: 0,
    messagesFailed: 0,
    averageProcessingTime: 0,
    totalProcessingTime: 0
  }

  constructor(redisConfig: { url: string; token: string }) {
    super()
    this.redis = new Redis({
      url: redisConfig.url,
      token: redisConfig.token
    })
    
    this.setupRedisListeners()
  }

  // Event Publishing
  async publish<T>(eventType: string, data: T, metadata?: Partial<EventMessage<T>['metadata']>): Promise<string> {
    const message: EventMessage<T> = {
      id: crypto.randomUUID(),
      type: eventType,
      timestamp: new Date(),
      source: 'realbrand-pro',
      data,
      metadata: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        ...metadata
      }
    }

    // Publish to Redis Stream
    await this.redis.xadd(
      `realbrand:events:${eventType}`,
      '*',
      'data', JSON.stringify(message)
    )

    // Store message for delivery guarantees
    await this.redis.hset(
      `realbrand:message:${message.id}`,
      message
    )

    this.metrics.messagesSent++
    this.emit('messagePublished', message)

    return message.id
  }

  // Event Subscription
  subscribe<T>(config: SubscriptionConfig): void {
    if (!this.subscriptions.has(config.queueName)) {
      this.subscriptions.set(config.queueName, [])
    }

    this.subscriptions.get(config.queueName)!.push(config)

    // Start consuming from Redis Stream
    this.startConsumer(config.queueName, config)
  }

  private async startConsumer(queueName: string, config: SubscriptionConfig): Promise<void> {
    const streamKey = `realbrand:events:${config.handler.eventType}`
    
    try {
      while (true) {
        const messages = await this.redis.xread(
          'BLOCK', 1000,
          'COUNT', config.concurrency || 10,
          'STREAMS', streamKey, '$'
        )

        if (messages && messages.length > 0) {
          for (const message of messages) {
            await this.processMessage(queueName, config, message)
          }
        }
      }
    } catch (error) {
      console.error(`Consumer error for ${queueName}:`, error)
      await this.sleep(config.retryDelay || 5000)
      this.startConsumer(queueName, config) // Restart consumer
    }
  }

  private async processMessage(queueName: string, config: SubscriptionConfig, message: any): Promise<void> {
    const startTime = Date.now()

    try {
      const eventMessage: EventMessage = JSON.parse(message.data)
      
      // Update tracking
      await this.redis.xack(
        `realbrand:events:${config.handler.eventType}`,
        queueName,
        message.id
      )

      // Process message
      await config.handler.handler(eventMessage)
      
      this.metrics.messagesReceived++
      this.metrics.messagesProcessed++
      
      const processingTime = Date.now() - startTime
      this.updateProcessingTime(processingTime)
      
      this.emit('messageProcessed', eventMessage)
      
    } catch (error) {
      this.metrics.messagesFailed++
      
      const eventMessage: EventMessage = JSON.parse(message.data)
      
      // Handle retries
      const retryCount = await this.incrementRetryCounter(eventMessage.id)
      
      if (retryCount < (config.maxRetries || 3)) {
        // Retry message
        setTimeout(() => {
          this.processMessage(queueName, config, message)
        }, config.retryDelay || 1000 * Math.pow(2, retryCount))
      } else {
        // Move to dead letter queue
        await this.moveToDeadLetterQueue(queueName, eventMessage, error)
      }
      
      this.emit('messageFailed', eventMessage, error)
    }
  }

  // Pattern-based event handling
  subscribePattern(pattern: string, handler: EventPattern['handler'], filter?: EventPattern['filter']): void {
    this.patterns.push({ pattern, handler, filter })
    
    // Subscribe to wildcard streams for pattern matching
    this.subscribeToWildcardPattern(pattern, handler, filter)
  }

  private async subscribeToWildcardPattern(pattern: string, handler: EventPattern['handler'], filter?: EventPattern['filter']): Promise<void> {
    // Redis pattern matching subscription
    const subscription = await this.redis.psubscribe(`realbrand:events:${pattern}`)
    
    subscription.on('message', async (channel: string, message: string) => {
      try {
        const eventMessage: EventMessage = JSON.parse(message)
        
        // Apply filter if provided
        if (filter && !filter(eventMessage)) {
          return
        }
        
        await handler(eventMessage)
        
      } catch (error) {
        console.error('Pattern handler error:', error)
      }
    })
  }

  // Advanced event patterns
  async publishAndWait<TRequest, TResponse>(
    eventType: string,
    data: TRequest,
    timeout: number = 30000
  ): Promise<TResponse> {
    return new Promise(async (resolve, reject) => {
      const correlationId = crypto.randomUUID()
      const responseTimeout = setTimeout(() => {
        reject(new Error(`Event response timeout for ${eventType}`))
      }, timeout)

      // Subscribe to response
      const subscription = this.subscribePattern(
        `${eventType}.response.${correlationId}`,
        async checkResponse => {
          if (checkResponse.correlationId === correlationId) {
            clearTimeout(responseTimeout)
            subscription.unsubscribe()
            resolve(checkResponse.data)
          }
        }
      )

      // Publish original event
      await this.publish(eventType, {
        ...data,
        correlationId,
        replyTo: `${eventType}.response.${correlationId}`
      })
    })
  }

  // Saga orchestration for complex workflows
  async executeSaga<TInput, TOutput>(
    steps: Array<{
      eventType: string
      handler: (data: any) => Promise<any>
      compensation?: (data: any) => Promise<void>
      timeout?: number
    }>,
    input: TInput
  ): Promise<TOutput> {
    const sagaId = crypto.randomUUID()
    const sagaState: any = { input, currentStep: 0, compensations: [] }

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        sagaState.currentStep = i

        // Execute step with timeout
        const stepPromise = step.handler(sagaState)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Saga step${i} timeout`)), step.timeout || 30000)
        })

        const result = await Promise.race([stepPromise, timeoutPromise])
        sagaState[`step${i}_result`] = result

        // Store compensation if provided
        if (step.compensation) {
          sagaState.compensations.unshift({
            compensation: step.compensation,
            data: sagaState[`step${i}_result`]
          })
        }
      }

      // Mark saga as completed
      await this.redis.hset(
        `realbrand:saga:${sagaId}`,
        'status', 'completed',
        'output', JSON.stringify(sagaState)
      )

      return sagaState as TOutput

    } catch (error) {
      // Execute compensation actions
      await this.executeCompensations(sagaState.compensations)
      
      await this.redis.hset(
        `realbrand:saga:${sagaId}`,
        'status', 'failed',
        'error', JSON.stringify(error)
      )

      throw error
    }
  }

  private async executeCompensations(compensations: Array<{compensation: Function, data: any}>): Promise<void> {
    for (const compensation of compensations) {
      try {
        await compensation.compensation(compensation.data)
      } catch (error) {
        console.error('Compensation failed:', error)
        // In a real system, you might want to store failed compensations for manual intervention
      }
    }
  }

  // Event replay functionality
  async replayEvents(
    eventType: string,
    fromTimestamp: Date,
    toTimestamp?: Date,
    brokerageId?: string
  ): Promise<EventMessage[]> {
    const streamKey = `realbrand:events:${eventType}`
    
    const startId = `${fromTimestamp.getTime()}-0`
    const endId = toTimestamp ? `${toTimestamp.getTime()}-0` : '+'

    const messages = await this.redis.xrange(streamKey, startId, endId)
    
    return messages
      .map(msg => JSON.parse(msg.data))
      .filter(msg => !brokerageId || msg.metadata.brokerageId === brokerageId)
  }

  // Metrics and monitoring
  getMetrics() {
    return {
      ...this.metrics,
      handlersCount: this.handlers.size,
      patternsCount: this.patterns.length,
      subscriptionsCount: this.subscriptions.size,
      deadLetterQueueSize: Array.from(this.deadLetterQueues.values()).reduce((sum, queue) => sum + queue.length, 0)
    }
  }

  async healthCheck(): Promise<{status: 'healthy' | 'degraded' | 'unhealthy', details: any}> {
    try {
      // Test Redis connection
      await this.redis.ping()
      
      // Check active consumers
      const activeStreams = await this.redis.xinfo('STREAMS')
      const consumerGroups = await Promise.all(
        Object.keys(activeStreams).map(async streamName => {
          const groups = await this.redis.xinfo('GROUPS', streamName)
          return { streamName, groups }
        })
      )

      const status = activeStreams.size > 0 ? 'healthy' : 'degraded'
      
      return {
        status,
        details: {
          redis: 'connected',
          activeStreams: activeStreams.size,
          consumerGroups: consumerGroups.length,
          metrics: this.getMetrics()
        }
      }
    } catch (error) {
      return {
        status: 'degraded',
        details: { error: error.message }
      }
    }
  }

  // Helper methods
  private async incrementRetryCounter(messageId: string): Promise<number> {
    return await this.redis.incr(`realbrand:retry:${messageId}`)
  }

  private async moveToDeadLetterQueue(queueName: string, message: EventMessage, error: any): Promise<void> {
    const dlQueueName = queueName.replace(':queue', ':dlq')
    
    if (!this.deadLetterQueues.has(dlQueueName)) {
      this.deadLetterQueues.set(dlQueueName, [])
    }

    const dlqMessage = {
      ...message,
      error: {
        message: error.message,
        stack: error.stack,
        timestamp: new Date()
      }
    }

    this.deadLetterQueues.get(dlQueueName)!.push(dlqMessage)
    
    // Store in Redis for persistence
    await this.redis.lpush(`realbrand:dlq:${dlQueueName}`, JSON.stringify(dlqMessage))
  }

  private updateProcessingTime(newTime: number): void {
    this.metrics.totalProcessingTime += newTime
    this.metrics.averageProcessingTime = this.metrics.totalProcessingTime / this.metrics.messagesProcessed
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private setupRedisListeners(): void {
    // Redis connection monitoring
    this.redis.on('connect', () => {
      this.emit('redisConnected')
    })

    this.redis.on('error', (error) => {
      this.emit('redisError', error)
    })
  }
}

// Event Bus Factory
export function createEventBus(config: { url: string; token: string }): EventBus {
  return new EventBus(config)
}

// Specific event types for real estate platform
export interface RealEstateEvents {
  // Agent Events
  'agent.onboarded': { agentId: string; brokerageId: string; onboardingData: any }
  'agent.activated': { agentId: string; activationDate: Date }
  'agent.deactivated': { agentId: string; reason: string }
  
  // Asset Events
  'asset.created': { assetId: string; category: string; createdBy: string }
  'asset.downloaded': { assetId: string; userId: string; downloadCount: number }
  'asset.compliance_flagged': { assetId: string; violations: any[] }
  
  // MLS Events
  'mls.listing.synced': { listingId: string; brokerageId: string; listingData: any }
  'mls.branding.generated': { listingId: string; templateId: string; generatedUrl: string }
  
  // Compliance Events
  'compliance.violation.detected': { userId: string; ruleId: string; severity: string }
  'compliance.score.updated': { brokerageId: string; scoresOverall: number }
  
  // Analytics Events
  'analytics.metrics.generated': { brokerageId: string; metrics: any }
  'analytics.report.requested': { brokerageId: string; reportType: string }
}

// Event subscription helpers for common patterns
export function subscribeToAgentEvents(bus: EventBus, handler: (event: EventMessage<any>) => Promise<void>) {
  bus.subscribePattern('agent.*', handler)
}

export function subscribeToAssetEvents(bus: EventBus, handler: (event: EventMessage<any>) => Promise<void>) {
  bus.subscribePattern('asset.*', handler)
}

export function subscribeToComplianceEvents(bus: EventBus, handler: (event: EventMessage<any>) => Promise<void>) {
  bus.subscribePattern('compliance.*', handler)
}

export default EventBus
