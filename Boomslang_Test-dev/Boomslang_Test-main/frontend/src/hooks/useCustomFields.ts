import { useCallback, useEffect, useMemo, useState } from 'react'
import { configPublicApi } from '../api/configPublicApi'
import {
  CustomFieldDefinition,
  UpsertCustomFieldValuesRequest,
} from '../types/config'
import { useAbortController } from './useAbortController'

const normalizeValue = (value?: string | null) => {
  if (value === undefined || value === null) return ''
  return value
}

const applyDefaults = (
  definitions: CustomFieldDefinition[],
  currentValues: Record<string, string>,
) => {
  const next = { ...currentValues }
  definitions.forEach((definition) => {
    if (next[definition.fieldKey] === undefined) {
      next[definition.fieldKey] = normalizeValue(definition.defaultValue)
    }
  })
  return next
}

type UseCustomFieldsParams = {
  module: string
  entity: string
  entityId?: string
}

export const useCustomFields = ({ module, entity, entityId }: UseCustomFieldsParams) => {
  const [definitions, setDefinitions] = useState<CustomFieldDefinition[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { signal } = useAbortController()

  const sortedDefinitions = useMemo(
    () => [...definitions].sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)),
    [definitions],
  )

  const loadDefinitions = useCallback(async () => {
    if (!module || !entity) return
    setIsLoading(true)
    try {
      const response = await configPublicApi.listCustomFields(module, entity, true, { signal })
      const data = response.data.data || []
      setDefinitions(data)
      setValues((current) => applyDefaults(data, current))
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return
      setDefinitions([])
    } finally {
      setIsLoading(false)
    }
  }, [module, entity, signal])

  const loadValues = useCallback(async (resolvedEntityId: string) => {
    if (!module || !entity || !resolvedEntityId) return
    try {
      const response = await configPublicApi.getCustomFieldValues(module, entity, resolvedEntityId)
      const incoming = response.data.data || []
      const mappedValues = incoming.reduce<Record<string, string>>((acc, item) => {
        acc[item.fieldKey] = normalizeValue(item.value)
        return acc
      }, {})
      setValues((current) => applyDefaults(definitions, { ...current, ...mappedValues }))
    } catch {
      setValues((current) => applyDefaults(definitions, current))
    }
  }, [module, entity, definitions])

  useEffect(() => {
    void loadDefinitions()
  }, [loadDefinitions])

  useEffect(() => {
    if (!entityId) return
    void loadValues(entityId)
  }, [entityId, loadValues])

  const setValue = useCallback((fieldKey: string, value: string) => {
    setValues((current) => ({ ...current, [fieldKey]: value }))
  }, [])

  const buildPayload = useCallback((resolvedEntityId: string): UpsertCustomFieldValuesRequest => {
    return {
      module,
      entity,
      entityId: resolvedEntityId,
      values: sortedDefinitions.map((definition) => ({
        fieldKey: definition.fieldKey,
        value: values[definition.fieldKey] === '' ? null : values[definition.fieldKey],
      })),
    }
  }, [module, entity, sortedDefinitions, values])

  const save = useCallback(async (resolvedEntityId?: string) => {
    const targetId = resolvedEntityId || entityId
    if (!targetId || sortedDefinitions.length === 0) return null

    setIsSaving(true)
    try {
      const payload = buildPayload(targetId)
      const response = await configPublicApi.upsertCustomFieldValues(payload)
      return response.data.data
    } finally {
      setIsSaving(false)
    }
  }, [entityId, sortedDefinitions, buildPayload])

  return {
    definitions: sortedDefinitions,
    values,
    setValue,
    isLoading,
    isSaving,
    reload: loadDefinitions,
    save,
  }
}
