export interface OptionValue {
  id: string
  value: string
  label: string
  colorCode?: string | null
  sortOrder: number
  description?: string | null
  isActive?: boolean | null
  isDefault?: boolean | null
}

export interface OptionSet {
  id: string
  module: string
  entity: string
  fieldName: string
  name: string
  description?: string | null
  isActive?: boolean | null
  isSystem?: boolean | null
  values?: OptionValue[]
}

export interface CreateOptionSetRequest {
  module: string
  entity: string
  fieldName: string
  name: string
  description?: string | null
  isActive?: boolean | null
  isSystem?: boolean | null
}

export interface UpdateOptionSetRequest {
  name?: string
  description?: string | null
  isActive?: boolean | null
}

export interface CreateOptionValueRequest {
  value: string
  label: string
  colorCode?: string | null
  sortOrder: number
  description?: string | null
  isActive?: boolean | null
  isDefault?: boolean | null
}

export interface UpdateOptionValueRequest {
  label?: string
  colorCode?: string | null
  sortOrder?: number
  description?: string | null
  isActive?: boolean | null
  isDefault?: boolean | null
}

export interface CustomFieldDefinition {
  id: string
  module: string
  entity: string
  fieldKey: string
  label: string
  dataType: string
  helpText?: string | null
  defaultValue?: string | null
  optionsJson?: string | null
  sortOrder: number
  isRequired?: boolean | null
  isActive?: boolean | null
  isSystem?: boolean | null
}

export interface CreateCustomFieldDefinitionRequest {
  module: string
  entity: string
  fieldKey: string
  label: string
  dataType: string
  helpText?: string | null
  defaultValue?: string | null
  optionsJson?: string | null
  sortOrder: number
  isRequired?: boolean | null
  isActive?: boolean | null
  isSystem?: boolean | null
}

export interface UpdateCustomFieldDefinitionRequest {
  label?: string
  dataType?: string
  helpText?: string | null
  defaultValue?: string | null
  optionsJson?: string | null
  sortOrder?: number
  isRequired?: boolean | null
  isActive?: boolean | null
}

export interface CustomFieldValue {
  id: string
  definitionId: string
  fieldKey: string
  value?: string | null
}

export interface UpsertCustomFieldValuesRequest {
  module: string
  entity: string
  entityId: string
  values: Array<{
    fieldKey: string
    value?: string | null
  }>
}

export interface LayoutConfig {
  id: string
  module: string
  entity: string
  name: string
  layoutJson: string
  status?: string | null
  versionNumber?: number | null
  appliesToRoles?: string | null
  publishedAt?: string | null
  publishedBy?: string | null
  isDefault?: boolean | null
  isActive?: boolean | null
}

export interface CreateLayoutConfigRequest {
  module: string
  entity: string
  name: string
  layoutJson: string
  status?: string | null
  appliesToRoles?: string | null
  isDefault?: boolean | null
  isActive?: boolean | null
}

export interface UpdateLayoutConfigRequest {
  name?: string
  layoutJson?: string
  appliesToRoles?: string | null
  isDefault?: boolean | null
  isActive?: boolean | null
}

export interface LayoutFieldConfig {
  fieldKey: string
  span?: number | null
  visibleRoles?: string[] | null
  visibleWhen?: LayoutFieldCondition | null
  readOnly?: boolean | null
  required?: boolean | null
}

export type LayoutFieldCondition = {
  fieldKey: string
  operator: 'EQ' | 'NEQ' | 'IN' | 'NOT_IN' | 'CONTAINS' | 'NOT_CONTAINS' | 'EMPTY' | 'NOT_EMPTY'
  value?: string | null
}

export interface LayoutSectionConfig {
  id: string
  title?: string | null
  columns?: number | null
  fields: LayoutFieldConfig[]
}

export interface LayoutSchema {
  version?: number | null
  sections: LayoutSectionConfig[]
  hideUnassigned?: boolean | null
}

export interface WorkflowTransition {
  id: string
  workflowDefinitionId: string
  fromStatus: string
  toStatus: string
  actionLabel?: string | null
  requiresApproval: boolean
  approverRole?: string | null
  slaHours?: number | null
  escalationRole?: string | null
  escalationAfterHours?: number | null
  isActive?: boolean | null
}

export interface WorkflowDefinition {
  id: string
  module: string
  entity: string
  name: string
  description?: string | null
  initialStatus?: string | null
  isDefault?: boolean | null
  isActive?: boolean | null
  transitions?: WorkflowTransition[]
}

export interface CreateWorkflowDefinitionRequest {
  module: string
  entity: string
  name: string
  description?: string | null
  initialStatus?: string | null
  isDefault?: boolean | null
  isActive?: boolean | null
}

export interface UpdateWorkflowDefinitionRequest {
  name?: string
  description?: string | null
  initialStatus?: string | null
  isDefault?: boolean | null
  isActive?: boolean | null
}

export interface CreateWorkflowTransitionRequest {
  fromStatus: string
  toStatus: string
  actionLabel?: string | null
  requiresApproval: boolean
  approverRole?: string | null
  slaHours?: number | null
  escalationRole?: string | null
  escalationAfterHours?: number | null
  isActive?: boolean | null
}

export interface UpdateWorkflowTransitionRequest {
  actionLabel?: string | null
  requiresApproval?: boolean
  approverRole?: string | null
  slaHours?: number | null
  escalationRole?: string | null
  escalationAfterHours?: number | null
  isActive?: boolean | null
}

export interface WorkflowApprovalRequest {
  id: string
  module: string
  entity: string
  entityId: string
  fromStatus?: string | null
  toStatus?: string | null
  status: string
  approverRole?: string | null
  escalationRole?: string | null
  escalationAfterHours?: number | null
  requestedBy?: string | null
  approvedBy?: string | null
  notes?: string | null
  dueAt?: string | null
  slaBreachedAt?: string | null
  escalatedAt?: string | null
  escalationLevel?: number | null
  resolvedAt?: string | null
  appliedAt?: string | null
}

export interface WorkflowApprovalActionRequest {
  action: string
  notes?: string | null
}

export interface WebhookSubscription {
  id: string
  module: string
  entity: string
  eventType: string
  targetUrl: string
  secret?: string | null
  headersJson?: string | null
  isActive?: boolean | null
}

export interface CreateWebhookSubscriptionRequest {
  module: string
  entity: string
  eventType: string
  targetUrl: string
  secret?: string | null
  headersJson?: string | null
  isActive?: boolean | null
}

export interface UpdateWebhookSubscriptionRequest {
  eventType?: string
  targetUrl?: string
  secret?: string | null
  headersJson?: string | null
  isActive?: boolean | null
}
