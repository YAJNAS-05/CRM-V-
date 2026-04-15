import axiosInstance from './axiosInstance'

export const erpMappingApi = {
  // Get mappings between two modules
  getMappingsByModules: async (sourceModule: string, targetModule: string) => {
    const response = await axiosInstance.get(
      `/api/v1/erp/mappings/source/${sourceModule}/target/${targetModule}`
    )
    return response.data
  },

  // Get all mappings for a source module
  getMappingsBySourceModule: async (sourceModule: string) => {
    const response = await axiosInstance.get(
      `/api/v1/erp/mappings/source/${sourceModule}`
    )
    return response.data
  },

  // Get required mappings for a module
  getRequiredMappings: async (sourceModule: string) => {
    const response = await axiosInstance.get(
      `/api/v1/erp/mappings/source/${sourceModule}/required`
    )
    return response.data
  },

  // Get target modules available for a source module
  getTargetModules: async (sourceModule: string) => {
    const response = await axiosInstance.get(
      `/api/v1/erp/mappings/source/${sourceModule}/targets`
    )
    return response.data
  },

  // Get lookup values for a mapped field
  getLookupValues: async (sourceModule: string, targetModule: string, sourceField: string) => {
    const response = await axiosInstance.get(
      `/api/v1/erp/mappings/${sourceModule}/${targetModule}/${sourceField}/lookups`
    )
    return response.data
  },

  // Validate required mappings
  validateMappings: async (
    sourceModule: string,
    targetModule: string,
    fieldValues: Record<string, string>
  ) => {
    const response = await axiosInstance.post('/api/v1/erp/mappings/validate', fieldValues, {
      params: {
        sourceModule,
        targetModule,
      },
    })
    return response.data
  },

  // Get all mappings with pagination
  getAllMappings: async (page = 0, size = 20) => {
    const response = await axiosInstance.get('/api/v1/erp/mappings', {
      params: { page, size },
    })
    return response.data
  },

  // Create a new mapping
  createMapping: async (data: {
    sourceModule: string
    targetModule: string
    sourceField: string
    targetField: string
    isRequired?: boolean
    isAutoPopulated?: boolean
    mappingType?: string
    lookupValues?: string
    description?: string
  }) => {
    const response = await axiosInstance.post('/api/v1/erp/mappings', data)
    return response.data
  },

  // Update a mapping
  updateMapping: async (
    mappingId: string,
    data: {
      sourceField: string
      targetField: string
      isRequired?: boolean
      isAutoPopulated?: boolean
      mappingType?: string
      lookupValues?: string
      description?: string
    }
  ) => {
    const response = await axiosInstance.put(`/api/v1/erp/mappings/${mappingId}`, data)
    return response.data
  },

  // Deactivate a mapping
  deactivateMapping: async (mappingId: string) => {
    const response = await axiosInstance.put(`/api/v1/erp/mappings/${mappingId}/deactivate`)
    return response.data
  },

  // Delete a mapping
  deleteMapping: async (mappingId: string) => {
    const response = await axiosInstance.delete(`/api/v1/erp/mappings/${mappingId}`)
    return response.data
  },
}
