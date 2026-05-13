import Papa from 'papaparse'
import { VelloziaItem, Inconsistencia } from '@/types'

export interface VelloziaParseResult {
  items: VelloziaItem[]
  inconsistencias: Inconsistencia[]
}

export function parseVelloziaCSV(content: string): VelloziaParseResult {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    quoteChar: '"',
  })

  const items: VelloziaItem[] = []
  const inconsistencias: Inconsistencia[] = []

  result.data.forEach((row, idx) => {
    const linhaNumero = idx + 2
    const rawProduto = row['Produto'] || ''
    const empresa = row['Empresa'] || ''
    const lote = row['Lote'] || ''
    const dataValidade = row['Data de Validade'] || ''
    const dataFabricacao = row['Data de Fabricação'] || ''
    const qtdeStr = row['Qtde Estoque'] || '0'
    const diasStr = row['Dias até o vencimento'] || '0'

    const idMatch = rawProduto.match(/\(idProduto\s*=\s*(\d+)\)/i)
    const qtde = parseFloat(qtdeStr.replace(',', '.'))
    const produto = rawProduto.replace(/\s*\(idProduto\s*=\s*\d+\)/i, '').trim()

    const problemas: string[] = []
    if (!empresa) problemas.push('empresa ausente')
    if (!idMatch) problemas.push('idProduto não encontrado')
    if (!lote) problemas.push('lote ausente')
    if (isNaN(qtde)) problemas.push('quantidade inválida')

    if (problemas.length > 0) {
      inconsistencias.push({
        id: crypto.randomUUID(),
        arquivo: 'vellozia',
        linhaNumero,
        conteudo: [empresa, rawProduto, lote].filter(Boolean).join(' | '),
        motivo: problemas.join('; '),
        resolvido: false,
      })
      return
    }

    items.push({
      empresa,
      produto,
      idProduto: parseInt(idMatch![1]),
      lote,
      dataValidade,
      dataFabricacao,
      diasVencimento: parseInt(diasStr) || 0,
      qtdeEstoque: qtde,
    })
  })

  return { items, inconsistencias }
}
