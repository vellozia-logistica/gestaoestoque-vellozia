import Papa from 'papaparse'
import { RelacionamentoSiacVellozia, IdProdutoGrupo, Inconsistencia, ContextoLinha } from '@/types'

export interface RelacionamentoParseResult {
  items: RelacionamentoSiacVellozia[]
  inconsistencias: Inconsistencia[]
}

export function parseRelacionamentoCSV(content: string): RelacionamentoParseResult {
  const rawLines = content.split('\n')
  const result = Papa.parse<string[]>(content, { skipEmptyLines: true, delimiter: ';' })
  const rows = result.data.slice(1)

  const items: RelacionamentoSiacVellozia[] = []
  const inconsistencias: Inconsistencia[] = []

  rows.forEach((row, idx) => {
    const linhaNumero = idx + 2
    const rawLineIdx = idx + 1

    const cols = row.length >= 2 ? row : (row[0]?.split(';') ?? [])
    const grupoProduto = parseInt(cols[0])
    const idSiac = parseInt(cols[1])
    const descricaoVellozia = (cols[2] || '').trim()

    const problemas: string[] = []
    if (!grupoProduto || isNaN(grupoProduto)) problemas.push('Grupo Produto ausente ou inválido')
    if (!idSiac || isNaN(idSiac)) problemas.push('ID SIAC ausente ou inválido')

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
        arquivo: 'relacionamento',
        linhaNumero,
        conteudo: cols.filter(Boolean).join(' ; '),
        motivo: problemas.join('; '),
        resolvido: false,
        formData: {
          grupoProduto: isNaN(grupoProduto) ? 0 : grupoProduto,
          idSiac: isNaN(idSiac) ? 0 : idSiac,
          descricaoVellozia,
        },
        linhasContexto,
      })
      return
    }

    items.push({ grupoProduto, idSiac, descricaoVellozia })
  })

  return { items, inconsistencias }
}

export function parseIdProdutoGrupoCSV(content: string): IdProdutoGrupo[] {
  const result = Papa.parse<string[]>(content, { skipEmptyLines: true, delimiter: ';' })
  const rows = result.data.slice(1)

  return rows
    .map((row) => {
      const cols = row.length >= 2 ? row : (row[0]?.split(';') ?? [])
      const id = parseInt(cols[0])
      const descricaoProduto = (cols[1] || '').trim()
      const grupoProdutoId = parseInt(cols[2])
      if (!id || !grupoProdutoId) return null
      return { id, descricaoProduto, grupoProdutoId }
    })
    .filter(Boolean) as IdProdutoGrupo[]
}
