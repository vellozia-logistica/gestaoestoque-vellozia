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

export interface Inconsistencia {
  id: string
  arquivo: 'siac' | 'vellozia'
  linhaNumero: number
  conteudo: string
  motivo: string
  resolvido: boolean
}

export type UserRole = 'usuario' | 'desenvolvedor' | 'administrador'

export interface User {
  id: string
  email: string
  username: string
  passwordHash: string
  role: UserRole
  mustChangePassword: boolean
  createdAt: string
}

export interface AppState {
  siacItems: SiacItem[]
  velloziaItems: VelloziaItem[]
  idProdutoGrupo: IdProdutoGrupo[]
  relacionamentos: RelacionamentoSiacVellozia[]
  inconsistencias: Inconsistencia[]
  sidebarCollapsed: boolean
  users: User[]
  currentUser: User | null
  setSiacItems: (items: SiacItem[]) => void
  setVelloziaItems: (items: VelloziaItem[]) => void
  setIdProdutoGrupo: (items: IdProdutoGrupo[]) => void
  setRelacionamentos: (items: RelacionamentoSiacVellozia[]) => void
  addInconsistencias: (items: Inconsistencia[]) => void
  resolveInconsistencia: (id: string) => void
  clearInconsistencias: (arquivo?: 'siac' | 'vellozia') => void
  setSidebarCollapsed: (v: boolean) => void
  setCurrentUser: (user: User | null) => void
  setUsers: (users: User[]) => void
  addUser: (user: User) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
}
