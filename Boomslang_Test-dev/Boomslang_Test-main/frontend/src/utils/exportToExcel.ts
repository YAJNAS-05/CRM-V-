import * as XLSX from 'xlsx'

type ExportValue = string | number | boolean | null | undefined | Date

type ExportRow = Record<string, ExportValue>

interface ExportOptions {
  fileName: string
  sheetName?: string
}

const normalizeValue = (value: ExportValue): string | number | boolean => {
  if (value === null || value === undefined) {
    return ''
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return value
}

export const exportToExcel = (rows: ExportRow[], options: ExportOptions): void => {
  if (!rows.length) {
    throw new Error('No data available to export')
  }

  const normalizedRows = rows.map((row) => {
    const normalized: Record<string, string | number | boolean> = {}
    Object.entries(row).forEach(([key, value]) => {
      normalized[key] = normalizeValue(value)
    })
    return normalized
  })

  const worksheet = XLSX.utils.json_to_sheet(normalizedRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Data')
  XLSX.writeFile(workbook, options.fileName)
}

export const getExportDateStamp = (): string => new Date().toISOString().slice(0, 10)
