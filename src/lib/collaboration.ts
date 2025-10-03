'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { auth } from './auth'

// Real-time collaboration types
export interface CollaborationSession {
  id: string
  userId: string
  userName: string
  userRole: string
  focusElement?: string
  cursor?: {
    x: number
    y: number
  }
  lastActive: string
  page: string
}

export interface CollaborationEvent {
  type: 'user_joined' | 'user_left' | 'cursor_move' | 'focus_change' | 'comment_added' | 'asset_updated'
  session: CollaborationSession
  data?: any
  timestamp: string
}

export interface Comment {
  id: string
  userId: string
  userName: string
  assetId: string
  content: string
  x: number
  y: number
  resolved: boolean
  repliesCount: number
  createdAt: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export class CollaborationManager {
  private eventHandlers: Map<string, ((event: CollaborationEvent) => void)[]> = new Map()
  private session: CollaborationSession | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private cleanupTimeout: NodeJS.Timeout | null = null

  constructor() {
    this.startHeartbeat()
  }

  // Session management
  async joinSession(page: string): Promise<boolean> {
    try {
      const currentUser = await auth.getCurrentUser()
      if (!currentUser) return false

      this.session = {
        id: crypto.randomUUID(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        lastActive: new Date().toISOString(),
        page
      }

      // Broadcast join event
      await this.broadcastEvent('user_joined', this.session)
      
      // Subscribe to real-time events
      this.subscribeToEvents()
      
      return true
    } catch (error) {
      console.error('Failed to join collaboration session:', error)
      return false
    }
  }

  async leaveSession(): Promise<void> {
    if (!this.session) return

    try {
      // Broadcast leave event
      await this.broadcastEvent('user_left', this.session)
      
      // Cleanup
      this.session = null
      this.eventHandlers.clear()
      this.stopHeartbeat()
    } catch (error) {
      console.error('Failed to leave collaboration session:', error)
    }
  }

  // Event system
  on(eventType: string, handler: (event: CollaborationEvent) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, [])
    }
    this.eventHandlers.get(eventType)!.push(handler)
  }

  off(eventType: string, handler: (event: CollaborationEvent) => void): void {
    const handlers = this.eventHandlers.get(eventType)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private emit(eventType: string, event: CollaborationEvent): void {
    const handlers = this.eventHandlers.get(eventType)
    if (handlers) {
      handlers.forEach(handler => handler(event))
    }
  }

  // Real-time updates
  async updateCursor(x: number, y: number): Promise<void> {
    if (!this.session) return

    this.session.cursor = { x, y }
    this.session.lastActive = new Date().toISOString()

    await this.broadcastEvent('cursor_move', this.session, { x, y })
  }

  async updateFocus(elementId: string): Promise<void> {
    if (!this.session) return

    this.session.focusElement = elementId
    this.session.lastActive = new Date().toISOString()

    await this.broadcastEvent('focus_change', this.session, { elementId })
  }

  async addComment(assetId: string, content: string, x: number, y: number): Promise<Comment> {
    if (!this.session) return

    const comment: Comment = {
      id: crypto.randomUUID(),
      userId: this.session.userId,
      userName: this.session.userName,
      assetId,
      content,
      x,
      y,
      resolved: false,
      repliesCount: 0,
      createdAt: new Date().toISOString()
    }

    await this.broadcastEvent('comment_added', this.session, comment)
    return comment
  }

  // Supabase real-time integration
  private subscribeToEvents(): void {
    supabase
      .channel('collaboration-events')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'collaboration_events'
      }, (payload) => {
        this.handleSupabaseEvent(payload)
      })
      .subscribe()
  }

  private async handleSupabaseEvent(payload: any): void {
    try {
      const event: CollaborationEvent = {
        type: payload.new.type,
        session: payload.new.session,
        data: payload.new.data,
        timestamp: payload.new.timestamp
      }

      // Don't emit events from our own session
      if (event.session.userId === this.session?.userId) return

      this.emit(event.type, event)
    } catch (error) {
      console.error('Error handling Supabase event:', error)
    }
  }

  private async broadcastEvent(type: string, session: CollaborationSession, data?: any): Promise<void> {
    if (!session) return

    const event: CollaborationEvent = {
      type: type as any,
      session,
      data,
      timestamp: new Date().toISOString()
    }

    // Store in Supabase for real-time sync
    await supabase.from('collaboration_events').insert({
      type: event.type,
      session: event.session,
      data: event.data,
      timestamp: event.timestamp
    })
  }

  // Heartbeat for keeping sessions alive
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.session) {
        this.session.lastActive = new Date().toISOString()
      }
    }, 30000) // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // Cleanup inactive sessions
  private scheduleCleanup(): void {
    this.cleanupTimeout = setTimeout(() => {
      // Remove sessions inactive for more than 5 minutes
      const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      supabase.from('collaboration_sessions')
        .delete()
        .lt('last_active', cutoff)
    }, 60000) // Check every minute
  }
}

// React hooks for easy integration
export function useCollaboration(page: string) {
  const [manager] = useState(() => new CollaborationManager())
  const [isConnected, setIsConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState<CollaborationSession[]>([])
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    let mounted = true

    const setupCollaboration = async () => {
      const connected = await manager.joinSession(page)
      if (mounted) {
        setIsConnected(connected)
      }
    }

    setupCollaboration()

    // Event handlers
    manager.on('user_joined', (event) => {
      if (mounted) {
        setActiveUsers(prev => [...prev.filter(u => u.userId !== event.session.userId), event.session])
      }
    })

    manager.on('user_left', (event) => {
      if (mounted) {
        setActiveUsers(prev => prev.filter(u => u.userId !== event.session.userId))
      }
    })

    manager.on('cursor_move', (event) => {
      // Handle cursor movement updates
      if (mounted) {
        setActiveUsers(prev => prev.map(u => 
          u.userId === event.session.userId 
            ? { ...u, cursor: event.data?.cursor } 
            : u
        ))
      }
    })

    manager.on('comment_added', (event) => {
      if (mounted && event.data) {
        setComments(prev => [...prev, event.data])
      }
    })

    return () => {
      mounted = false
      manager.leaveSession()
    }
  }, [manager, page])

  const updateCursor = useCallback((x: number, y: number) => {
    manager.updateCursor(x, y)
  }, [manager])

  const updateFocus = useCallback((elementId: string) => {
    manager.updateFocus(elementId)
  }, [manager])

  const addComment = useCallback(async (assetId: string, content: string, x: number, y: number) => {
    return await manager.addComment(assetId, content, x, y)
  }, [manager])

  return {
    isConnected,
    activeUsers,
    comments,
    updateCursor,
    updateFocus,
    addComment
  }
}

// Asset collaboration features
export function useAssetCollaboration(assetId: string) {
  const collaboration = useCollaboration(`asset-${assetId}`)
  const [isEditing, setIsEditing] = useState(false)

  const startEditing = useCallback(async () => {
    await collaboration.updateFocus(`asset-${assetId}`)
    setIsEditing(true)
  }, [collaboration, assetId])

  const stopEditing = useCallback(async () => {
    await collaboration.updateFocus('')
    setIsEditing(false)
  }, [collaboration])

  return {
    ...collaboration,
    isEditing,
    startEditing,
    stopEditing
  }
}
