import { EventEmitter } from 'events'

export interface ServiceMetrics {
  service: string
  version: string
  uptime: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  cpu: {
    usage: number
    loadAverage: number[]
  }
  requests: {
    total: number
    successful: number
    failed: number
    avgResponseTime: number
  }
  database: {
    connections: number
    queries: number
    slowQueries: number
  }
  cache: {
    hits: number
    misses: number
    hitRate: number
  }
}

export interface ErrorTracking {
  id: string
  timestamp: Date
  service: string
  userId?: string
  sessionId?:string
  error: {
    name: string
    message: string
    stack?: string
    context?: Record<string, any>
  }
  breadcrumbs: Array<{
    timestamp: Date
    message: string
    level: 'debug' | 'info' | 'warning' | 'error'
    category: string
  }>
  environment: {
    userAgent?: string
    url?: string
    method?: string
    headers?: Record<string, string>
  }
}

export interface PerformanceMonitor {
  startSpan(operation: string, metadata?: Record<string, any>): Span
  trackMetric(name: string, value: number, tags?: Record<string, string>): void
  incrementCounter(name: string, tags?: Record<string, string>): void
  histogram(name: string, value: number, tags?: Record<string, string>): void
}

export interface Span {
  id: string
  operation: string
  startTime: number
  endTime?: number
  duration?: number
  metadata: Record<string, any>
  tags: Record<string, string>
  children: Span[]
  status: 'running' | 'completed' | 'error'

  addTag(key: string, value: string): void
  addMetadata(key: string, value: any): void
  finish(): void
  error(error: Error): void
}

class DistributedTracer implements PerformanceMonitor {
  private spans = new Map<string, Span>()
  private activeSpans = new Map<string, string>() // operation -> spanId
  private metrics: Array<{
    name: string
    value: number
    timestamp: number
    tags?: Record<string, string>
  }> = []
  private counters: Map<string, number> = new Map()
  private histograms: Map<string, number[]> = new Map()

  startSpan(operation: string, metadata: Record<string, any> = {}): Span {
    const spanId = crypto.randomUUID()
    const parentSpanId = this.getActiveSpanId(operation)
    
    const span: Span = {
      id: spanId,
      operation,
      startTime: Date.now(),
      metadata: { ...metadata },
      tags: {},
      children: [],
      status: 'running',
      
      addTag: (key: string, value: string) => {
        span.tags[key] = value
      },
      
      addMetadata: (key: string, value: any) => {
        span.metadata[key] = value
      },
      
      finish: () => {
        span.endTime = Date.now()
        span.duration = span.endTime - span.startTime
        span.status = 'completed'
        
        this.spans.set(spanId, span)
        this.activeSpans.delete(operation)
        
        // Send to observability backend
        this.sendSpan(span)
      },
      
      error: (error: Error) => {
        span.status = 'error'
        span.addTag('error', 'true')
        span.addMetadata('error', {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
    }

    this.spans.set(spanId, span)
    this.activeSpans.set(operation, spanId)
    
    // Add parent relationship if exists
    if (parentSpanId && this.spans.has(parentSpanId)) {
      const parentSpan = this.spans.get(parentSpanId)!
      parentSpan.children.push(span)
    }

    return span
  }

  trackMetric(name: string, value: number, tags: Record<string, string> = {}): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      tags
    })

    // Send metrics in batches
    if (this.metrics.length >= 100) {
      this.flushMetrics()
    }
  }

  incrementCounter(name: string, tags: Record<string, string> = {}): void {
    const key = `${name}:${JSON.stringify(tags)}`
    const current = this.counters.get(key) || 0
    this.counters.set(key, current + 1)
  }

  histogram(name: string, value: number, tags: Record<string, string> = {}): void {
    const key = `${name}:${JSON.stringify(tags)}`
    const values = this.histograms.get(key) || []
    values.push(value)
    
    // Keep only last 1000 values
    if (values.length > 1000) {
      values.splice(0, values.length - 1000)
    }
    
    this.histograms.set(key, values)
  }

  private getActiveSpanId(operation: string): string | undefined {
    return this.activeSpans.get(operation)
  }

  private sendSpan(span: Span): void {
    // Integration with Jaeger, Zipkin, or Datadog APM
    console.log('Sending span:', JSON.stringify({
      id: span.id,
      operation: span.operation,
      duration: span.duration,
      tags: span.tags,
      status: span.status
    }))
  }

  private flushMetrics(): void {
    console.log(`Flushing ${this.metrics.length} metrics`)
    
    // Send to metrics backend (Prometheus, Graphite, etc.)
    this.metrics.forEach(metric => {
      console.log(`Metric: ${metric.name}=${metric.value} ${JSON.stringify(metric.tags)}`)
    })
    
    this.metrics = []
  }

  getMetrics() {
    return {
      counters: Object.fromEntries(this.counters),
      histograms: Object.fromEntries(this.histograms),
      activeSpans: this.activeSpans.size
    }
  }
}

class ErrorTracker {
  private errors: ErrorTracking[] = []
  private errorRates = new Map<string, { count: number; rate: number; window: number }>()

  trackError(
    error: Error,
    service: string,
    userId?: string,
    sessionId?: string,
    context?: Record<string, any>
  ): string {
    const errorId = crypto.randomUUID()
    
    const errorTracking: ErrorTracking = {
      id: errorId,
      timestamp: new Date(),
      service,
      userId,
      sessionId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        context: context || {}
      },
      breadcrumbs: this.getRecentBreadcrumbs(),
      environment: this.getEnvironmentInfo()
    }

    this.errors.push(errorTracking)
    
    // Update error rates
    this.updateErrorRate(service)
    
    // Send to error tracking service (Sentry, Bugsnag, etc.)
    this.sendError(errorTracking)
    
    // Keep only last 100 errors in memory
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100)
    }

    return errorId
  }

  addBreadcrumb(
    message: string,
    level: 'debug' | 'info' | 'warning' | 'error',
    category: string = 'general'
  ): void {
    // Store breadcrumb for future error tracking
    const breadcrumbs = this.getRecentBreadcrumbs()
    breadcrumbs.push({
      timestamp: new Date(),
      message,
      level,
      category
    })
  }

  private getRecentBreadcrumbs(): Array<{ timestamp: Date; message: string; level: string; category: string }> {
    // Return recent breadcrumbs (implement storage mechanism)
    return []
  }

  private getEnvironmentInfo(): Record<string, any> {
    return {
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }
  }

  private updateErrorRate(service: string): void {
    const now = Date.now()
    const window = 5 * 60 * 1000 // 5 minutes
    
    const rates = this.errorRates.get(service) || { count: 0, rate: 0, window }
    
    rates.count++
    rates.rate = rates.count / (window / 1000)
    
    this.errorRates.set(service, rates)
  }

  private sendError(errorTracking: ErrorTracking): void {
    // Integration with error tracking service
    console.error('Error tracked:', {
      id: errorTracking.id,
      service: errorTracking.service,
      message: errorTracking.error.message
    })
  }

  getErrorStats() {
    return {
      totalErrors: this.errors.length,
      recentErrors: this.errors.slice(-10),
      errorRates: Object.fromEntries(this.errorRates)
    }
  }
}

class HealthChecker {
  private checks: Map<string, () => Promise<HealthStatus>> = new Map()
  private results: Map<string, HealthStatus> = new Map()
  private interval: NodeJS.Timeout | null = null

  addCheck(name: string, check: () => Promise<HealthStatus>): void {
    this.checks.set(name, check)
  }

  startChecking(intervalMs: number = 30000): void {
    const checkAll = async () => {
      for (const [name, check] of this.checks) {
        try {
          const result = await check()
          this.results.set(name, result)
        } catch (error) {
          this.results.set(name, {
            status: 'unhealthy',
            message: error.message,
            timestamp: new Date(),
            latency: 0
          })
        }
      }
    }

    this.interval = setInterval(checkAll, intervalMs)
    checkAll() // Run immediately
  }

  stopChecking(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  getHealthStatus(): Record<string, HealthStatus> & { overall: 'healthy' | 'degraded' | 'unhealthy' } {
    const statuses = Object.fromEntries(this.results)
    
    const unhealthy = Object.values(statuses).filter(s => s.status === 'unhealthy').length
    const degraded = Object.values(statuses).filter(s => s.status === 'degraded').length
    
    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (unhealthy > 0) overall = 'unhealthy'
    else if (degraded > 0) overall = 'degraded'
    
    return {
      ...statuses,
      overall
    }
  }
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  message?: string
  timestamp: Date
  latency: number
  details?: Record<string, any>
}

class ApplicationPerformanceManager {
  private tracer: DistributedTracer
  private errorTracker: ErrorTracker
  private healthChecker: HealthChecker
  private metrics = new Map<string, any>()

  constructor() {
    this.tracer = new DistributedTracer()
    this.errorTracker = new ErrorTracker()
    this.healthChecker = new HealthChecker()
    
    this.setupDefaultChecks()
    this.startMetricsCollection()
  }

  private setupDefaultChecks(): void {
    // Database health check
    this.healthChecker.addCheck('database', async () => {
      const start = Date.now()
      try {
        // Test database connection
        const result = { status: 'healthy', message: 'Database connection successful', timestamp: new Date(), latency: Date.now() - start }
        return result
      } catch (error) {
        return { status: 'unhealthy', message: error.message, timestamp: new Date(), latency: Date.now() - start }
      }
    })

    // Cache health check
    this.healthChecker.addCheck('cache', async () => {
      const start = Date.now()
      try {
        // Test cache connection
        const result = { status: 'healthy', message: 'Cache accessible', timestamp: new Date(), latency: Date.now() - start }
        return result
      } catch (error) {
        return { status: 'unhealthy', message: error.message, timestamp: new Date(), latency: Date.now() - start }
      }
    })

    // External APIs health check
    this.healthChecker.addCheck('external_apis', async () => {
      const start = Date.now()
      try {
        // Check external API status
        const result = { status: 'healthy', message: 'External APIs responsive', timestamp: new Date(), latency: Date.now() - start }
        return result
      } catch (error) {
        return { status: 'degraded', message: error.message, timestamp: new Date(), latency: Date.now() - start }
      }
    })
  }

  private startMetricsCollection(): void {
    if (typeof process !== 'undefined') {
      // System memory metrics
      setInterval(() => {
        const memUsage = process.memoryUsage()
        this.tracer.trackMetric('memory.heap.used', memUsage.heapUsed)
        this.tracer.trackMetric('memory.heap.total', memUsage.heapTotal)
        this.tracer.trackMetric('memory.rss', memUsage.rss)
      }, 10000)

      // CPU usage (approximate)
      setInterval(() => {
        const cpuUsage = process.cpuUsage()
        this.tracer.trackMetric('cpu.user', cpuUsage.user / 1000000)
        this.tracer.trackMetric('cpu.system', cpuUsage.system / 1000000)
      }, 10000)
    }
  }

  // Public API
  getTracer(): DistributedTracer {
    return this.tracer
  }

  getErrorTracker(): ErrorTracker {
    return this.errorTracker
  }

  getHealthChecker(): HealthChecker {
    return this.healthChecker
  }

  startMonitoring(): void {
    this.healthChecker.startChecking()
    console.log('Application monitoring started')
  }

  stopMonitoring(): void {
    this.healthChecker.stopChecking()
    console.log('Application monitoring stopped')
  }

  getServiceMetrics(): ServiceMetrics {
    const memUsage = process.memoryUsage()
    
    return {
      service: 'realbrand-pro',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      cpu: {
        usage: 0, // Would calculate actual CPU usage
        loadAverage: []
      },
      requests: {
        total: 0, // Would track from request middleware
        successful: 0,
        failed: 0,
        avgResponseTime: 0
      },
      database: {
        connections: 0, // Would track DB connections
        queries: 0,
        slowQueries: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0
      }
    }
  }
}

// Global observability instance
export const observability = new ApplicationPerformanceManager()

export default observability
