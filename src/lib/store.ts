import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppState, SiacItem, VelloziaItem, IdProdutoGrupo, RelacionamentoSiacVellozia, Inconsistencia, User, SidebarConfig } from '@/types'

export const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  ordem: [
    'pasta:gestao-id',
    '/admin/usuarios',
  ],
  pastas: [{ id: 'gestao-id', label: 'GESTÃO DE ID' }],
  itemPasta: {
    '/': 'gestao-id',
    'Importar Arquivos': 'gestao-id',
    '/estoque': 'gestao-id',
    '/inconsistencias': 'gestao-id',
  },
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      siacItems: [],
      velloziaItems: [],
      idProdutoGrupo: [],
      relacionamentos: [],
      inconsistencias: [],
      sidebarCollapsed: false,
      users: [],
      currentUser: null,

      setSiacItems: (items: SiacItem[]) => set({ siacItems: items }),
      addSiacItem: (item: SiacItem) => set(s => ({ siacItems: [...s.siacItems, item] })),
      setVelloziaItems: (items: VelloziaItem[]) => set({ velloziaItems: items }),
      addVelloziaItem: (item: VelloziaItem) => set(s => ({ velloziaItems: [...s.velloziaItems, item] })),
      setIdProdutoGrupo: (items: IdProdutoGrupo[]) => set({ idProdutoGrupo: items }),
      setRelacionamentos: (items: RelacionamentoSiacVellozia[]) => set({ relacionamentos: items }),
      addRelacionamento: (item: RelacionamentoSiacVellozia) => set(s => ({ relacionamentos: [...s.relacionamentos, item] })),

      addInconsistencias: (items: Inconsistencia[]) =>
        set(s => ({ inconsistencias: [...s.inconsistencias.filter(i => i.arquivo !== items[0]?.arquivo), ...items] })),
      resolveInconsistencia: (id: string) =>
        set(s => ({ inconsistencias: s.inconsistencias.map(i => i.id === id ? { ...i, resolvido: true } : i) })),
      clearInconsistencias: (arquivo?: 'siac' | 'vellozia' | 'relacionamento') =>
        set(s => ({ inconsistencias: arquivo ? s.inconsistencias.filter(i => i.arquivo !== arquivo) : [] })),
      limparInconsistenciasPendentes: () =>
        set(s => ({ inconsistencias: s.inconsistencias.filter(i => i.resolvido) })),

      importadoEmSiac: null,
      importadoEmVellozia: null,
      importadoEmRelacionamento: null,
      importadoEmIdProduto: null,
      setImportadoEmSiac: (v) => set({ importadoEmSiac: v }),
      setImportadoEmVellozia: (v) => set({ importadoEmVellozia: v }),
      setImportadoEmRelacionamento: (v) => set({ importadoEmRelacionamento: v }),
      setImportadoEmIdProduto: (v) => set({ importadoEmIdProduto: v }),

      sidebarConfig: DEFAULT_SIDEBAR_CONFIG,
      setSidebarConfig: (config: SidebarConfig) => set({ sidebarConfig: config }),
      setSidebarCollapsed: (v: boolean) => set({ sidebarCollapsed: v }),
      setCurrentUser: (user: User | null) => set({ currentUser: user }),
      setUsers: (users: User[]) => set({ users }),
      addUser: (user: User) => set(s => ({ users: [...s.users, user] })),
      updateUser: (id: string, updates: Partial<User>) =>
        set(s => ({
          users: s.users.map(u => u.id === id ? { ...u, ...updates } : u),
          currentUser: s.currentUser?.id === id ? { ...s.currentUser, ...updates } : s.currentUser,
        })),
      deleteUser: (id: string) => set(s => ({ users: s.users.filter(u => u.id !== id) })),
    }),
    { name: 'gestao-estoque-storage' }
  )
)
