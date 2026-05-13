import Papa from 'papaparse'
import { RelacionamentoSiacVellozia, IdProdutoGrupo } from '@/types'

export function parseRelacionamentoCSV(content: string): RelacionamentoSiacVellozia[] {
  const result = Papa.parse<string[]>(content, { skipEmptyLines: true })
  const rows = result.data.slice(1)

  return rows
    .map((row) => {
      const cols = row[0]?.split(';') || row
      const grupoProduto = parseInt(cols[0])
      const idSiac = parseInt(cols[1])
      const descricaoVellozia = cols[2] || ''
      if (!grupoProduto || !idSiac) return null
      return { grupoProduto, idSiac, descricaoVellozia }
    })
    .filter(Boolean) as RelacionamentoSiacVellozia[]
}

export function parseIdProdutoGrupoCSV(content: string): IdProdutoGrupo[] {
  const result = Papa.parse<string[]>(content, { skipEmptyLines: true })
  const rows = result.data.slice(1)

  return rows
    .map((row) => {
      const cols = row[0]?.split(';') || row
      const id = parseInt(cols[0])
      const descricaoProduto = cols[1] || ''
      const grupoProdutoId = parseInt(cols[2])
      if (!id || !grupoProdutoId) return null
      return { id, descricaoProduto, grupoProdutoId }
    })
    .filter(Boolean) as IdProdutoGrupo[]
}
