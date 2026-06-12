export type FieldCompletionStatus = 'PENDING' | 'COMPLETED'

export function isValueFilled(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false
  }
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  if (typeof value === 'number') {
    return !Number.isNaN(value)
  }
  if (typeof value === 'boolean') {
    return true
  }
  return true
}

export function deriveCompletionStatus(
  values: object,
  requiredFields: string[],
): FieldCompletionStatus {
  const record = values as Record<string, unknown>
  if (requiredFields.length === 0) {
    return 'COMPLETED'
  }
  const allFilled = requiredFields.every((field) => isValueFilled(record[field]))
  return allFilled ? 'COMPLETED' : 'PENDING'
}

export function countFilledFields(
  values: Record<string, unknown>,
  fields: string[],
): { filled: number; total: number } {
  const filled = fields.filter((field) => isValueFilled(values[field])).length
  return { filled, total: fields.length }
}
