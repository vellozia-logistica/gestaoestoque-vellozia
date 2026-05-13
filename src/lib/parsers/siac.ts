import { SiacItem, Inconsistencia, ContextoLinha } from '@/types'

export interface SiacParseResult {
  items: SiacItem[]
  inconsistencias: Inconsistencia[]
}

function buildContexto(lines: string[], errorIdx: number): ContextoLinha[] {
  const start = Math.max(0, errorIdx - 10)
  const end = Math.min(lines.length - 1, errorIdx + 10)
  return Array.from({ length: end - start + 1 }, (_, k) => ({
    numero: start + k + 1,
    conteudo: lines[start + k].replace(/�/g, '?'),
    ehErro: start + k === errorIdx,
  }))
}

export function parseSiacCSV(content: string): SiacParseResult {
  const lines = content.split('\n')
  const items: SiacItem[] = []
  const inconsistencias: Inconsistencia[] = []
  let current: Partial<SiacItem> | null = null

  const SKIP = /^(-{3,}|[-￿]{3,}|Relat|C.digo|Descri|16\.|P.gina|Continua|\s*$)/i

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const line = raw.replace(/�/g, '?')

    if (SKIP.test(line.trim())) continue

    if (line.includes('<< ESTOQUE TOTAL >>')) {
      const codigoMatch = line.match(/^(\d{7})/)
      if (!codigoMatch) {
        inconsistencias.push({
          id: crypto.randomUUID(),
          arquivo: 'siac',
          linhaNumero: i + 1,
          conteudo: raw.trim(),
          motivo: 'Código de produto não reconhecido',
          resolvido: false,
          linhasContexto: buildContexto(lines, i),
        })
        continue
      }
      const codigo = codigoMatch[1]
      const estoqueMatch = line.match(/<<\s*ESTOQUE TOTAL\s*>>\s*([\d.,]+)/)
      const estoque = estoqueMatch ? parseFloat(estoqueMatch[1].replace('.', '').replace(',', '.')) : 0
      const mid = line.substring(9, line.indexOf('<< ESTOQUE')).trim()
      const cols = mid.split(/\s{2,}/).filter(Boolean)
      current = {
        codigo,
        descricao: cols[0] || '',
        unidade: cols[1] || '',
        laboratorio: cols[2] || '',
        estoque,
        lote: '',
        vencimento: '',
      }
    } else if (current && /01\.\d/.test(line)) {
      const loteMatch = line.match(/01\.\d[\d.-]+\s+(\S+)\s+(\d{2}\/\d{2}\/\d{4})\s+([\d.,]+)/)
      if (!loteMatch) {
        const parcial = line.match(/01\.\d[\d.-]+\s+(\S+)(?:\s+(\d{2}\/\d{2}\/\d{4}))?/)
        inconsistencias.push({
          id: crypto.randomUUID(),
          arquivo: 'siac',
          linhaNumero: i + 1,
          conteudo: raw.trim(),
          motivo: 'Linha de lote com data ou quantidade inválida',
          resolvido: false,
          formData: {
            codigo: current.codigo || '',
            descricao: current.descricao || '',
            unidade: current.unidade || '',
            laboratorio: current.laboratorio || '',
            lote: parcial?.[1] || '',
            vencimento: parcial?.[2] || '',
            estoque: 0,
          },
          linhasContexto: buildContexto(lines, i),
        })
        continue
      }
      const lote = loteMatch[1]
      const vencimento = loteMatch[2]
      const qtd = parseFloat(loteMatch[3].replace('.', '').replace(',', '.'))

      const existing = items.find(it => it.codigo === current!.codigo && it.lote === '')
      if (existing) {
        existing.lote = lote
        existing.vencimento = vencimento
      } else {
        items.push({ ...(current as SiacItem), lote, vencimento, estoque: qtd })
      }
    }
  }

  const withLote = items.filter(i => i.lote !== '')
  const semLote = items.filter(i => i.lote === '' && i.estoque > 0)
  return { items: [...withLote, ...semLote], inconsistencias }
}
