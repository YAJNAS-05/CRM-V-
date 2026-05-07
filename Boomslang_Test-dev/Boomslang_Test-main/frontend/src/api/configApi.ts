import api from './axiosInstance'
import {
  CreateCustomFieldDefinitionRequest,
  CreateLayoutConfigRequest,
  CreateOptionSetRequest,
  CreateOptionValueRequest,
  CreateWebhookSubscriptionRequest,
  CreateWorkflowDefinitionRequest,
  CreateWorkflowTransitionRequest,
  UpdateCustomFieldDefinitionRequest,
  UpdateLayoutConfigRequest,
  UpdateOptionSetRequest,
  UpdateOptionValueRequest,
  UpdateWebhookSubscriptionRequest,
  UpdateWorkflowDefinitionRequest,
  UpdateWorkflowTransitionRequest,
  WorkflowApprovalActionRequest,
} from '../types/config'

export const configApi = {
  listOptionSets: (module?: string) =>
    api.get(`/v1/admin/config/option-sets${module ? `?module=${encodeURIComponent(module)}` : ''}`),

  createOptionSet: (payload: CreateOptionSetRequest) =>
    api.post('/v1/admin/config/option-sets', payload),

  updateOptionSet: (optionSetId: string, payload: UpdateOptionSetRequest) =>
    api.put(`/v1/admin/config/option-sets/${optionSetId}`, payload),

  deleteOptionSet: (optionSetId: string) =>
    api.delete(`/v1/admin/config/option-sets/${optionSetId}`),

  addOptionValue: (optionSetId: string, payload: CreateOptionValueRequest) =>
    api.post(`/v1/admin/config/option-sets/${optionSetId}/values`, payload),

  updateOptionValue: (optionValueId: string, payload: UpdateOptionValueRequest) =>
    api.put(`/v1/admin/config/option-values/${optionValueId}`, payload),

  deleteOptionValue: (optionValueId: string) =>
    api.delete(`/v1/admin/config/option-values/${optionValueId}`),

  listCustomFields: (module: string, entity: string, includeInactive = true) =>
    api.get(
      `/v1/admin/config/custom-fields?module=${encodeURIComponent(module)}&entity=${encodeURIComponent(entity)}&includeInactive=${includeInactive}`
    ),

  createCustomField: (payload: CreateCustomFieldDefinitionRequest) =>
    api.post('/v1/admin/config/custom-fields', payload),

  updateCustomField: (definitionId: string, payload: UpdateCustomFieldDefinitionRequest) =>
    api.put(`/v1/admin/config/custom-fields/${definitionId}`, payload),

  deleteCustomField: (definitionId: string) =>
    api.delete(`/v1/admin/config/custom-fields/${definitionId}`),

  listLayouts: (module: string, entity: string) =>
    api.get(`/v1/admin/config/layouts?module=${encodeURIComponent(module)}&entity=${encodeURIComponent(entity)}`),

  createLayout: (payload: CreateLayoutConfigRequest) =>
    api.post('/v1/admin/config/layouts', payload),

  updateLayout: (layoutId: string, payload: UpdateLayoutConfigRequest) =>
    api.put(`/v1/admin/config/layouts/${layoutId}`, payload),

  deleteLayout: (layoutId: string) =>
    api.delete(`/v1/admin/config/layouts/${layoutId}`),

  publishLayout: (layoutId: string) =>
    api.post(`/v1/admin/config/layouts/${layoutId}/publish`),

  listWorkflows: (module: string, entity: string) =>
    api.get(`/v1/admin/config/workflows?module=${encodeURIComponent(module)}&entity=${encodeURIComponent(entity)}`),

  createWorkflow: (payload: CreateWorkflowDefinitionRequest) =>
    api.post('/v1/admin/config/workflows', payload),

  updateWorkflow: (workflowId: string, payload: UpdateWorkflowDefinitionRequest) =>
    api.put(`/v1/admin/config/workflows/${workflowId}`, payload),

  deleteWorkflow: (workflowId: string) =>
    api.delete(`/v1/admin/config/workflows/${workflowId}`),

  addTransition: (workflowId: string, payload: CreateWorkflowTransitionRequest) =>
    api.post(`/v1/admin/config/workflows/${workflowId}/transitions`, payload),

  updateTransition: (transitionId: string, payload: UpdateWorkflowTransitionRequest) =>
    api.put(`/v1/admin/config/workflow-transitions/${transitionId}`, payload),

  deleteTransition: (transitionId: string) =>
    api.delete(`/v1/admin/config/workflow-transitions/${transitionId}`),

  listApprovals: (status?: string) =>
    api.get(`/v1/admin/config/approvals${status ? `?status=${encodeURIComponent(status)}` : ''}`),

  actionApproval: (approvalId: string, payload: WorkflowApprovalActionRequest) =>
    api.post(`/v1/admin/config/approvals/${approvalId}/action`, payload),

  listWebhooks: () =>
    api.get('/v1/admin/config/webhooks'),

  createWebhook: (payload: CreateWebhookSubscriptionRequest) =>
    api.post('/v1/admin/config/webhooks', payload),

  updateWebhook: (subscriptionId: string, payload: UpdateWebhookSubscriptionRequest) =>
    api.put(`/v1/admin/config/webhooks/${subscriptionId}`, payload),

  deleteWebhook: (subscriptionId: string) =>
    api.delete(`/v1/admin/config/webhooks/${subscriptionId}`),
}
