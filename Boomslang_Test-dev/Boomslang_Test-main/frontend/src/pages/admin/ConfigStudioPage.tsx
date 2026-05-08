import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { configApi } from '../../api/configApi'
import {
  CreateCustomFieldDefinitionRequest,
  CreateLayoutConfigRequest,
  CreateOptionSetRequest,
  CreateOptionValueRequest,
  CreateWebhookSubscriptionRequest,
  CreateWorkflowDefinitionRequest,
  CreateWorkflowTransitionRequest,
  CustomFieldDefinition,
  LayoutConfig,
  LayoutFieldCondition,
  LayoutSchema,
  OptionSet,
  OptionValue,
  UpdateCustomFieldDefinitionRequest,
  UpdateLayoutConfigRequest,
  UpdateOptionSetRequest,
  UpdateOptionValueRequest,
  UpdateWebhookSubscriptionRequest,
  UpdateWorkflowDefinitionRequest,
  UpdateWorkflowTransitionRequest,
  WebhookSubscription,
  WorkflowApprovalActionRequest,
  WorkflowApprovalRequest,
  WorkflowDefinition,
  WorkflowTransition,
} from '../../types/config'

const MODULE_OPTIONS = ['CRM', 'HR', 'PM', 'FINANCE', 'ERP', 'FIELDWORK']
const ENTITY_OPTIONS = [
  'DEAL',
  'QUOTE',
  'LEAD',
  'ACCOUNT',
  'CONTACT',
  'TIMESHEET',
  'TASK',
  'PROJECT',
  'INVOICE',
  'PAYMENT',
  'EQUIPMENT',
  'PURCHASE_ORDER',
  'SALES_ORDER',
  'SPARE_PART',
  'WORK_ORDER',
]

const DATA_TYPE_OPTIONS = ['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'PICKLIST', 'MULTISELECT', 'USER', 'LOOKUP', 'JSON']
const APPROVAL_STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'ALL']

type LayoutBuilderField = {
  id: string
  fieldKey: string
  span: number
  visibleRoles: string
  conditionFieldKey: string
  conditionOperator: string
  conditionValue: string
  readOnly: boolean
  required: boolean
}

type LayoutBuilderSection = {
  id: string
  title: string
  columns: number
  fields: LayoutBuilderField[]
}

const createBuilderId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const ConfigStudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'option-sets' | 'custom-fields' | 'layouts' | 'workflows' | 'approvals' | 'webhooks'>(
    'option-sets'
  )

  const [optionSets, setOptionSets] = useState<OptionSet[]>([])
  const [optionSetModuleFilter, setOptionSetModuleFilter] = useState('')
  const [optionSetsLoading, setOptionSetsLoading] = useState(false)
  const [optionSetForm, setOptionSetForm] = useState<CreateOptionSetRequest>({
    module: 'CRM',
    entity: 'DEAL',
    fieldName: 'status',
    name: '',
    description: '',
    isActive: true,
    isSystem: false,
  })
  const [editingOptionSetId, setEditingOptionSetId] = useState<string | null>(null)

  const [optionValueForm, setOptionValueForm] = useState<CreateOptionValueRequest>({
    value: '',
    label: '',
    colorCode: '',
    sortOrder: 1,
    description: '',
    isActive: true,
    isDefault: false,
  })
  const [optionValueOptionSetId, setOptionValueOptionSetId] = useState<string>('')
  const [editingOptionValueId, setEditingOptionValueId] = useState<string | null>(null)

  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([])
  const [customFieldModule, setCustomFieldModule] = useState('')
  const [customFieldEntity, setCustomFieldEntity] = useState('')
  const [customFieldsLoading, setCustomFieldsLoading] = useState(false)
  const [customFieldForm, setCustomFieldForm] = useState<CreateCustomFieldDefinitionRequest>({
    module: 'CRM',
    entity: 'DEAL',
    fieldKey: '',
    label: '',
    dataType: 'TEXT',
    helpText: '',
    defaultValue: '',
    optionsJson: '',
    sortOrder: 1,
    isRequired: false,
    isActive: true,
    isSystem: false,
  })
  const [editingCustomFieldId, setEditingCustomFieldId] = useState<string | null>(null)

  const [layouts, setLayouts] = useState<LayoutConfig[]>([])
  const [layoutModule, setLayoutModule] = useState('')
  const [layoutEntity, setLayoutEntity] = useState('')
  const [layoutsLoading, setLayoutsLoading] = useState(false)
  const [layoutForm, setLayoutForm] = useState<CreateLayoutConfigRequest>({
    module: 'CRM',
    entity: 'DEAL',
    name: '',
    layoutJson: '',
    status: 'DRAFT',
    appliesToRoles: '',
    isDefault: false,
    isActive: true,
  })
  const [editingLayoutId, setEditingLayoutId] = useState<string | null>(null)
  const [layoutFieldOptions, setLayoutFieldOptions] = useState<CustomFieldDefinition[]>([])
  const [layoutBuilderSections, setLayoutBuilderSections] = useState<LayoutBuilderSection[]>([])
  const [useLayoutBuilder, setUseLayoutBuilder] = useState(true)

  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([])
  const [workflowModule, setWorkflowModule] = useState('')
  const [workflowEntity, setWorkflowEntity] = useState('')
  const [workflowsLoading, setWorkflowsLoading] = useState(false)
  const [workflowForm, setWorkflowForm] = useState<CreateWorkflowDefinitionRequest>({
    module: 'CRM',
    entity: 'DEAL',
    name: '',
    description: '',
    initialStatus: '',
    isDefault: false,
    isActive: true,
  })
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null)

  const [transitionForm, setTransitionForm] = useState<CreateWorkflowTransitionRequest>({
    fromStatus: '',
    toStatus: '',
    actionLabel: '',
    requiresApproval: false,
    approverRole: '',
    slaHours: undefined,
    escalationRole: '',
    escalationAfterHours: undefined,
    isActive: true,
  })
  const [transitionWorkflowId, setTransitionWorkflowId] = useState<string>('')
  const [editingTransitionId, setEditingTransitionId] = useState<string | null>(null)

  const [approvals, setApprovals] = useState<WorkflowApprovalRequest[]>([])
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('PENDING')
  const [approvalsLoading, setApprovalsLoading] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>({})

  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([])
  const [webhooksLoading, setWebhooksLoading] = useState(false)
  const [webhookForm, setWebhookForm] = useState<CreateWebhookSubscriptionRequest>({
    module: 'CRM',
    entity: 'DEAL',
    eventType: '',
    targetUrl: '',
    secret: '',
    headersJson: '',
    isActive: true,
  })
  const [editingWebhookId, setEditingWebhookId] = useState<string | null>(null)

  const availableOptionSetTargets = useMemo(() =>
    optionSets.map((set) => ({
      id: set.id,
      label: `${set.module}.${set.entity}.${set.fieldName}`,
    })), [optionSets]
  )

  useEffect(() => {
    void loadOptionSets(optionSetModuleFilter)
  }, [optionSetModuleFilter])

  useEffect(() => {
    void loadApprovals(approvalStatusFilter)
  }, [approvalStatusFilter])

  useEffect(() => {
    void loadWebhooks()
  }, [])

  useEffect(() => {
    if (!layoutForm.module || !layoutForm.entity) return
    void loadLayoutFields(layoutForm.module, layoutForm.entity)
  }, [layoutForm.module, layoutForm.entity])

  useEffect(() => {
    if (!useLayoutBuilder) return
    const schema = buildLayoutSchema(layoutBuilderSections)
    setLayoutForm((prev) => ({
      ...prev,
      layoutJson: JSON.stringify(schema, null, 2),
    }))
  }, [layoutBuilderSections, useLayoutBuilder])

  const buildLayoutSchema = (sections: LayoutBuilderSection[]): LayoutSchema => ({
    version: 1,
    sections: sections.map((section) => ({
      id: section.id,
      title: section.title || undefined,
      columns: section.columns || 2,
      fields: section.fields
        .filter((field) => field.fieldKey)
        .map((field) => ({
          fieldKey: field.fieldKey,
          span: field.span || 1,
          visibleRoles: field.visibleRoles
            ? field.visibleRoles.split(',').map((role) => role.trim()).filter(Boolean)
            : undefined,
          visibleWhen: field.conditionFieldKey
            ? {
              fieldKey: field.conditionFieldKey,
              operator: (field.conditionOperator || 'EQ') as LayoutFieldCondition['operator'],
              value: field.conditionValue || undefined,
            }
            : undefined,
          readOnly: field.readOnly || undefined,
          required: field.required || undefined,
        })),
    })),
  })

  const syncBuilderFromJson = (layoutJson: string) => {
    try {
      const parsed = JSON.parse(layoutJson || '') as LayoutSchema
      if (!parsed || !Array.isArray(parsed.sections)) {
        return
      }
      const nextSections: LayoutBuilderSection[] = parsed.sections.map((section) => ({
        id: section.id || createBuilderId('section'),
        title: section.title || '',
        columns: section.columns === 1 ? 1 : 2,
        fields: (section.fields || []).map((field) => ({
          id: createBuilderId('field'),
          fieldKey: field.fieldKey,
          span: field.span === 2 ? 2 : 1,
          visibleRoles: Array.isArray(field.visibleRoles) ? field.visibleRoles.join(', ') : '',
          conditionFieldKey: field.visibleWhen?.fieldKey || '',
          conditionOperator: field.visibleWhen?.operator || 'EQ',
          conditionValue: field.visibleWhen?.value || '',
          readOnly: Boolean(field.readOnly),
          required: Boolean(field.required),
        })),
      }))
      setLayoutBuilderSections(nextSections)
    } catch {
      return
    }
  }

  const loadLayoutFields = async (module: string, entity: string) => {
    try {
      const response = await configApi.listCustomFields(module, entity, true)
      setLayoutFieldOptions(response.data.data || [])
    } catch {
      setLayoutFieldOptions([])
    }
  }

  const loadOptionSets = async (module?: string) => {
    setOptionSetsLoading(true)
    try {
      const response = await configApi.listOptionSets(module || undefined)
      setOptionSets(response.data.data || [])
    } catch (error) {
      toast.error('Failed to load option sets')
    } finally {
      setOptionSetsLoading(false)
    }
  }

  const handleSaveOptionSet = async () => {
    if (!optionSetForm.module || !optionSetForm.entity || !optionSetForm.fieldName || !optionSetForm.name) {
      toast.error('Module, entity, field name, and name are required')
      return
    }

    try {
      if (editingOptionSetId) {
        const payload: UpdateOptionSetRequest = {
          name: optionSetForm.name,
          description: optionSetForm.description || '',
          isActive: optionSetForm.isActive,
        }
        await configApi.updateOptionSet(editingOptionSetId, payload)
        toast.success('Option set updated')
      } else {
        await configApi.createOptionSet(optionSetForm)
        toast.success('Option set created')
      }
      resetOptionSetForm()
      await loadOptionSets(optionSetModuleFilter)
    } catch (error) {
      toast.error('Failed to save option set')
    }
  }

  const handleEditOptionSet = (optionSet: OptionSet) => {
    setEditingOptionSetId(optionSet.id)
    setOptionSetForm({
      module: optionSet.module,
      entity: optionSet.entity,
      fieldName: optionSet.fieldName,
      name: optionSet.name,
      description: optionSet.description || '',
      isActive: optionSet.isActive ?? true,
      isSystem: optionSet.isSystem ?? false,
    })
  }

  const handleDeleteOptionSet = async (optionSetId: string) => {
    if (!confirm('Delete this option set?')) return
    try {
      await configApi.deleteOptionSet(optionSetId)
      toast.success('Option set deleted')
      await loadOptionSets(optionSetModuleFilter)
    } catch (error) {
      toast.error('Failed to delete option set')
    }
  }

  const resetOptionSetForm = () => {
    setEditingOptionSetId(null)
    setOptionSetForm({
      module: 'CRM',
      entity: 'DEAL',
      fieldName: 'status',
      name: '',
      description: '',
      isActive: true,
      isSystem: false,
    })
  }

  const handleSaveOptionValue = async () => {
    if (!optionValueForm.value || !optionValueForm.label || !optionValueForm.sortOrder) {
      toast.error('Value, label, and sort order are required')
      return
    }
    if (!editingOptionValueId && !optionValueOptionSetId) {
      toast.error('Select an option set for the value')
      return
    }

    try {
      if (editingOptionValueId) {
        const payload: UpdateOptionValueRequest = {
          label: optionValueForm.label,
          colorCode: optionValueForm.colorCode || '',
          sortOrder: optionValueForm.sortOrder,
          description: optionValueForm.description || '',
          isActive: optionValueForm.isActive,
          isDefault: optionValueForm.isDefault,
        }
        await configApi.updateOptionValue(editingOptionValueId, payload)
        toast.success('Option value updated')
      } else {
        await configApi.addOptionValue(optionValueOptionSetId, optionValueForm)
        toast.success('Option value created')
      }
      resetOptionValueForm()
      await loadOptionSets(optionSetModuleFilter)
    } catch (error) {
      toast.error('Failed to save option value')
    }
  }

  const handleEditOptionValue = (optionSetId: string, value: OptionValue) => {
    setEditingOptionValueId(value.id)
    setOptionValueOptionSetId(optionSetId)
    setOptionValueForm({
      value: value.value,
      label: value.label,
      colorCode: value.colorCode || '',
      sortOrder: value.sortOrder,
      description: value.description || '',
      isActive: value.isActive ?? true,
      isDefault: value.isDefault ?? false,
    })
  }

  const handleDeleteOptionValue = async (optionValueId: string) => {
    if (!confirm('Delete this option value?')) return
    try {
      await configApi.deleteOptionValue(optionValueId)
      toast.success('Option value deleted')
      await loadOptionSets(optionSetModuleFilter)
    } catch (error) {
      toast.error('Failed to delete option value')
    }
  }

  const resetOptionValueForm = () => {
    setEditingOptionValueId(null)
    setOptionValueOptionSetId('')
    setOptionValueForm({
      value: '',
      label: '',
      colorCode: '',
      sortOrder: 1,
      description: '',
      isActive: true,
      isDefault: false,
    })
  }

  const loadCustomFields = async () => {
    if (!customFieldModule || !customFieldEntity) {
      toast.error('Select module and entity')
      return
    }
    setCustomFieldsLoading(true)
    try {
      const response = await configApi.listCustomFields(customFieldModule, customFieldEntity, true)
      setCustomFields(response.data.data || [])
    } catch (error) {
      toast.error('Failed to load custom fields')
    } finally {
      setCustomFieldsLoading(false)
    }
  }

  const handleSaveCustomField = async () => {
    if (!customFieldForm.module || !customFieldForm.entity || !customFieldForm.fieldKey || !customFieldForm.label) {
      toast.error('Module, entity, field key, and label are required')
      return
    }

    try {
      if (editingCustomFieldId) {
        const payload: UpdateCustomFieldDefinitionRequest = {
          label: customFieldForm.label,
          dataType: customFieldForm.dataType,
          helpText: customFieldForm.helpText || '',
          defaultValue: customFieldForm.defaultValue || '',
          optionsJson: customFieldForm.optionsJson || '',
          sortOrder: customFieldForm.sortOrder,
          isRequired: customFieldForm.isRequired,
          isActive: customFieldForm.isActive,
        }
        await configApi.updateCustomField(editingCustomFieldId, payload)
        toast.success('Custom field updated')
      } else {
        await configApi.createCustomField(customFieldForm)
        toast.success('Custom field created')
      }
      resetCustomFieldForm()
      if (customFieldModule && customFieldEntity) {
        await loadCustomFields()
      }
    } catch (error) {
      toast.error('Failed to save custom field')
    }
  }

  const handleEditCustomField = (field: CustomFieldDefinition) => {
    setEditingCustomFieldId(field.id)
    setCustomFieldForm({
      module: field.module,
      entity: field.entity,
      fieldKey: field.fieldKey,
      label: field.label,
      dataType: field.dataType,
      helpText: field.helpText || '',
      defaultValue: field.defaultValue || '',
      optionsJson: field.optionsJson || '',
      sortOrder: field.sortOrder,
      isRequired: field.isRequired ?? false,
      isActive: field.isActive ?? true,
      isSystem: field.isSystem ?? false,
    })
  }

  const handleDeleteCustomField = async (definitionId: string) => {
    if (!confirm('Delete this custom field?')) return
    try {
      await configApi.deleteCustomField(definitionId)
      toast.success('Custom field deleted')
      await loadCustomFields()
    } catch (error) {
      toast.error('Failed to delete custom field')
    }
  }

  const resetCustomFieldForm = () => {
    setEditingCustomFieldId(null)
    setCustomFieldForm({
      module: 'CRM',
      entity: 'DEAL',
      fieldKey: '',
      label: '',
      dataType: 'TEXT',
      helpText: '',
      defaultValue: '',
      optionsJson: '',
      sortOrder: 1,
      isRequired: false,
      isActive: true,
      isSystem: false,
    })
  }

  const loadLayouts = async () => {
    if (!layoutModule || !layoutEntity) {
      toast.error('Select module and entity')
      return
    }
    setLayoutsLoading(true)
    try {
      const response = await configApi.listLayouts(layoutModule, layoutEntity)
      setLayouts(response.data.data || [])
    } catch (error) {
      toast.error('Failed to load layouts')
    } finally {
      setLayoutsLoading(false)
    }
  }

  const handleSaveLayout = async () => {
    const resolvedLayoutJson = useLayoutBuilder
      ? JSON.stringify(buildLayoutSchema(layoutBuilderSections), null, 2)
      : layoutForm.layoutJson

    if (!layoutForm.module || !layoutForm.entity || !layoutForm.name || !resolvedLayoutJson) {
      toast.error('Module, entity, name, and layout JSON are required')
      return
    }

    try {
      if (editingLayoutId) {
        const payload: UpdateLayoutConfigRequest = {
          name: layoutForm.name,
          layoutJson: resolvedLayoutJson,
          appliesToRoles: layoutForm.appliesToRoles || '',
          isDefault: layoutForm.isDefault,
          isActive: layoutForm.isActive,
        }
        await configApi.updateLayout(editingLayoutId, payload)
        toast.success('Layout updated')
      } else {
        await configApi.createLayout({
          ...layoutForm,
          layoutJson: resolvedLayoutJson,
        })
        toast.success('Layout created')
      }
      resetLayoutForm()
      if (layoutModule && layoutEntity) {
        await loadLayouts()
      }
    } catch (error) {
      toast.error('Failed to save layout')
    }
  }

  const handleEditLayout = (layout: LayoutConfig) => {
    setEditingLayoutId(layout.id)
    setLayoutForm({
      module: layout.module,
      entity: layout.entity,
      name: layout.name,
      layoutJson: layout.layoutJson,
      status: layout.status || 'DRAFT',
      appliesToRoles: layout.appliesToRoles || '',
      isDefault: layout.isDefault ?? false,
      isActive: layout.isActive ?? true,
    })
    setUseLayoutBuilder(true)
    syncBuilderFromJson(layout.layoutJson)
  }

  const handleDeleteLayout = async (layoutId: string) => {
    if (!confirm('Delete this layout?')) return
    try {
      await configApi.deleteLayout(layoutId)
      toast.success('Layout deleted')
      await loadLayouts()
    } catch (error) {
      toast.error('Failed to delete layout')
    }
  }

  const handlePublishLayout = async (layoutId: string) => {
    if (!confirm('Publish this layout?')) return
    try {
      await configApi.publishLayout(layoutId)
      toast.success('Layout published')
      await loadLayouts()
    } catch (error) {
      toast.error('Failed to publish layout')
    }
  }

  const addLayoutSection = () => {
    setLayoutBuilderSections((prev) => ([
      ...prev,
      {
        id: createBuilderId('section'),
        title: 'New Section',
        columns: 2,
        fields: [],
      },
    ]))
  }

  const updateLayoutSection = (sectionId: string, updates: Partial<LayoutBuilderSection>) => {
    setLayoutBuilderSections((prev) =>
      prev.map((section) => (section.id === sectionId ? { ...section, ...updates } : section))
    )
  }

  const removeLayoutSection = (sectionId: string) => {
    setLayoutBuilderSections((prev) => prev.filter((section) => section.id !== sectionId))
  }

  const addLayoutField = (sectionId: string) => {
    setLayoutBuilderSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section
        return {
          ...section,
          fields: [
            ...section.fields,
            {
              id: createBuilderId('field'),
              fieldKey: '',
              span: 1,
              visibleRoles: '',
              conditionFieldKey: '',
              conditionOperator: 'EQ',
              conditionValue: '',
              readOnly: false,
              required: false,
            },
          ],
        }
      })
    )
  }

  const updateLayoutField = (sectionId: string, fieldId: string, updates: Partial<LayoutBuilderField>) => {
    setLayoutBuilderSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section
        return {
          ...section,
          fields: section.fields.map((field) =>
            field.id === fieldId ? { ...field, ...updates } : field
          ),
        }
      })
    )
  }

  const removeLayoutField = (sectionId: string, fieldId: string) => {
    setLayoutBuilderSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section
        return {
          ...section,
          fields: section.fields.filter((field) => field.id !== fieldId),
        }
      })
    )
  }

  const resetLayoutForm = () => {
    setEditingLayoutId(null)
    setLayoutForm({
      module: 'CRM',
      entity: 'DEAL',
      name: '',
      layoutJson: '',
      status: 'DRAFT',
      appliesToRoles: '',
      isDefault: false,
      isActive: true,
    })
    setLayoutBuilderSections([])
    setUseLayoutBuilder(true)
  }

  const loadWorkflows = async () => {
    if (!workflowModule || !workflowEntity) {
      toast.error('Select module and entity')
      return
    }
    setWorkflowsLoading(true)
    try {
      const response = await configApi.listWorkflows(workflowModule, workflowEntity)
      setWorkflows(response.data.data || [])
    } catch (error) {
      toast.error('Failed to load workflows')
    } finally {
      setWorkflowsLoading(false)
    }
  }

  const handleSaveWorkflow = async () => {
    if (!workflowForm.module || !workflowForm.entity || !workflowForm.name) {
      toast.error('Module, entity, and name are required')
      return
    }

    try {
      if (editingWorkflowId) {
        const payload: UpdateWorkflowDefinitionRequest = {
          name: workflowForm.name,
          description: workflowForm.description || '',
          initialStatus: workflowForm.initialStatus || '',
          isDefault: workflowForm.isDefault,
          isActive: workflowForm.isActive,
        }
        await configApi.updateWorkflow(editingWorkflowId, payload)
        toast.success('Workflow updated')
      } else {
        await configApi.createWorkflow(workflowForm)
        toast.success('Workflow created')
      }
      resetWorkflowForm()
      if (workflowModule && workflowEntity) {
        await loadWorkflows()
      }
    } catch (error) {
      toast.error('Failed to save workflow')
    }
  }

  const handleEditWorkflow = (workflow: WorkflowDefinition) => {
    setEditingWorkflowId(workflow.id)
    setWorkflowForm({
      module: workflow.module,
      entity: workflow.entity,
      name: workflow.name,
      description: workflow.description || '',
      initialStatus: workflow.initialStatus || '',
      isDefault: workflow.isDefault ?? false,
      isActive: workflow.isActive ?? true,
    })
  }

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Delete this workflow?')) return
    try {
      await configApi.deleteWorkflow(workflowId)
      toast.success('Workflow deleted')
      await loadWorkflows()
    } catch (error) {
      toast.error('Failed to delete workflow')
    }
  }

  const resetWorkflowForm = () => {
    setEditingWorkflowId(null)
    setWorkflowForm({
      module: 'CRM',
      entity: 'DEAL',
      name: '',
      description: '',
      initialStatus: '',
      isDefault: false,
      isActive: true,
    })
  }

  const handleSaveTransition = async () => {
    if (!transitionForm.fromStatus || !transitionForm.toStatus) {
      toast.error('From and to status are required')
      return
    }
    if (!editingTransitionId && !transitionWorkflowId) {
      toast.error('Select a workflow for the transition')
      return
    }

    try {
      if (editingTransitionId) {
        const payload: UpdateWorkflowTransitionRequest = {
          actionLabel: transitionForm.actionLabel || '',
          requiresApproval: transitionForm.requiresApproval,
          approverRole: transitionForm.approverRole || '',
          slaHours: transitionForm.slaHours,
          escalationRole: transitionForm.escalationRole || '',
          escalationAfterHours: transitionForm.escalationAfterHours,
          isActive: transitionForm.isActive,
        }
        await configApi.updateTransition(editingTransitionId, payload)
        toast.success('Transition updated')
      } else {
        await configApi.addTransition(transitionWorkflowId, {
          ...transitionForm,
          escalationRole: transitionForm.escalationRole || '',
          escalationAfterHours: transitionForm.escalationAfterHours,
        })
        toast.success('Transition created')
      }
      resetTransitionForm()
      if (workflowModule && workflowEntity) {
        await loadWorkflows()
      }
    } catch (error) {
      toast.error('Failed to save transition')
    }
  }

  const handleEditTransition = (workflowId: string, transition: WorkflowTransition) => {
    setEditingTransitionId(transition.id)
    setTransitionWorkflowId(workflowId)
    setTransitionForm({
      fromStatus: transition.fromStatus,
      toStatus: transition.toStatus,
      actionLabel: transition.actionLabel || '',
      requiresApproval: transition.requiresApproval,
      approverRole: transition.approverRole || '',
      slaHours: transition.slaHours || undefined,
      escalationRole: transition.escalationRole || '',
      escalationAfterHours: transition.escalationAfterHours || undefined,
      isActive: transition.isActive ?? true,
    })
  }

  const handleDeleteTransition = async (transitionId: string) => {
    if (!confirm('Delete this transition?')) return
    try {
      await configApi.deleteTransition(transitionId)
      toast.success('Transition deleted')
      await loadWorkflows()
    } catch (error) {
      toast.error('Failed to delete transition')
    }
  }

  const resetTransitionForm = () => {
    setEditingTransitionId(null)
    setTransitionWorkflowId('')
    setTransitionForm({
      fromStatus: '',
      toStatus: '',
      actionLabel: '',
      requiresApproval: false,
      approverRole: '',
      slaHours: undefined,
      escalationRole: '',
      escalationAfterHours: undefined,
      isActive: true,
    })
  }

  const loadApprovals = async (status?: string) => {
    setApprovalsLoading(true)
    try {
      const response = await configApi.listApprovals(status)
      setApprovals(response.data.data || [])
    } catch (error) {
      toast.error('Failed to load approvals')
    } finally {
      setApprovalsLoading(false)
    }
  }

  const handleApprovalAction = async (approvalId: string, action: WorkflowApprovalActionRequest['action']) => {
    try {
      await configApi.actionApproval(approvalId, {
        action,
        notes: approvalNotes[approvalId] || '',
      })
      toast.success('Approval updated')
      await loadApprovals(approvalStatusFilter)
    } catch (error) {
      toast.error('Failed to update approval')
    }
  }

  const loadWebhooks = async () => {
    setWebhooksLoading(true)
    try {
      const response = await configApi.listWebhooks()
      setWebhooks(response.data.data || [])
    } catch (error) {
      toast.error('Failed to load webhooks')
    } finally {
      setWebhooksLoading(false)
    }
  }

  const handleSaveWebhook = async () => {
    if (!webhookForm.module || !webhookForm.entity || !webhookForm.eventType || !webhookForm.targetUrl) {
      toast.error('Module, entity, event type, and target URL are required')
      return
    }

    try {
      if (editingWebhookId) {
        const payload: UpdateWebhookSubscriptionRequest = {
          eventType: webhookForm.eventType,
          targetUrl: webhookForm.targetUrl,
          secret: webhookForm.secret || '',
          headersJson: webhookForm.headersJson || '',
          isActive: webhookForm.isActive,
        }
        await configApi.updateWebhook(editingWebhookId, payload)
        toast.success('Webhook updated')
      } else {
        await configApi.createWebhook(webhookForm)
        toast.success('Webhook created')
      }
      resetWebhookForm()
      await loadWebhooks()
    } catch (error) {
      toast.error('Failed to save webhook')
    }
  }

  const handleEditWebhook = (webhook: WebhookSubscription) => {
    setEditingWebhookId(webhook.id)
    setWebhookForm({
      module: webhook.module,
      entity: webhook.entity,
      eventType: webhook.eventType,
      targetUrl: webhook.targetUrl,
      secret: webhook.secret || '',
      headersJson: webhook.headersJson || '',
      isActive: webhook.isActive ?? true,
    })
  }

  const handleDeleteWebhook = async (subscriptionId: string) => {
    if (!confirm('Delete this webhook?')) return
    try {
      await configApi.deleteWebhook(subscriptionId)
      toast.success('Webhook deleted')
      await loadWebhooks()
    } catch (error) {
      toast.error('Failed to delete webhook')
    }
  }

  const resetWebhookForm = () => {
    setEditingWebhookId(null)
    setWebhookForm({
      module: 'CRM',
      entity: 'DEAL',
      eventType: '',
      targetUrl: '',
      secret: '',
      headersJson: '',
      isActive: true,
    })
  }

  const renderEmptyState = (message: string) => (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {message}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white shadow-lg">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-200">Administration</p>
          <h1 className="text-3xl font-black">Configuration Studio</h1>
          <p className="max-w-2xl text-sm text-slate-200">
            Manage dynamic picklists, custom fields, layouts, workflows, approvals, and webhook automations.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {[
          { id: 'option-sets', label: 'Option Sets' },
          { id: 'custom-fields', label: 'Custom Fields' },
          { id: 'layouts', label: 'Layouts' },
          { id: 'workflows', label: 'Workflows' },
          { id: 'approvals', label: 'Approvals' },
          { id: 'webhooks', label: 'Webhooks' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'option-sets' && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Option Set</h2>
              <div className="mt-4 space-y-3 text-sm">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Module</span>
                  <input
                    list="modules"
                    value={optionSetForm.module}
                    onChange={(event) => setOptionSetForm((prev) => ({ ...prev, module: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    spellCheck={false}
                    disabled={!!editingOptionSetId}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Entity</span>
                  <input
                    list="entities"
                    value={optionSetForm.entity}
                    onChange={(event) => setOptionSetForm((prev) => ({ ...prev, entity: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    spellCheck={false}
                    disabled={!!editingOptionSetId}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Field Name</span>
                  <input
                    value={optionSetForm.fieldName}
                    onChange={(event) => setOptionSetForm((prev) => ({ ...prev, fieldName: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    spellCheck={false}
                    disabled={!!editingOptionSetId}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Name</span>
                  <input
                    value={optionSetForm.name}
                    onChange={(event) => setOptionSetForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Description</span>
                  <textarea
                    value={optionSetForm.description ?? ''}
                    onChange={(event) => setOptionSetForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    rows={3}
                  />
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <input
                      type="checkbox"
                      checked={!!optionSetForm.isActive}
                      onChange={(event) => setOptionSetForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                      className="h-4 w-4"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <input
                      type="checkbox"
                      checked={!!optionSetForm.isSystem}
                      onChange={(event) => setOptionSetForm((prev) => ({ ...prev, isSystem: event.target.checked }))}
                      className="h-4 w-4"
                      disabled={!!editingOptionSetId}
                    />
                    System
                  </label>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={handleSaveOptionSet}
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"
                >
                  {editingOptionSetId ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={resetOptionSetForm}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Option Value</h2>
              <div className="mt-4 space-y-3 text-sm">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Option Set</span>
                  <select
                    value={optionValueOptionSetId}
                    onChange={(event) => setOptionValueOptionSetId(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    disabled={!!editingOptionValueId}
                  >
                    <option value="">Select option set</option>
                    {availableOptionSetTargets.map((target) => (
                      <option key={target.id} value={target.id}>{target.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Value</span>
                  <input
                    value={optionValueForm.value}
                    onChange={(event) => setOptionValueForm((prev) => ({ ...prev, value: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    spellCheck={false}
                    disabled={!!editingOptionValueId}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Label</span>
                  <input
                    value={optionValueForm.label}
                    onChange={(event) => setOptionValueForm((prev) => ({ ...prev, label: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500">Sort Order</span>
                    <input
                      type="number"
                      value={optionValueForm.sortOrder}
                      onChange={(event) => setOptionValueForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500">Color</span>
                    <input
                      value={optionValueForm.colorCode ?? ''}
                      onChange={(event) => setOptionValueForm((prev) => ({ ...prev, colorCode: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                      placeholder="#A0AEC0"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Description</span>
                  <textarea
                    value={optionValueForm.description ?? ''}
                    onChange={(event) => setOptionValueForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    rows={2}
                  />
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <input
                      type="checkbox"
                      checked={!!optionValueForm.isActive}
                      onChange={(event) => setOptionValueForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                      className="h-4 w-4"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <input
                      type="checkbox"
                      checked={!!optionValueForm.isDefault}
                      onChange={(event) => setOptionValueForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
                      className="h-4 w-4"
                    />
                    Default
                  </label>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={handleSaveOptionValue}
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"
                >
                  {editingOptionValueId ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={resetOptionValueForm}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold text-slate-500">
                Module filter
                <input
                  list="modules"
                  value={optionSetModuleFilter}
                  onChange={(event) => setOptionSetModuleFilter(event.target.value)}
                  className="mt-1 block w-48 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="All modules"
                />
              </label>
              <button
                onClick={() => loadOptionSets(optionSetModuleFilter)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-600"
              >
                Refresh
              </button>
            </div>

            {optionSetsLoading ? (
              renderEmptyState('Loading option sets...')
            ) : optionSets.length === 0 ? (
              renderEmptyState('No option sets found for this module.')
            ) : (
              <div className="space-y-4">
                {optionSets.map((set) => (
                  <div key={set.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{set.module} / {set.entity}</p>
                        <h3 className="text-lg font-bold text-slate-900">{set.name}</h3>
                        <p className="text-sm text-slate-500">Field: {set.fieldName}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditOptionSet(set)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteOptionSet(set.id)}
                          className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2">
                      {(set.values || []).length === 0 ? (
                        <p className="text-sm text-slate-400">No values yet.</p>
                      ) : (
                        <div className="grid gap-2">
                          {(set.values || []).map((value) => (
                            <div key={value.id} className="flex flex-wrap items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-slate-800">{value.label}</span>
                                <span className="text-xs font-mono text-slate-400">{value.value}</span>
                                <span className="text-xs text-slate-500">Order {value.sortOrder}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditOptionValue(set.id, value)}
                                  className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-500"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteOptionValue(value.id)}
                                  className="rounded-md border border-rose-200 px-2 py-1 text-[11px] font-bold text-rose-600"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'custom-fields' && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Custom Field</h2>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Module</span>
                <input
                  list="modules"
                  value={customFieldForm.module}
                  onChange={(event) => setCustomFieldForm((prev) => ({ ...prev, module: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  spellCheck={false}
                    disabled={!!editingCustomFieldId}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Entity</span>
                <input
                  list="entities"
                  value={customFieldForm.entity}
                  onChange={(event) => setCustomFieldForm((prev) => ({ ...prev, entity: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  spellCheck={false}
                    disabled={!!editingCustomFieldId}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Field Key</span>
                <input
                  value={customFieldForm.fieldKey}
                  onChange={(event) => setCustomFieldForm((prev) => ({ ...prev, fieldKey: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  spellCheck={false}
                  disabled={!!editingCustomFieldId}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Label</span>
                <input
                  value={customFieldForm.label}
                  onChange={(event) => setCustomFieldForm((prev) => ({ ...prev, label: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Data Type</span>
                <select
                  value={customFieldForm.dataType}
                  onChange={(event) => setCustomFieldForm((prev) => ({ ...prev, dataType: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  {DATA_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Help Text</span>
                <input
                  value={customFieldForm.helpText ?? ''}
                  onChange={(event) => setCustomFieldForm((prev) => ({ ...prev, helpText: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Default Value</span>
                <input
                  value={customFieldForm.defaultValue ?? ''}
                  onChange={(event) => setCustomFieldForm((prev) => ({ ...prev, defaultValue: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Options JSON</span>
                <textarea
                  value={customFieldForm.optionsJson ?? ''}
                  onChange={(event) => setCustomFieldForm((prev) => ({ ...prev, optionsJson: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
                  rows={3}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Sort Order</span>
                <input
                  type="number"
                  value={customFieldForm.sortOrder}
                  onChange={(event) => setCustomFieldForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <input
                    type="checkbox"
                    checked={!!customFieldForm.isRequired}
                    onChange={(event) => setCustomFieldForm((prev) => ({ ...prev, isRequired: event.target.checked }))}
                    className="h-4 w-4"
                  />
                  Required
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <input
                    type="checkbox"
                    checked={!!customFieldForm.isActive}
                    onChange={(event) => setCustomFieldForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                    className="h-4 w-4"
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={handleSaveCustomField}
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"
              >
                {editingCustomFieldId ? 'Update' : 'Create'}
              </button>
              <button
                onClick={resetCustomFieldForm}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs font-semibold text-slate-500">
                Module
                <input
                  list="modules"
                  value={customFieldModule}
                  onChange={(event) => setCustomFieldModule(event.target.value)}
                  className="mt-1 block w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-slate-500">
                Entity
                <input
                  list="entities"
                  value={customFieldEntity}
                  onChange={(event) => setCustomFieldEntity(event.target.value)}
                  className="mt-1 block w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <button
                onClick={loadCustomFields}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-600"
              >
                Load
              </button>
            </div>
            {customFieldsLoading ? (
              renderEmptyState('Loading custom fields...')
            ) : customFields.length === 0 ? (
              renderEmptyState('No custom fields found for the selected module and entity.')
            ) : (
              <div className="space-y-4">
                {customFields.map((field) => (
                  <div key={field.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{field.module} / {field.entity}</p>
                        <h3 className="text-lg font-bold text-slate-900">{field.label}</h3>
                        <p className="text-sm text-slate-500">{field.fieldKey} • {field.dataType}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCustomField(field)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCustomField(field.id)}
                          className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                      {field.helpText || 'No help text provided.'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'layouts' && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Layout Config</h2>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Module</span>
                <input
                  list="modules"
                  value={layoutForm.module}
                  onChange={(event) => setLayoutForm((prev) => ({ ...prev, module: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  spellCheck={false}
                    disabled={!!editingLayoutId}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Entity</span>
                <input
                  list="entities"
                  value={layoutForm.entity}
                  onChange={(event) => setLayoutForm((prev) => ({ ...prev, entity: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  spellCheck={false}
                    disabled={!!editingLayoutId}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Name</span>
                <input
                  value={layoutForm.name}
                  onChange={(event) => setLayoutForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Status</span>
                  <select
                    value={layoutForm.status || 'DRAFT'}
                    onChange={(event) => setLayoutForm((prev) => ({ ...prev, status: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    disabled={!!editingLayoutId}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Applies To Roles</span>
                  <input
                    value={layoutForm.appliesToRoles || ''}
                    onChange={(event) => setLayoutForm((prev) => ({ ...prev, appliesToRoles: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    placeholder="ADMIN, HR, MANAGER"
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <input
                  type="checkbox"
                  checked={useLayoutBuilder}
                  onChange={(event) => {
                    const next = event.target.checked
                    setUseLayoutBuilder(next)
                    if (next) {
                      syncBuilderFromJson(layoutForm.layoutJson)
                    }
                  }}
                  className="h-4 w-4"
                />
                Use layout builder
              </label>
              {useLayoutBuilder ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Layout Builder</h3>
                      <p className="text-[11px] text-slate-400">Arrange custom fields into sections.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={addLayoutSection}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-600"
                        type="button"
                      >
                        Add Section
                      </button>
                      <button
                        onClick={() => syncBuilderFromJson(layoutForm.layoutJson)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-600"
                        type="button"
                      >
                        Load JSON
                      </button>
                    </div>
                  </div>
                  {layoutBuilderSections.length === 0 ? (
                    <p className="mt-3 text-xs text-slate-400">No sections yet. Add a section to start.</p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {layoutBuilderSections.map((section) => (
                        <div key={section.id} className="rounded-lg border border-slate-200 bg-white p-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <input
                              value={section.title}
                              onChange={(event) => updateLayoutSection(section.id, { title: event.target.value })}
                              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs"
                              placeholder="Section title"
                            />
                            <select
                              value={section.columns}
                              onChange={(event) => updateLayoutSection(section.id, { columns: Number(event.target.value) })}
                              className="rounded-lg border border-slate-200 px-2 py-2 text-xs"
                            >
                              <option value={1}>1 column</option>
                              <option value={2}>2 columns</option>
                            </select>
                            <button
                              onClick={() => removeLayoutSection(section.id)}
                              className="rounded-lg border border-rose-200 px-2 py-2 text-[11px] font-bold text-rose-600"
                              type="button"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="mt-3 space-y-2">
                            {(section.fields || []).map((field) => (
                              <div key={field.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                                <div className="grid gap-2 md:grid-cols-[2fr_1fr_2fr_auto]">
                                  <select
                                    value={field.fieldKey}
                                    onChange={(event) => updateLayoutField(section.id, field.id, { fieldKey: event.target.value })}
                                    className="rounded-lg border border-slate-200 px-2 py-2 text-xs"
                                  >
                                    <option value="">Select field</option>
                                    {layoutFieldOptions.map((option) => (
                                      <option key={option.id} value={option.fieldKey}>
                                        {option.label} ({option.fieldKey})
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    value={field.span}
                                    onChange={(event) => updateLayoutField(section.id, field.id, { span: Number(event.target.value) })}
                                    className="rounded-lg border border-slate-200 px-2 py-2 text-xs"
                                  >
                                    <option value={1}>Span 1</option>
                                    <option value={2}>Span 2</option>
                                  </select>
                                  <input
                                    value={field.visibleRoles}
                                    onChange={(event) => updateLayoutField(section.id, field.id, { visibleRoles: event.target.value })}
                                    className="rounded-lg border border-slate-200 px-2 py-2 text-xs"
                                    placeholder="Visible roles (comma-separated)"
                                  />
                                  <button
                                    onClick={() => removeLayoutField(section.id, field.id)}
                                    className="rounded-lg border border-rose-200 px-2 py-2 text-[11px] font-bold text-rose-600"
                                    type="button"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <div className="mt-2 grid gap-2 md:grid-cols-[2fr_1fr_2fr]">
                                  <select
                                    value={field.conditionFieldKey}
                                    onChange={(event) => updateLayoutField(section.id, field.id, { conditionFieldKey: event.target.value })}
                                    className="rounded-lg border border-slate-200 px-2 py-2 text-xs"
                                  >
                                    <option value="">Show when field...</option>
                                    {layoutFieldOptions.map((option) => (
                                      <option key={option.id} value={option.fieldKey}>
                                        {option.label} ({option.fieldKey})
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    value={field.conditionOperator}
                                    onChange={(event) => updateLayoutField(section.id, field.id, { conditionOperator: event.target.value })}
                                    className="rounded-lg border border-slate-200 px-2 py-2 text-xs"
                                  >
                                    <option value="EQ">Equals</option>
                                    <option value="NEQ">Not equal</option>
                                    <option value="IN">In list</option>
                                    <option value="NOT_IN">Not in list</option>
                                    <option value="CONTAINS">Contains</option>
                                    <option value="NOT_CONTAINS">Not contains</option>
                                    <option value="EMPTY">Is empty</option>
                                    <option value="NOT_EMPTY">Is not empty</option>
                                  </select>
                                  <input
                                    value={field.conditionValue}
                                    onChange={(event) => updateLayoutField(section.id, field.id, { conditionValue: event.target.value })}
                                    className="rounded-lg border border-slate-200 px-2 py-2 text-xs"
                                    placeholder="Condition value"
                                    disabled={field.conditionOperator === 'EMPTY' || field.conditionOperator === 'NOT_EMPTY'}
                                  />
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={field.required}
                                      onChange={(event) => updateLayoutField(section.id, field.id, { required: event.target.checked })}
                                      className="h-3 w-3"
                                    />
                                    Required
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={field.readOnly}
                                      onChange={(event) => updateLayoutField(section.id, field.id, { readOnly: event.target.checked })}
                                      className="h-3 w-3"
                                    />
                                    Read-only
                                  </label>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => addLayoutField(section.id)}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600"
                              type="button"
                            >
                              Add Field
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Layout JSON</span>
                  <textarea
                    value={layoutForm.layoutJson}
                    onChange={(event) => setLayoutForm((prev) => ({ ...prev, layoutJson: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
                    rows={6}
                  />
                </label>
              )}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <input
                    type="checkbox"
                    checked={!!layoutForm.isDefault}
                    onChange={(event) => setLayoutForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
                    className="h-4 w-4"
                  />
                  Default
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <input
                    type="checkbox"
                    checked={!!layoutForm.isActive}
                    onChange={(event) => setLayoutForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                    className="h-4 w-4"
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={handleSaveLayout}
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"
              >
                {editingLayoutId ? 'Update' : 'Create'}
              </button>
              <button
                onClick={resetLayoutForm}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs font-semibold text-slate-500">
                Module
                <input
                  list="modules"
                  value={layoutModule}
                  onChange={(event) => setLayoutModule(event.target.value)}
                  className="mt-1 block w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-slate-500">
                Entity
                <input
                  list="entities"
                  value={layoutEntity}
                  onChange={(event) => setLayoutEntity(event.target.value)}
                  className="mt-1 block w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <button
                onClick={loadLayouts}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-600"
              >
                Load
              </button>
            </div>
            {layoutsLoading ? (
              renderEmptyState('Loading layouts...')
            ) : layouts.length === 0 ? (
              renderEmptyState('No layouts found for the selected module and entity.')
            ) : (
              <div className="space-y-4">
                {layouts.map((layout) => (
                  <div key={layout.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{layout.module} / {layout.entity}</p>
                        <h3 className="text-lg font-bold text-slate-900">{layout.name}</h3>
                        <p className="text-xs text-slate-500">
                          Status: {layout.status || 'DRAFT'} • Version: {layout.versionNumber ?? 1}
                        </p>
                        <p className="text-xs text-slate-500">Default: {layout.isDefault ? 'Yes' : 'No'}</p>
                        <p className="text-xs text-slate-500">Roles: {layout.appliesToRoles || 'All'}</p>
                      </div>
                      <div className="flex gap-2">
                        {layout.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handlePublishLayout(layout.id)}
                            className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-600"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => handleEditLayout(layout)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLayout(layout.id)}
                          className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-slate-900/90 p-3 text-xs text-slate-200">
                      {layout.layoutJson}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'workflows' && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Workflow</h2>
              <div className="mt-4 space-y-3 text-sm">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Module</span>
                  <input
                    list="modules"
                    value={workflowForm.module}
                    onChange={(event) => setWorkflowForm((prev) => ({ ...prev, module: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    disabled={!!editingWorkflowId}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Entity</span>
                  <input
                    list="entities"
                    value={workflowForm.entity}
                    onChange={(event) => setWorkflowForm((prev) => ({ ...prev, entity: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    disabled={!!editingWorkflowId}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Name</span>
                  <input
                    value={workflowForm.name}
                    onChange={(event) => setWorkflowForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Description</span>
                  <textarea
                    value={workflowForm.description ?? ''}
                    onChange={(event) => setWorkflowForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    rows={3}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Initial Status</span>
                  <input
                    value={workflowForm.initialStatus ?? ''}
                    onChange={(event) => setWorkflowForm((prev) => ({ ...prev, initialStatus: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    spellCheck={false}
                  />
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <input
                      type="checkbox"
                      checked={!!workflowForm.isDefault}
                      onChange={(event) => setWorkflowForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
                      className="h-4 w-4"
                    />
                    Default
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <input
                      type="checkbox"
                      checked={!!workflowForm.isActive}
                      onChange={(event) => setWorkflowForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                      className="h-4 w-4"
                    />
                    Active
                  </label>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={handleSaveWorkflow}
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"
                >
                  {editingWorkflowId ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={resetWorkflowForm}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Transition</h2>
              <div className="mt-4 space-y-3 text-sm">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Workflow</span>
                  <select
                    value={transitionWorkflowId}
                    onChange={(event) => setTransitionWorkflowId(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    disabled={!!editingTransitionId}
                  >
                    <option value="">Select workflow</option>
                    {workflows.map((workflow) => (
                      <option key={workflow.id} value={workflow.id}>{workflow.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">From Status</span>
                  <input
                    value={transitionForm.fromStatus}
                    onChange={(event) => setTransitionForm((prev) => ({ ...prev, fromStatus: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    spellCheck={false}
                    disabled={!!editingTransitionId}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">To Status</span>
                  <input
                    value={transitionForm.toStatus}
                    onChange={(event) => setTransitionForm((prev) => ({ ...prev, toStatus: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    spellCheck={false}
                    disabled={!!editingTransitionId}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Action Label</span>
                  <input
                    value={transitionForm.actionLabel ?? ''}
                    onChange={(event) => setTransitionForm((prev) => ({ ...prev, actionLabel: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500">Approver Role</span>
                    <input
                      value={transitionForm.approverRole ?? ''}
                      onChange={(event) => setTransitionForm((prev) => ({ ...prev, approverRole: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500">SLA Hours</span>
                    <input
                      type="number"
                      value={transitionForm.slaHours ?? ''}
                      onChange={(event) => setTransitionForm((prev) => ({ ...prev, slaHours: event.target.value ? Number(event.target.value) : undefined }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500">Escalation Role</span>
                    <input
                      value={transitionForm.escalationRole ?? ''}
                      onChange={(event) => setTransitionForm((prev) => ({ ...prev, escalationRole: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500">Escalation After (hours)</span>
                    <input
                      type="number"
                      value={transitionForm.escalationAfterHours ?? ''}
                      onChange={(event) =>
                        setTransitionForm((prev) => ({
                          ...prev,
                          escalationAfterHours: event.target.value ? Number(event.target.value) : undefined,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <input
                      type="checkbox"
                      checked={!!transitionForm.requiresApproval}
                      onChange={(event) => setTransitionForm((prev) => ({ ...prev, requiresApproval: event.target.checked }))}
                      className="h-4 w-4"
                    />
                    Requires Approval
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <input
                      type="checkbox"
                      checked={!!transitionForm.isActive}
                      onChange={(event) => setTransitionForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                      className="h-4 w-4"
                    />
                    Active
                  </label>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={handleSaveTransition}
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"
                >
                  {editingTransitionId ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={resetTransitionForm}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs font-semibold text-slate-500">
                Module
                <input
                  list="modules"
                  value={workflowModule}
                  onChange={(event) => setWorkflowModule(event.target.value)}
                  className="mt-1 block w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-slate-500">
                Entity
                <input
                  list="entities"
                  value={workflowEntity}
                  onChange={(event) => setWorkflowEntity(event.target.value)}
                  className="mt-1 block w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <button
                onClick={loadWorkflows}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-600"
              >
                Load
              </button>
            </div>

            {workflowsLoading ? (
              renderEmptyState('Loading workflows...')
            ) : workflows.length === 0 ? (
              renderEmptyState('No workflows found for the selected module and entity.')
            ) : (
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{workflow.module} / {workflow.entity}</p>
                        <h3 className="text-lg font-bold text-slate-900">{workflow.name}</h3>
                        <p className="text-sm text-slate-500">Initial: {workflow.initialStatus || 'N/A'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditWorkflow(workflow)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                          className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {(workflow.transitions || []).length === 0 ? (
                        <p className="text-sm text-slate-400">No transitions defined.</p>
                      ) : (
                        (workflow.transitions || []).map((transition) => (
                          <div key={transition.id} className="flex flex-wrap items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-slate-800">{transition.fromStatus}</span>
                              <span className="text-slate-400">?</span>
                              <span className="font-semibold text-slate-800">{transition.toStatus}</span>
                              {transition.actionLabel && (
                                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase text-slate-500">
                                  {transition.actionLabel}
                                </span>
                              )}
                              {transition.requiresApproval && (
                                <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase text-amber-700">
                                  Approval
                                </span>
                              )}
                              {transition.slaHours != null && (
                                <span className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-bold uppercase text-indigo-700">
                                  SLA {transition.slaHours}h
                                </span>
                              )}
                              {transition.escalationRole && (
                                <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold uppercase text-rose-700">
                                  Escalate {transition.escalationRole}
                                </span>
                              )}
                              {transition.escalationAfterHours != null && (
                                <span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold uppercase text-rose-700">
                                  +{transition.escalationAfterHours}h
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditTransition(workflow.id, transition)}
                                className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-500"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTransition(transition.id)}
                                className="rounded-md border border-rose-200 px-2 py-1 text-[11px] font-bold text-rose-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-semibold text-slate-500">
              Status
              <select
                value={approvalStatusFilter}
                onChange={(event) => setApprovalStatusFilter(event.target.value)}
                className="mt-1 block w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {APPROVAL_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            <button
              onClick={() => loadApprovals(approvalStatusFilter)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-600"
            >
              Refresh
            </button>
          </div>

          {approvalsLoading ? (
            renderEmptyState('Loading approvals...')
          ) : approvals.length === 0 ? (
            renderEmptyState('No approvals found for this status.')
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => (
                <div key={approval.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{approval.module} / {approval.entity}</p>
                      <h3 className="text-lg font-bold text-slate-900">{approval.fromStatus} ? {approval.toStatus}</h3>
                      <p className="text-sm text-slate-500">Entity ID: {approval.entityId}</p>
                    </div>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                      {approval.status}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-500">
                    <div>Requested by: {approval.requestedBy || 'System'}</div>
                    <div>Approver Role: {approval.approverRole || 'Unassigned'}</div>
                    <div>Escalation Role: {approval.escalationRole || 'None'}</div>
                    <div>
                      Escalation After:{' '}
                      {approval.escalationAfterHours != null ? `${approval.escalationAfterHours}h` : 'N/A'}
                    </div>
                    <div>Due: {approval.dueAt ? new Date(approval.dueAt).toLocaleString() : 'N/A'}</div>
                    <div>
                      SLA Breached:{' '}
                      {approval.slaBreachedAt ? new Date(approval.slaBreachedAt).toLocaleString() : 'No'}
                    </div>
                    <div>
                      Escalated:{' '}
                      {approval.escalatedAt ? new Date(approval.escalatedAt).toLocaleString() : 'No'}
                    </div>
                    <div>Escalation Level: {approval.escalationLevel ?? 0}</div>
                    <div>Resolved: {approval.resolvedAt ? new Date(approval.resolvedAt).toLocaleString() : 'Pending'}</div>
                    <div>Applied: {approval.appliedAt ? new Date(approval.appliedAt).toLocaleString() : 'No'}</div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <input
                      value={approvalNotes[approval.id] || ''}
                      onChange={(event) => setApprovalNotes((prev) => ({ ...prev, [approval.id]: event.target.value }))}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Optional notes"
                    />
                    <button
                      onClick={() => handleApprovalAction(approval.id, 'APPROVED')}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"
                      disabled={approval.status !== 'PENDING'}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApprovalAction(approval.id, 'REJECTED')}
                      className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"
                      disabled={approval.status !== 'PENDING'}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'webhooks' && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Webhook</h2>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Module</span>
                <input
                  list="modules"
                  value={webhookForm.module}
                  onChange={(event) => setWebhookForm((prev) => ({ ...prev, module: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  spellCheck={false}
                    disabled={!!editingWebhookId}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Entity</span>
                <input
                  list="entities"
                  value={webhookForm.entity}
                  onChange={(event) => setWebhookForm((prev) => ({ ...prev, entity: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  spellCheck={false}
                    disabled={!!editingWebhookId}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Event Type</span>
                <input
                  value={webhookForm.eventType}
                  onChange={(event) => setWebhookForm((prev) => ({ ...prev, eventType: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  spellCheck={false}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Target URL</span>
                <input
                  value={webhookForm.targetUrl}
                  onChange={(event) => setWebhookForm((prev) => ({ ...prev, targetUrl: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  spellCheck={false}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Secret</span>
                <input
                  value={webhookForm.secret ?? ''}
                  onChange={(event) => setWebhookForm((prev) => ({ ...prev, secret: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Headers JSON</span>
                <textarea
                  value={webhookForm.headersJson ?? ''}
                  onChange={(event) => setWebhookForm((prev) => ({ ...prev, headersJson: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
                  rows={3}
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <input
                  type="checkbox"
                  checked={!!webhookForm.isActive}
                  onChange={(event) => setWebhookForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                  className="h-4 w-4"
                />
                Active
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={handleSaveWebhook}
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"
              >
                {editingWebhookId ? 'Update' : 'Create'}
              </button>
              <button
                onClick={resetWebhookForm}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {webhooksLoading ? (
              renderEmptyState('Loading webhooks...')
            ) : webhooks.length === 0 ? (
              renderEmptyState('No webhooks configured yet.')
            ) : (
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{webhook.module} / {webhook.entity}</p>
                        <h3 className="text-lg font-bold text-slate-900">{webhook.eventType}</h3>
                        <p className="text-sm text-slate-500 break-all">{webhook.targetUrl}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditWebhook(webhook)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteWebhook(webhook.id)}
                          className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                      Active: {webhook.isActive ? 'Yes' : 'No'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <datalist id="modules">
        {MODULE_OPTIONS.map((module) => (
          <option key={module} value={module} />
        ))}
      </datalist>
      <datalist id="entities">
        {ENTITY_OPTIONS.map((entity) => (
          <option key={entity} value={entity} />
        ))}
      </datalist>
    </div>
  )
}

export default ConfigStudioPage

