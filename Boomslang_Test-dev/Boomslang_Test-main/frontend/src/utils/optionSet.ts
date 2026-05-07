import { OptionValue } from '../types/config'

export const formatOptionLabel = (value: string) => value.replace(/_/g, ' ')

export const buildFallbackOptions = (values: string[]): OptionValue[] =>
  values.map((value, index) => ({
    id: value,
    value,
    label: formatOptionLabel(value),
    sortOrder: index + 1,
  }))

export const sortOptionValues = (values: OptionValue[]) =>
  [...values].sort((left, right) => {
    const leftOrder = left.sortOrder ?? 0
    const rightOrder = right.sortOrder ?? 0
    if (leftOrder !== rightOrder) return leftOrder - rightOrder
    const leftLabel = left.label || left.value
    const rightLabel = right.label || right.value
    return leftLabel.localeCompare(rightLabel)
  })

export const getOptionLabel = (options: OptionValue[], value?: string | null) => {
  if (!value) return ''
  const match = options.find((option) => option.value === value)
  return match?.label || formatOptionLabel(value)
}

export const getOptionColor = (options: OptionValue[], value?: string | null) => {
  if (!value) return null
  const match = options.find((option) => option.value === value)
  return match?.colorCode ?? null
}
