import React from 'react'
import { CustomFieldDefinition, LayoutFieldCondition, LayoutFieldConfig, LayoutSchema } from '../../types/config'
import { useAuthStore } from '../../store/authStore'
import { formatOptionLabel } from '../../utils/optionSet'

type CustomFieldsPanelProps = {
  title?: string
  definitions: CustomFieldDefinition[]
  values: Record<string, string>
  onChange: (fieldKey: string, value: string) => void
  isLoading?: boolean
  layout?: LayoutSchema | null
  standardValues?: Record<string, string | number | boolean | null | undefined>
}

const parseOptions = (optionsJson?: string | null) => {
  if (!optionsJson) return [] as Array<{ value: string; label: string }>
  try {
    const parsed = JSON.parse(optionsJson)
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === 'string') {
            return { value: item, label: formatOptionLabel(item) }
          }
          if (item && typeof item === 'object') {
            const value = String(item.value ?? item.id ?? '')
            if (!value) return null
            return { value, label: String(item.label ?? value) }
          }
          return null
        })
        .filter(Boolean) as Array<{ value: string; label: string }>
    }
  } catch {
    return optionsJson
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((value) => ({ value, label: formatOptionLabel(value) }))
  }
  return [] as Array<{ value: string; label: string }>
}

const parseMultiValue = (value?: string) => {
  if (!value) return [] as string[]
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
}

const CustomFieldsPanel: React.FC<CustomFieldsPanelProps> = ({
  title = 'Custom Fields',
  definitions,
  values,
  onChange,
  isLoading,
  layout,
  standardValues,
}) => {
  const userRoles = useAuthStore((state) => state.user?.roles || [])

  const normalizedUserRoles = new Set(
    userRoles.map((role) => role.trim().toUpperCase()).filter(Boolean)
  )

  const canViewField = (visibleRoles?: string[] | null) => {
    if (!visibleRoles || visibleRoles.length === 0) return true
    return visibleRoles.some((role) => normalizedUserRoles.has(role.trim().toUpperCase()))
  }

  const resolveRawValue = (fieldKey: string) => {
    if (values[fieldKey] !== undefined) return values[fieldKey]
    if (standardValues && fieldKey in standardValues) return standardValues[fieldKey]
    return ''
  }

  const parseConditionList = (value: unknown) => {
    if (value === null || value === undefined) return [] as string[]
    if (Array.isArray(value)) return value.map((item) => String(item))
    const stringValue = String(value)
    try {
      const parsed = JSON.parse(stringValue)
      if (Array.isArray(parsed)) return parsed.map((item) => String(item))
    } catch {
      // fallthrough
    }
    return stringValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const isConditionMet = (condition?: LayoutFieldCondition | null) => {
    if (!condition) return true
    const rawValue = resolveRawValue(condition.fieldKey)
    const valueString = rawValue === null || rawValue === undefined ? '' : String(rawValue)
    const conditionValue = condition.value ?? ''

    switch (condition.operator) {
      case 'EQ':
        return valueString === conditionValue
      case 'NEQ':
        return valueString !== conditionValue
      case 'IN': {
        const list = parseConditionList(rawValue)
        return list.includes(conditionValue)
      }
      case 'NOT_IN': {
        const list = parseConditionList(rawValue)
        return !list.includes(conditionValue)
      }
      case 'CONTAINS':
        return valueString.includes(conditionValue)
      case 'NOT_CONTAINS':
        return !valueString.includes(conditionValue)
      case 'EMPTY':
        return valueString.trim() === ''
      case 'NOT_EMPTY':
        return valueString.trim() !== ''
      default:
        return true
    }
  }

  const shouldRenderField = (field: LayoutFieldConfig) =>
    canViewField(field.visibleRoles) && isConditionMet(field.visibleWhen)

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">Loading custom fields...</p>
      </div>
    )
  }

  if (definitions.length === 0) {
    return null
  }

  const definitionMap = new Map(definitions.map((definition) => [definition.fieldKey, definition]))

  const renderField = (
    definition: CustomFieldDefinition,
    span = 1,
    fieldConfig?: LayoutFieldConfig,
  ) => {
    const value = values[definition.fieldKey] ?? ''
    const dataType = definition.dataType?.toUpperCase() || 'TEXT'
    const options = parseOptions(definition.optionsJson)
    const readOnly = Boolean(fieldConfig?.readOnly)
    const required = Boolean(fieldConfig?.required)

    const wrapperClass = span > 1 ? 'md:col-span-2' : ''

    if (dataType === 'BOOLEAN') {
      return (
        <label key={definition.id} className={`flex items-center gap-2 text-sm text-gray-700 ${wrapperClass}`}>
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={(event) => onChange(definition.fieldKey, event.target.checked ? 'true' : 'false')}
            className="h-4 w-4"
            disabled={readOnly}
          />
          {definition.label}
        </label>
      )
    }

    if (dataType === 'PICKLIST' && options.length > 0) {
      return (
        <label key={definition.id} className={`block text-sm text-gray-700 ${wrapperClass}`}>
          <span className="block text-xs font-medium text-gray-500 mb-1">{definition.label}</span>
          <select
            value={value}
            onChange={(event) => onChange(definition.fieldKey, event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            disabled={readOnly}
            required={required}
          >
            <option value="">Select...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {definition.helpText && <p className="mt-1 text-xs text-gray-400">{definition.helpText}</p>}
        </label>
      )
    }

    if (dataType === 'MULTISELECT' && options.length > 0) {
      const selected = parseMultiValue(value)
      return (
        <label key={definition.id} className={`block text-sm text-gray-700 ${wrapperClass}`}>
          <span className="block text-xs font-medium text-gray-500 mb-1">{definition.label}</span>
          <select
            multiple
            value={selected}
            onChange={(event) => {
              const next = Array.from(event.target.selectedOptions).map((option) => option.value)
              onChange(definition.fieldKey, next.length > 0 ? JSON.stringify(next) : '')
            }}
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            disabled={readOnly}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {definition.helpText && <p className="mt-1 text-xs text-gray-400">{definition.helpText}</p>}
        </label>
      )
    }

    if (dataType === 'JSON') {
      return (
        <label key={definition.id} className={`block text-sm text-gray-700 md:col-span-2 ${wrapperClass}`}>
          <span className="block text-xs font-medium text-gray-500 mb-1">{definition.label}</span>
          <textarea
            value={value}
            onChange={(event) => onChange(definition.fieldKey, event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs"
            readOnly={readOnly}
            required={required}
          />
          {definition.helpText && <p className="mt-1 text-xs text-gray-400">{definition.helpText}</p>}
        </label>
      )
    }

    const inputType = dataType === 'NUMBER' ? 'number' : dataType === 'DATE' ? 'date' : 'text'

    return (
      <label key={definition.id} className={`block text-sm text-gray-700 ${wrapperClass}`}>
        <span className="block text-xs font-medium text-gray-500 mb-1">{definition.label}</span>
        <input
          type={inputType}
          value={value}
          onChange={(event) => onChange(definition.fieldKey, event.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2"
          readOnly={readOnly}
          required={required}
        />
        {definition.helpText && <p className="mt-1 text-xs text-gray-400">{definition.helpText}</p>}
      </label>
    )
  }

  if (layout && Array.isArray(layout.sections) && layout.sections.length > 0) {
    const usedKeys = new Set<string>()

    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="mt-4 space-y-6">
          {layout.sections.map((section) => {
            const columns = section.columns === 1 ? 1 : 2
            return (
              <div key={section.id} className="space-y-3">
                {section.title && (
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    {section.title}
                  </h4>
                )}
                <div className={`grid gap-4 ${columns === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {section.fields.map((field) => {
                    const definition = definitionMap.get(field.fieldKey)
                    if (!definition || !shouldRenderField(field)) {
                      return null
                    }
                    usedKeys.add(definition.fieldKey)
                    return renderField(definition, field.span ?? 1, field)
                  })}
                </div>
              </div>
            )
          })}

          {!layout.hideUnassigned && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Other Fields</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {definitions
                  .filter((definition) => !usedKeys.has(definition.fieldKey))
                  .map((definition) => renderField(definition))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {definitions.map((definition) => renderField(definition))}
      </div>
    </div>
  )
}

export default CustomFieldsPanel
