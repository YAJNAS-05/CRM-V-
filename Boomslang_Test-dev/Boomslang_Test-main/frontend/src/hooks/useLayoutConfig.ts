import { useCallback, useEffect, useMemo, useState } from 'react'
import { configPublicApi } from '../api/configPublicApi'
import { LayoutConfig, LayoutSchema } from '../types/config'

const parseLayoutSchema = (layoutJson?: string | null): LayoutSchema | null => {
  if (!layoutJson) return null
  try {
    const parsed = JSON.parse(layoutJson)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.sections)) {
      return parsed as LayoutSchema
    }
  } catch {
    return null
  }
  return null
}

type UseLayoutConfigParams = {
  module: string
  entity: string
}

export const useLayoutConfig = ({ module, entity }: UseLayoutConfigParams) => {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadLayout = useCallback(async () => {
    if (!module || !entity) return
    setIsLoading(true)
    try {
      const response = await configPublicApi.getActiveLayout(module, entity)
      setLayoutConfig(response.data.data || null)
    } catch {
      setLayoutConfig(null)
    } finally {
      setIsLoading(false)
    }
  }, [module, entity])

  useEffect(() => {
    void loadLayout()
  }, [loadLayout])

  const layout = useMemo(() => parseLayoutSchema(layoutConfig?.layoutJson), [layoutConfig?.layoutJson])

  return {
    layoutConfig,
    layout,
    isLoading,
    reload: loadLayout,
  }
}
