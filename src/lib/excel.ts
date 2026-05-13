import * as XLSX from 'xlsx'

export function downloadExcel(rows: (string | number)[][], filename: string, sheetName = 'Dados') {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Auto column width
  const colWidths = rows[0]?.map((_, ci) =>
    Math.min(60, Math.max(10, ...rows.map(r => String(r[ci] ?? '').length)))
  ) ?? []
  ws['!cols'] = colWidths.map(w => ({ wch: w }))

  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filename)
}

export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
