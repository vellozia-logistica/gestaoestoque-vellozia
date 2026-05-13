import Papa from 'papaparse'
import { VelloziaItem } from '@/types'

export function parseVelloziaCSV(content: string): VelloziaItem[] {
  const result = Papa.parse<string[]>(content, { skipEmptyLines: true })
  const rows = result.data.slice(1) // pula header

  return rows.map((row) => {
    const produto = row[1] || ''
    const idMatch = produto.match(/\(idProduto\s*=\s*(\d+)\)/)
    const idProduto = idMatch ? parseInt(idMatch[1]) : 0

    return {
      empresa: row[0]?.replace(/"/g, '').trim() || '',
      produto: produto.replace(/\s*\(idProduto\s*=\s*\d+\)/i, '').replace(/"/g, '').trim(),
      idProduto,
      lote: row[2]?.replace(/"/g, '').trim() || '',
      dataValidade: row[3]?.replace(/"/g, '').trim() || '',
      dataFabricacao: row[4]?.replace(/"/g, '').trim() || '',
      diasVencimento: parseInt(row[5] || '0') || 0,
      qtdeEstoque: parseFloat((row[6] || '0').replace(',', '.')) || 0,
    }
  }).filter(i => i.idProduto > 0)
}
