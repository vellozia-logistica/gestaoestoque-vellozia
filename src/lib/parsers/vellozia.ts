import Papa from 'papaparse'
import { VelloziaItem, Inconsistencia, ContextoLinha } from '@/types'

export interface VelloziaParseResult {
  items: VelloziaItem[]
  inconsistencias: Inconsistencia[]
}

export function parseVelloziaCSV(content: string): VelloziaParseResult {
  const rawLines = content.split('\n')

  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    quoteChar: '"',
  })

  const items: VelloziaItem[] = []
  const inconsistencias: Inconsistencia[] = []

  result.data.forEach((row, idx) => {
    const linhaNumero = idx + 2
    // header is rawLines[0], first data row is rawLines[1]
    const rawLineIdx = idx + 1

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
      const start = Math.max(0, rawLineIdx - 10)
      const end = Math.min(rawLines.length - 1, rawLineIdx + 10)
      const linhasContexto: ContextoLinha[] = Array.from({ length: end - start + 1 }, (_, k) => ({
        numero: start + k + 1,
        conteudo: rawLines[start + k],
        ehErro: start + k === rawLineIdx,
      }))

      inconsistencias.push({
        id: crypto.randomUUID(),
        arquivo: 'vellozia',
        linhaNumero,
        conteudo: [empresa, rawProduto, lote].filter(Boolean).join(' | '),
        motivo: problemas.join('; '),
        resolvido: false,
        formData: {
          empresa,
          produto,
          idProduto: idMatch ? parseInt(idMatch[1]) : 0,
          lote,
          dataValidade,
          dataFabricacao,
          diasVencimento: parseInt(diasStr) || 0,
          qtdeEstoque: isNaN(qtde) ? 0 : qtde,
        },
        linhasContexto,
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
