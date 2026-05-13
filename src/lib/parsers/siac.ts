import { SiacItem } from '@/types'

export function parseSiacCSV(content: string): SiacItem[] {
  const lines = content.split('\n')
  const items: SiacItem[] = []
  let current: Partial<SiacItem> | null = null

  for (const line of lines) {
    if (line.includes('<< ESTOQUE TOTAL >>')) {
      // Linha principal do produto
      const estoqueMatch = line.match(/<<\s*ESTOQUE TOTAL\s*>>\s*([\d.,]+)/)
      const estoque = estoqueMatch
        ? parseFloat(estoqueMatch[1].replace('.', '').replace(',', '.'))
        : 0

      // Extrai código (primeiros 7 chars sem espaços)
      const codigoMatch = line.match(/^(\d{7})/)
      const codigo = codigoMatch ? codigoMatch[1] : ''

      // Extrai descrição, unidade e laboratório por posição aproximada
      const partes = line.substring(9, line.indexOf('<< ESTOQUE')).trim()
      const colunas = partes.split(/\s{2,}/).filter(Boolean)
      const descricao = colunas[0] || ''
      const unidade = colunas[1] || ''
      const laboratorio = colunas[2] || ''

      current = { codigo, descricao, unidade, laboratorio, estoque, lote: '', vencimento: '' }
      items.push(current as SiacItem)
    } else if (current && line.trim() && !line.includes('---') && !line.includes('Código') && !line.includes('Relatório') && !line.includes('VELLOZIA') && !line.includes('Página') && !line.includes('Continua')) {
      // Linha de lote: "01.000001-01.01.01.02 LOTE DD/MM/YYYY QTD"
      const loteMatch = line.match(/01\.\d+.*?\s+(\S+)\s+(\d{2}\/\d{2}\/\d{4})\s+([\d.,]+)/)
      if (loteMatch) {
        const lote = loteMatch[1]
        const vencimento = loteMatch[2]
        const qtd = parseFloat(loteMatch[3].replace('.', '').replace(',', '.'))
        // Cria entrada por lote
        const idx = items.findIndex(i => i.codigo === current!.codigo && i.lote === '')
        if (idx !== -1 && items[idx].lote === '') {
          items[idx] = { ...items[idx], lote, vencimento }
        } else {
          items.push({ ...current as SiacItem, lote, vencimento, estoque: qtd })
        }
      }
    }
  }

  // Remove entradas sem lote (totais já foram expandidos)
  return items.filter(i => i.lote !== '' || i.estoque > 0)
}
