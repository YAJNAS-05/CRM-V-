import api from './axiosInstance'
import { ApiResponse } from '../types'
import {
  CustomFieldDefinition,
  CustomFieldValue,
  LayoutConfig,
  OptionSet,
  UpsertCustomFieldValuesRequest,
} from '../types/config'

export const configPublicApi = {
  getOptionSet: (module: string, entity: string, field: string, includeInactiveValues = false) =>
    api.get<ApiResponse<OptionSet>>(
      `/v1/config/option-sets?module=${encodeURIComponent(module)}&entity=${encodeURIComponent(entity)}&field=${encodeURIComponent(field)}&includeInactiveValues=${includeInactiveValues}`
    ),

  listOptionSets: (module?: string) =>
    api.get<ApiResponse<OptionSet[]>>(
      `/v1/config/option-sets${module ? `?module=${encodeURIComponent(module)}` : ''}`
    ),

  listCustomFields: (module: string, entity: string, includeInactive = false, config?: { signal?: AbortSignal }) =>
    api.get<ApiResponse<CustomFieldDefinition[]>>(
      `/v1/config/custom-fields?module=${encodeURIComponent(module)}&entity=${encodeURIComponent(entity)}&includeInactive=${includeInactive}`,
      config
    ),

  getCustomFieldValues: (module: string, entity: string, entityId: string) =>
    api.get<ApiResponse<CustomFieldValue[]>>(
      `/v1/config/custom-fields/values?module=${encodeURIComponent(module)}&entity=${encodeURIComponent(entity)}&entityId=${encodeURIComponent(entityId)}`
    ),

  upsertCustomFieldValues: (payload: UpsertCustomFieldValuesRequest) =>
    api.post<ApiResponse<CustomFieldValue[]>>('/v1/config/custom-fields/values', payload),

  getActiveLayout: (module: string, entity: string) =>
    api.get<ApiResponse<LayoutConfig>>(
      `/v1/config/layouts/active?module=${encodeURIComponent(module)}&entity=${encodeURIComponent(entity)}`
    ),
}
