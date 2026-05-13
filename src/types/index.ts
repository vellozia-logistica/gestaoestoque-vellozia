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

export interface ContextoLinha {
  numero: number
  conteudo: string
  ehErro: boolean
}

export interface Inconsistencia {
  id: string
  arquivo: 'siac' | 'vellozia' | 'relacionamento'
  linhaNumero: number
  conteudo: string
  motivo: string
  resolvido: boolean
  formData?: Record<string, string | number>
  linhasContexto?: ContextoLinha[]
}

export interface SidebarPasta {
  id: string
  label: string
}

export interface SidebarConfig {
  ordem: string[]                   // item IDs e "pasta:id" misturados em ordem
  pastas: SidebarPasta[]
  itemPasta: Record<string, string> // itemId → pastaId
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
  importadoEmSiac: string | null
  importadoEmVellozia: string | null
  importadoEmRelacionamento: string | null
  importadoEmIdProduto: string | null
  setSiacItems: (items: SiacItem[]) => void
  addSiacItem: (item: SiacItem) => void
  setVelloziaItems: (items: VelloziaItem[]) => void
  addVelloziaItem: (item: VelloziaItem) => void
  setIdProdutoGrupo: (items: IdProdutoGrupo[]) => void
  setRelacionamentos: (items: RelacionamentoSiacVellozia[]) => void
  addRelacionamento: (item: RelacionamentoSiacVellozia) => void
  addInconsistencias: (items: Inconsistencia[]) => void
  resolveInconsistencia: (id: string) => void
  clearInconsistencias: (arquivo?: 'siac' | 'vellozia' | 'relacionamento') => void
  limparInconsistenciasPendentes: () => void
  setSidebarCollapsed: (v: boolean) => void
  sidebarConfig: SidebarConfig
  setSidebarConfig: (config: SidebarConfig) => void
  setCurrentUser: (user: User | null) => void
  setUsers: (users: User[]) => void
  addUser: (user: User) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
  setImportadoEmSiac: (v: string | null) => void
  setImportadoEmVellozia: (v: string | null) => void
  setImportadoEmRelacionamento: (v: string | null) => void
  setImportadoEmIdProduto: (v: string | null) => void
}
