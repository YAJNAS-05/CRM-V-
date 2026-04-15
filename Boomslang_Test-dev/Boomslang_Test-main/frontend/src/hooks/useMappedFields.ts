import { useEffect, useState } from 'react'
import { erpMappingApi } from '../api/erpMappingApi'
import toast from 'react-hot-toast'

interface MappedField {
  sourceField: string
  targetField: string
  mappingType: string
  isRequired: boolean
  isAutoPopulated: boolean
  lookupValues: string[]
}

interface UseMappedFieldsReturn {
  mappedFields: MappedField[]
  lookupOptions: { [key: string]: string[] }
  requiredFields: string[]
  loading: boolean
  validateMappings: (fieldValues: Record<string, string>) => Promise<{ isValid: boolean; message: string }>
  isMappedField: (sourceField: string) => boolean
  getMappedFieldLookups: (sourceField: string) => string[]
}

/**
 * Hook for managing ERP field mappings in forms
 * Provides dropdown options, validation, and auto-population support
 */
export const useMappedFields = (
  sourceModule: string,
  targetModule: string = ''
): UseMappedFieldsReturn => {
  const [mappedFields, setMappedFields] = useState<MappedField[]>([])
  const [lookupOptions, setLookupOptions] = useState<{ [key: string]: string[] }>({})
  const [requiredFields, setRequiredFields] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadMappings = async () => {
      if (!sourceModule) return

      setLoading(true)
      try {
        // If targetModule is provided, get specific mappings
        const mappingUrl = targetModule
          ? `/source/${sourceModule}/target/${targetModule}`
          : `/source/${sourceModule}/required`

        const response = await erpMappingApi.getMappingsBySourceModule(sourceModule)
        if (response.success && response.data) {
          const fields: MappedField[] = response.data.map((m: any) => ({
            sourceField: m.sourceField,
            targetField: m.targetField,
            mappingType: m.mappingType,
            isRequired: m.isRequired,
            isAutoPopulated: m.isAutoPopulated,
            lookupValues: m.lookupValues ? JSON.parse(m.lookupValues) : [],
          }))

          setMappedFields(fields)

          // Collect lookup values for dropdown fields
          const lookups: { [key: string]: string[] } = {}
          const required: string[] = []

          fields.forEach((field) => {
            if (field.lookupValues && field.lookupValues.length > 0) {
              lookups[field.sourceField] = field.lookupValues
            }
            if (field.isRequired) {
              required.push(field.sourceField)
            }
          })

          setLookupOptions(lookups)
          setRequiredFields(required)
        }
      } catch (error) {
        console.error('Error loading field mappings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMappings()
  }, [sourceModule, targetModule])

  const validateMappings = async (
    fieldValues: Record<string, string>
  ): Promise<{ isValid: boolean; message: string }> => {
    try {
      const response = await erpMappingApi.validateMappings(sourceModule, targetModule, fieldValues)
      if (response.success) {
        return {
          isValid: response.data.isValid,
          message: response.data.message,
        }
      }
      return {
        isValid: false,
        message: response.message || 'Validation failed',
      }
    } catch (error) {
      console.error('Error validating mappings:', error)
      return {
        isValid: false,
        message: 'Error validating mappings. Please check required fields.',
      }
    }
  }

  const isMappedField = (sourceField: string): boolean => {
    return mappedFields.some((f) => f.sourceField === sourceField)
  }

  const getMappedFieldLookups = (sourceField: string): string[] => {
    return lookupOptions[sourceField] || []
  }

  return {
    mappedFields,
    lookupOptions,
    requiredFields,
    loading,
    validateMappings,
    isMappedField,
    getMappedFieldLookups,
  }
}
