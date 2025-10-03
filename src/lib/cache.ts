import { Redis } from '@upstash/redis'
import { LRUCache } from 'lru-cache'

export interface CacheStrategy {
  type: 'memory' | 'redis' | 'hybrid'
  ttl: number // Time to live in seconds
  maxSize?: number // Max items for memory cache
  namespace?: string // Key prefix
  serialize?: boolean // Whether to serialize/deserialize objects
}

export interface CacheMetrics {
  hits: number
  misses: number
  hitRate: number
  memoryUsage: number
  evictions: number
  averageResponseTime: number
}

export interface DistributedCacheConfig {
  redis: {
    url: string
    token: string
    ttl: number
    cluster: boolean
  }
  memory: {
    maxSize: number
    ttl: number
  }
  strategy: 'write-through' | 'write-behind' | 'write-around'
  fallback: boolean
}

class LRUMemoryCache extends LRUCache<string, any> {
  private metrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    averageLoadTime: 0,
    totalLoadTime: 0
  }

  constructor(options: LRUCache.Options<string, any, unknown>) {
    super(options)

    // Override get method to track metrics
    const originalGet = this.get.bind(this)
    this.get = (key: string) => {
      const startTime = Date.now()
      const result = originalGet(key)
      const loadTime = Date.now() - startTime

      this.metrics.totalLoadTime += loadTime
      this.metrics.averageLoadTime = this.metrics.totalLoadTime / (this.metrics.hits + this.metrics.misses)

      if (result !== undefined) {
        this.metrics.hits++
      } else {
        this.metrics.misses++
      }

      return result
    }

    // Track evictions
    this.on('evict', () => {
      this.metrics.evictions++
    })
  }

  getMetrics(): CacheMetrics {
    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      hitRate: this.metrics.hits / (this.metrics.hits + this.metrics.misses),
      memoryUsage: this.calculatedSize,
      evictions: this.metrics.evictions,
      averageResponseTime: this.metrics.averageLoadTime
    }
  }
}

class RedisCache {
  private redis: Redis
  private namespace: string
  private ttl: number

  constructor(config: DistributedCacheConfig['redis'], namespace = 'realbrand') {
    this.redis = new Redis({
      url: config.url,
      token: config.token
    })
    this.namespace = namespace
    this.ttl = config.ttl
  }

  private getKey(key: string): string {
    return `${this.namespace}:${key}`
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(this.getKey(key))
      return value as T
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.redis.set(this.getKey(key), value, {
        ex: ttl || this.ttl
      })
    } catch (error) {
      console.error('Redis set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(this.getKey(key))
    } catch (error) {
      console.error('Redis del error:', error)
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return (await this.redis.exists(this.getKey(key))) === 1
    } catch (error) {
      console.error('Redis exists error:', error)
      return false
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      const keys = await this.redis.keys(this.getKey(pattern))
      return keys.map(key => key.replace(`${this.namespace}:`, ''))
    } catch (error) {
      console.error('Redis keys error:', error)
      return []
    }
  }

  async flush(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        const keys = await this.keys(pattern)
        if (keys.length > 0) {
          await this.redis.del(...keys.map(key => this.getKey(key)))
        }
      } else {
        await this.redis.flushdb()
      }
    } catch (error) {
      console.error('Redis flush error:', error)
    }
  }
}

// Hybrid cache implementation combining memory and Redis
export class AdvancedCache {
  private memory: LRUMemoryCache
  private redis: RedisCache
  private strategy: DistributedCacheConfig['strategy']
  private fallback: boolean
  private performanceMetrics = {
    memoryHits: 0,
    redisHits: 0,
    misses: 0,
    writes: 0,
    errors: 0
  }

  constructor(config: DistributedCacheConfig) {
    this.memory = new LRUMemoryCache({
      max: config.memory.maxSize,
      ttl: config.memory.ttl * 1000 // Convert to milliseconds
    })

    this.redis = new RedisCache(config.redis, 'realbrand')
    this.strategy = config.strategy
    this.fallback = config.fallback
  }

  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryResult = this.memory.get(key)
    if (memoryResult !== undefined) {
      this.performanceMetrics.memoryHits++
      return memoryResult
    }

    // Fall back to Redis
    try {
      const redisResult = await this.redis.get<T>(key)
      if (redisResult !== null) {
        // Store in memory cache for future access
        this.memory.set(key, redisResult)
        this.performanceMetrics.redisHits++
        return redisResult
      }
    } catch (error) {
      this.performanceMetrics.errors++
      console.error('Cache get error:', error)
      
      if (!this.fallback) {
        throw error
      }
    }

    this.performanceMetrics.misses++
    return null
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.performanceMetrics.writes++

    switch (this.strategy) {
      case 'write-through':
        await this.writeThrough(key, value, ttl)
        break
      case 'write-behind':
        await this.writeBehind(key, value, ttl)
        break
      case 'write-around':
        await this.writeAround(key, value, ttl)
        break
    }
  }

  private async writeThrough(key: string, value: any, ttl?: number): Promise<void> {
    // Write to both memory and Redis simultaneously
    this.memory.set(key, value)
    
    try {
      await this.redis.set(key, value, ttl)
    } catch (error) {
      this.performanceMetrics.errors++
      console.error('Redis write-through error:', error)
      
      if (!this.fallback) {
        throw error
      }
    }
  }

  private async writeBehind(key: string, value: any, ttl?: number): Promise<void> {
    // Write to memory immediately, Redis asynchronously
    this.memory.set(key, value)
    
    // Queue Redis write (in real implementation, use proper queue)
    setImmediate(async () => {
      try {
        await this.redis.set(key, value, ttl)
      } catch (error) {
        console.error('Redis write-behind error:', error)
      }
    })
  }

  private async writeAround(key: string, value: any, ttl?: number): Promise<void> {
    // Skip cache, write directly to Redis
    try {
      await this.redis.set(key, value, ttl)
      // Don't store in memory cache
    } catch (error) {
      this.performanceMetrics.errors++
      console.error('Redis write-around error:', error)
      
      if (!this.fallback) {
        throw error
      }
    }
  }

  async del(key: string): Promise<void> {
    this.memory.delete(key)
    
    try {
      await this.redis.del(key)
    } catch (error) {
      this.performanceMetrics.errors++
      console.error('Cache delete error:', error)
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    // Clear memory cache (all keys since LRU can't pattern match efficiently)
    this.memory.clear()
    
    try {
      await this.redis.flush(pattern)
    } catch (error) {
      console.error('Cache pattern invalidation error:', error)
    }
  }

  // Cache warming for critical data
  async warmCache(warmupData: Array<{key: string, value: any}>): Promise<void> {
    console.log(`Warming cache with ${warmupData.length} items`)
    
    for (const item of warmupData) {
      await this.set(item.key, item.value)
    }
    
    console.log('Cache warming completed')
  }

  // Cache statistics and monitoring
  getMetrics(): CacheMetrics {
    const memoryMetrics = this.memory.getMetrics()
    
    return {
      hits: this.performanceMetrics.memoryHits + this.performanceMetrics.redisHits,
      misses: this.performanceMetrics.misses,
      hitRate: (this.performanceMetrics.memoryHits + this.performanceMetrics.redisHits) / 
               (this.performanceMetrics.memoryHits + this.performanceMetrics.redisHits + this.performanceMetrics.misses),
      memoryUsage: memoryMetrics.memoryUsage,
      evictions: memoryMetrics.evictions,
      averageResponseTime: memoryMetrics.averageResponseTime
    }
  }

  // Cache health monitoring
  async healthCheck(): Promise<{memory: boolean, redis: boolean}> {
    const memory = this.memory.size >= 0 // Simple memory check
    
    let redis = false
    try {
      await this.redis.exists('health-check-key')
      redis = true
    } catch (error) {
      console.error('Redis health check failed:', error)
    }

    return { memory, redis }
  }
}

// Cache decorator for methods
export function cached(ttl: number = 300, keyGenerator?: (...args: any[]) => string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const cache = new AdvancedCache({
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        token: process.env.REDIS_TOKEN || '',
        ttl: ttl,
        cluster: false
      },
      memory: {
        maxSize: 1000,
        ttl: ttl
      },
      strategy: 'write-through',
      fallback: true
    })

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator ? keyGenerator(...args) : `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`
      
      // Try to get from cache
      const cached = await cache.get(key)
      if (cached !== null) {
        return cached
      }

      // Execute original method and cache result
      const result = await originalMethod.apply(this, args)
      await cache.set(key, result, ttl)
      
      return result
    }

    return descriptor
  }
}

// Global cache instance
const globalCache = new AdvancedCache({
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    token: process.env.REDIS_TOKEN || '',
    ttl: 3600, // 1 hour default
    cluster: process.env.NODE_ENV === 'production'
  },
  memory: {
    maxSize: 1000,
    ttl: 1800 // 30 minutes
  },
  strategy: 'write-through',
  fallback: true
})

export default globalCache
