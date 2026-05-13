import { SiacItem, VelloziaItem, IdProdutoGrupo, RelacionamentoSiacVellozia, EstoqueConsolidado } from '@/types'

export function buildEstoqueConsolidado(
  siacItems: SiacItem[],
  velloziaItems: VelloziaItem[],
  idProdutoGrupo: IdProdutoGrupo[],
  relacionamentos: RelacionamentoSiacVellozia[]
): EstoqueConsolidado[] {
  // Mapa idProduto → grupoProdutoId
  const idToGrupo = new Map<number, number>()
  for (const r of idProdutoGrupo) {
    idToGrupo.set(r.id, r.grupoProdutoId)
  }

  // Mapa grupoProduto → idSiac
  const grupoToSiac = new Map<number, number>()
  const siacToDescricao = new Map<number, string>()
  for (const r of relacionamentos) {
    grupoToSiac.set(r.grupoProduto, r.idSiac)
    siacToDescricao.set(r.idSiac, r.descricaoVellozia)
  }

  // Mapa codigo siac (número) → SiacItem[]
  const siacByCode = new Map<number, SiacItem[]>()
  for (const s of siacItems) {
    const code = parseInt(s.codigo)
    if (!siacByCode.has(code)) siacByCode.set(code, [])
    siacByCode.get(code)!.push(s)
  }

  // Consolida por idSiac + lote
  const consolidado = new Map<string, EstoqueConsolidado>()

  // Processa itens SIAC (Goiânia)
  for (const s of siacItems) {
    const idSiac = parseInt(s.codigo)
    const key = `${idSiac}||${s.lote}`
    const grupoProduto = [...grupoToSiac.entries()].find(([, v]) => v === idSiac)?.[0] || 0

    if (!consolidado.has(key)) {
      consolidado.set(key, {
        descricao: siacToDescricao.get(idSiac) || s.descricao,
        idSiac,
        grupoProduto,
        lote: s.lote,
        vencimento: s.vencimento,
        estoqueGoiania: 0,
        filiais: {},
        totalVellozia: 0,
        divergencia: false,
      })
    }
    consolidado.get(key)!.estoqueGoiania += s.estoque
  }

  // Processa itens Vellozia
  for (const v of velloziaItems) {
    const grupoId = idToGrupo.get(v.idProduto)
    if (!grupoId) continue
    const idSiac = grupoToSiac.get(grupoId)
    if (!idSiac) continue

    const key = `${idSiac}||${v.lote}`
    if (!consolidado.has(key)) {
      consolidado.set(key, {
        descricao: siacToDescricao.get(idSiac) || v.produto,
        idSiac,
        grupoProduto: grupoId,
        lote: v.lote,
        vencimento: v.dataValidade,
        estoqueGoiania: 0,
        filiais: {},
        totalVellozia: 0,
        divergencia: false,
      })
    }

    const item = consolidado.get(key)!
    if (!item.filiais[v.empresa]) item.filiais[v.empresa] = 0
    item.filiais[v.empresa] += v.qtdeEstoque
    item.totalVellozia += v.qtdeEstoque
  }

  // Calcula divergências
  for (const item of consolidado.values()) {
    const velloziaGoiania = item.filiais['Goiania'] || item.filiais['Goiânia'] || 0
    item.divergencia = Math.abs(item.estoqueGoiania - velloziaGoiania) > 0.001
  }

  return Array.from(consolidado.values()).sort((a, b) => a.descricao.localeCompare(b.descricao))
}

export function getFiliais(velloziaItems: VelloziaItem[]): string[] {
  return [...new Set(velloziaItems.map(i => i.empresa))].sort()
}
