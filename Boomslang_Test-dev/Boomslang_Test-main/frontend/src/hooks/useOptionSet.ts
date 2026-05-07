import { useCallback, useEffect, useMemo, useState } from 'react'
import { configPublicApi } from '../api/configPublicApi'
import { OptionValue } from '../types/config'
import { buildFallbackOptions, sortOptionValues } from '../utils/optionSet'

type UseOptionSetParams = {
  module: string
  entity: string
  field: string
  fallbackValues?: string[]
  includeInactiveValues?: boolean
}

export const useOptionSet = ({
  module,
  entity,
  field,
  fallbackValues = [],
  includeInactiveValues = false,
}: UseOptionSetParams) => {
  const fallbackOptions = useMemo(() => buildFallbackOptions(fallbackValues), [fallbackValues])
  const [options, setOptions] = useState<OptionValue[]>(fallbackOptions)
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    if (!module || !entity || !field) {
      setOptions(fallbackOptions)
      return
    }

    setIsLoading(true)
    try {
      const response = await configPublicApi.getOptionSet(module, entity, field, includeInactiveValues)
      const data = response.data.data
      const values = data?.values || []
      if (values.length > 0) {
        setOptions(sortOptionValues(values))
      } else {
        setOptions(fallbackOptions)
      }
    } catch {
      setOptions(fallbackOptions)
    } finally {
      setIsLoading(false)
    }
  }, [module, entity, field, includeInactiveValues, fallbackOptions])

  useEffect(() => {
    load()
  }, [load])

  return { options, isLoading, refresh: load }
}
