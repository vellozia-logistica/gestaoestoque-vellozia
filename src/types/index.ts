export interface SiacItem {
  codigo: string
  descricao: string
  unidade: string
  laboratorio: string
  lote: string
  vencimento: string
  estoque: number
}

export interface VelloziaItem {
  empresa: string
  produto: string
  idProduto: number
  lote: string
  dataValidade: string
  dataFabricacao: string
  diasVencimento: number
  qtdeEstoque: number
}

export interface IdProdutoGrupo {
  id: number
  descricaoProduto: string
  grupoProdutoId: number
}

export interface RelacionamentoSiacVellozia {
  grupoProduto: number
  idSiac: number
  descricaoVellozia: string
}

export interface EstoqueConsolidado {
  descricao: string
  idSiac: number
  grupoProduto: number
  lote: string
  vencimento: string
  estoqueGoiania: number
  filiais: Record<string, number>
  totalVellozia: number
  divergencia: boolean
}

export interface AppState {
  siacItems: SiacItem[]
  velloziaItems: VelloziaItem[]
  idProdutoGrupo: IdProdutoGrupo[]
  relacionamentos: RelacionamentoSiacVellozia[]
  sidebarCollapsed: boolean
  setSiacItems: (items: SiacItem[]) => void
  setVelloziaItems: (items: VelloziaItem[]) => void
  setIdProdutoGrupo: (items: IdProdutoGrupo[]) => void
  setRelacionamentos: (items: RelacionamentoSiacVellozia[]) => void
  setSidebarCollapsed: (v: boolean) => void
}
