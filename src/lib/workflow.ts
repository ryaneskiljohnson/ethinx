import { supabase } from './auth'
import { auth } from './auth'

export interface WorkflowRule {
  id: string
  name: string
  description: string
  trigger: WorkflowTrigger
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  enabled: boolean
  priority: number
  createdAt: string
  updatedAt: string
}

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'webhook' | 'user_action'
  eventType?: string
  schedule?: string // cron expression
  webhookUrl?: string
  actionType?: string
}

export interface WorkflowCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
}

export interface WorkflowAction {
  type: 'email' | 'notification' | 'create_task' | 'update_record' | 'webhook' | 'trigger_workflow'
  templateId?: string
  recordType?: string
  fieldUpdates?: Record<string, any>
  webhookUrl?: string
  workflowId?: string
  parameters?: Record<string, any>
}

export interface WorkflowExecution {
  id: string
  ruleId: string
  triggeredBy: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  result?: any
  error?: string
  startedAt: string
  completedAt?: string
  context: Record<string, any>
}

export interface AgentOnboardingWorkflow {
  agentId: string
  brokerId: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  currentStep: number
  steps: OnboardingStep[]
  startDate: string
  dueDate: string
}

export interface OnboardingStep {
  id: string
  name: string
  description: string
  completed: boolean
  required: boolean
  completedBy?: string
  completedAt?: string
  documents?: OnboardingDocument[]
}

export interface OnboardingDocument {
  name: string
  type: 'license' | 'certificate' | 'agreement' | 'id' | 'other'
  url?: string
  uploadedBy?: string
  uploadedAt?: string
  verified: boolean
}

class WorkflowEngine {
  private executions: Map<string, WorkflowExecution> = new Map()

  // Core workflow management
  async createWorkflow(rule: Omit<WorkflowRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowRule> {
    const currentUser = await auth.getCurrentUser()
    if (!currentUser) throw new Error('Unauthorized')

    const workflowRule: WorkflowRule = {
      id: crypto.randomUUID(),
      name: rule.name,
      description: rule.description,
      trigger: rule.trigger,
      conditions: rule.conditions,
      actions: rule.actions,
      enabled: rule.enabled,
      priority: rule.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const { error } = await supabase
      .from('workflow_rules')
      .insert({
        id: workflowRule.id,
        name: workflowRule.name,
        description: workflowRule.description,
        trigger: workflowRule.trigger,
        conditions: workflowRule.conditions,
        actions: workflowRule.actions,
        enabled: workflowRule.enabled,
        priority: workflowRule.priority,
        brokerage_id: currentUser.brokerage_id,
        created_by: currentUser.id
      })

    if (error) throw new Error('Failed to create workflow rule')

    return workflowRule
  }

  async getWorkflows(): Promise<WorkflowRule[]> {
    const currentUser = await auth.getCurrentUser()
    if (!currentUser) throw new Error('Unauthorized')

    const { data, error } = await supabase
      .from('workflow_rules')
      .select('*')
      .eq('brokerage_id', currentUser.brokerage_id)
      .order('priority', { ascending: false })

    if (error) throw new Error('Failed to fetch workflows')

    return data.map(mapRowToWorkflowRule)
  }

  async updateWorkflow(ruleId: string, updates: Partial<WorkflowRule>): Promise<void> {
    const currentUser = await auth.getCurrentUser()
    if (!currentUser) throw new Error('Unauthorized')

    const { error } = await supabase
      .from('workflow_rules')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', ruleId)
      .eq('brokerage_id', currentUser.brokerage_id)

    if (error) throw new Error('Failed to update workflow rule')
  }

  // Event processing
  async processEvent(eventType: string, payload: any): Promise<void> {
    const applicableRules = await this.getApplicableRules('event', eventType)
    
    for (const rule of applicableRules) {
      try {
        if (await this.evaluateConditions(rule.conditions, payload)) {
          await this.executeRule(rule, payload)
        }
      } catch (error) {
        console.error(`Error processing rule ${rule.id}:`, error)
      }
    }
  }

  private async getApplicableRules(triggerType: string, triggerValue?: string): Promise<WorkflowRule[]> {
    const currentUser = await auth.getCurrentUser()
    if (!currentUser) return []

    let query = supabase
      .from('workflow_rules')
      .select('*')
      .eq('brokerage_id', currentUser.brokerage_id)
      .eq('enabled', true)

    if (triggerValue) {
      query = query.eq('trigger->type', triggerType).eq('trigger->eventType', triggerValue)
    }

    const { data, error } = await query.order('priority', { ascending: false })

    if (error) return []
    return data.map(mapRowToWorkflowRule)
  }

  private async evaluateConditions(conditions: WorkflowCondition[], context: any): Promise<boolean> {
    for (const condition of conditions) {
      const fieldValue = this.getFieldValue(context, condition.field)
      if (!this.evaluateCondition(fieldValue, condition.operator, condition.value)) {
        return false
      }
    }
    return true
  }

  private getFieldValue(context: any, field: string): any {
    return field.split('.').reduce((obj, key) => obj?.[key], context)
  }

  private evaluateCondition(fieldValue: any, operator: string, targetValue: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === targetValue
      case 'not_equals':
        return fieldValue !== targetValue
      case 'contains':
        return String(fieldValue).includes(String(targetValue))
      case 'greater_than':
        return Number(fieldValue) > Number(targetValue)
      case 'less_than':
        return Number(fieldValue) < Number(targetValue)
      case 'in':
        return Array.isArray(targetValue) && targetValue.includes(fieldValue)
      case 'not_in':
        return Array.isArray(targetValue) && !targetValue.includes(fieldValue)
      default:
        return false
    }
  }

  private async executeRule(rule: WorkflowRule, context: any): Promise<void> {
    const execution: WorkflowExecution = {
      id: crypto.randomUUID(),
      ruleId: rule.id,
      triggeredBy: context.userId || 'system',
      status: 'running',
      startedAt: new Date().toISOString(),
      context
    }

    this.executions.set(execution.id, execution)

    try {
      for (const action of rule.actions) {
        await this.executeAction(action, execution.context)
      }
      
      execution.status = 'completed'
      execution.completedAt = new Date().toISOString()
    } catch (error) {
      execution.status = 'failed'
      execution.error = error instanceof Error ? error.message : 'Unknown error'
      execution.completedAt = new Date().toISOString()
    }

    // Store execution
    await supabase.from('workflow_executions').insert(execution)
  }

  private async executeAction(action: WorkflowAction, context: any): Promise<void> {
    switch (action.type) {
      case 'email':
        await this.sendEmail(action, context)
        break
      case 'notification':
        await this.sendNotification(action, context)
        break
      case 'create_task':
        await this.createTask(action, context)
        break
      case 'update_record':
        await this.updateRecord(action, context)
        break
      case 'webhook':
        await this.triggerWebhook(action, context)
        break
      case 'trigger_workflow':
        await this.triggerWorkflow(action, context)
        break
    }
  }

  // Agent Onboarding Workflow
  async startAgentOnboarding(agentId: string, brokerId?: string): Promise<AgentOnboardingWorkflow> {
    const workflow: AgentOnboardingWorkflow = {
      agentId,
      brokerId: brokerId || '',
      status: 'pending',
      currentStep: 0,
      steps: await this.getOnboardingSteps(),
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    }

    await supabase.from('agent_onboarding').insert(workflow)

    // Start workflow automation
    await this.processAgentOnboardingEvents(workflow)

    return workflow
  }

  private async getOnboardingSteps(): Promise<OnboardingStep[]> {
    return [
      {
        id: 'basic-info',
        name: 'Basic Information',
        description: 'Complete agent profile and contact information',
        completed: false,
        required: true
      },
      {
        id: 'license-upload',
        name: 'License Verification',
        description: 'Upload valid real estate license',
        completed: false,
        required: true
      },
      {
        id: 'agreement-signing',
        name: 'Broker Agreement',
        description: 'Sign broker-age agreement',
        completed: false,
        required: true
      },
      {
        id: 'mls-setup',
        name: 'MLS Access',
        description: 'Setup MLS credentials and training',
        completed: false,
        required: true
      },
      {
        id: 'brand-training',
        name: 'Brand Guidelines',
        description: 'Complete brand training and certification',
        completed: false,
        required: false
      },
      {
        id: 'first-listing',
        name: 'First Listing',
        description: 'Successfully create first property listing',
        completed: false,
        required: true
      }
    ]
  }

  private async processAgentOnboardingEvents(workflow: AgentOnboardingWorkflow): Promise<void> {
    // Automatic step progression based on events
    await this.processEvent('agent_onboarding_started', {
      agentId: workflow.agentId,
      brokerId: workflow.brokerId,
      workflowId: workflow.agentId
    })
  }

  // Automated workflows for real estate
  async setupRealEstateWorkflows(): Promise<void> {
    const workflows = [
      // License expiration monitoring
      {
        name: 'License Expiration Alert',
        description: 'Alert when agent license expires soon',
        trigger: { type: 'schedule', schedule: '0 9 * * *' }, // Daily at 9 AM
        conditions: [
          { field: 'license_expiry', operator: 'less_than', value: 30 } // 30 days
        ],
        actions: [
          { type: 'email', templateId: 'license-expiration-warning' },
          { type: 'notification', parameters: { type: 'warning' } }
        ],
        enabled: true,
        priority: 5
      },
      
      // New agent welcome sequence
      {
        name: 'New Agent Welcome',
        description: 'Welcome new agent with onboarding materials',
        trigger: { type: 'event', eventType: 'agent_registered' },
        conditions: [],
        actions: [
          { type: 'email', templateId: 'agent-welcome' },
          { type: 'create_task', parameters: { 
            title: 'Complete onboarding', 
            assignTo: 'agent',
            priority: 'high'
          }}
        ],
        enabled: true,
        priority: 7
      },

      // Compliance violation alert
      {
        name: 'Compliance Violation Alert',
        description: 'Alert on compliance violations',
        trigger: { type: 'event', eventType: 'compliance_violation' },
        conditions: [],
        actions: [
          { type: 'email', templateId: 'compliance-violation' },
          { type: 'notification', parameters: { type: 'urgent' } },
          { type: 'webhook', webhookUrl: process.env.COMPLIANCE_WEBHOOK_URL }
        ],
        enabled: true,
        priority: 9
      },

      // Brand usage reminder
      {
        name: 'Brand Usage Reminder',
        description: 'Remind agents to use approved brand materials',
        trigger: { type: 'schedule', schedule: '0 10 * * 1' }, // Monday at 10 AM
        conditions: [
          { field: 'days_since_last_brand_usage', operator: 'greater_than', value: 7 }
        ],
        actions: [
          { type: 'notification', parameters: { type: 'info' } }
        ],
        enabled: true,
        priority: 3
      }
    ]

    for (const workflow of workflows) {
      await this.createWorkflow(workflow)
    }
  }

  // Action implementations
  private async sendEmail(action: WorkflowAction, context: any): Promise<void> {
    const { templateId, parameters } = action
    
    // Email implementation would go here
    console.log(`Sending email with template ${templateId}:`, context)
  }

  private async sendNotification(action: WorkflowAction, context: any): Promise<void> {
    const { parameters } = action
    
    await supabase.from('notifications').insert({
      type: parameters?.type || 'info',
      title: action.parameters?.title || 'Workflow Notification',
      message: action.parameters?.message || 'Workflow action completed',
      recipient_id: context.userId,
      created_at: new Date().toISOString()
    })
  }

  private async createTask(action: WorkflowAction, context: any): Promise<void> {
    await supabase.from('tasks').insert({
      title: action.parameters?.title || 'New Task',
      description: action.parameters?.description || '',
      assignee_id: action.parameters?.assignTo || context.userId,
      priority: action.parameters?.priority || 'medium',
      status: 'pending',
      created_at: new Date().toISOString()
    })
  }

  private async updateRecord(action: WorkflowAction, context: any): Promise<void> {
    const { fieldUpdates = {} } = action
    
    await supabase
      .from(action.recordType || 'workflow_context')
      .update({
        ...fieldUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', context.recordId)
  }

  private async triggerWebhook(action: WorkflowAction, context: any): Promise<void> {
    const { webhookUrl, parameters } = action
    
    if (!webhookUrl) return

    // Webhook implementation would go here
    console.log(`Triggering webhook ${webhookUrl}:`, context)
  }

  private async triggerWorkflow(action: WorkflowAction, context: any): Promise<void> {
    const { workflowId } = action
    
    if (!workflowId) return

    const rule = await this.getWorkflowById(workflowId)
    if (rule) {
      await this.executeRule(rule, context)
    }
  }

  private async getWorkflowById(id: string): Promise<WorkflowRule | null> {
    const { data, error } = await supabase
      .from('workflow_rules')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return mapRowToWorkflowRule(data)
  }
}

function mapRowToWorkflowRule(row: any): WorkflowRule {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    trigger: row.trigger,
    conditions: row.conditions,
    actions: row.actions,
    enabled: row.enabled,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export const workflow = new WorkflowEngine()
