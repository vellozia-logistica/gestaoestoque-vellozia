import Papa from 'papaparse'
import { RelacionamentoSiacVellozia, IdProdutoGrupo } from '@/types'

export function parseRelacionamentoCSV(content: string): RelacionamentoSiacVellozia[] {
  const result = Papa.parse<string[]>(content, { skipEmptyLines: true, delimiter: ';' })
  const rows = result.data.slice(1)

  return rows
    .map((row) => {
      // se papa não dividiu (linha inteira em row[0]), tenta split manual
      const cols = row.length >= 2 ? row : (row[0]?.split(';') ?? [])
      const grupoProduto = parseInt(cols[0])
      const idSiac = parseInt(cols[1])
      const descricaoVellozia = (cols[2] || '').trim()
      if (!grupoProduto || !idSiac) return null
      return { grupoProduto, idSiac, descricaoVellozia }
    })
    .filter(Boolean) as RelacionamentoSiacVellozia[]
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
